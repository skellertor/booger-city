import { createContext, useEffect, useState, useMemo, useCallback } from 'react';
import { onIdTokenChanged } from 'firebase/auth';
import { configure } from '@nerdcoresdk/nerd-core-auth';
import jwtDecode from 'jwt-decode';
import { useIdleTimer, workerTimers } from 'react-idle-timer';

import { config } from '../config';
import { useFetcher } from '../hooks/useFetcher';
import { setTokenRefreshInterval } from '../utils';

const {
  signup,
  signin,
  signout,
  sendVerificationEmail,
  confirmEmail,
  fetchUserAgreements,
  fetchNodePurchaseAgreements,
  submitUserAgreements,
  resetPassword,
  resetPasswordFromEmail,
  sendForgotPasswordEmail,
  firebaseAuth,
  refreshTheToken,
} = configure({
  environment: config.environment,
  firebaseConfig: config.firebase,
  brandConfig: config.brand,
  coreConfig: config.core,
});

const authStatuses = {
  PENDING: 'pending',
  SIGNED_IN: 'signedIn',
  SIGNED_OUT: 'signedOut',
};

const enrollmentPhases = {
  PENDING: 'pending',
  INCOMPLETE: 'incomplete',
  COMPLETED: 'completed',
};

const times = {
  IDLE_TIMEOUT: 1000 * 60 * 15,
  //👇 DO NOT SET FOR MORE THAN 59 MINUTES (firebase default token expirtation is 60 minutes)
  TOKEN_REFRESH_RATE: 1000 * 60 * 50,
};

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState({});
  const [status, setStatus] = useState(authStatuses.PENDING);
  const [enrollmentPhase, setEnrollmentPhase] = useState(enrollmentPhases.PENDING);
  const [refreshInterval, setRefreshInterval] = useState('');
  const [isIdleModalShowing, setIsIdleModalShowing] = useState(false);

  const handleIdleSession = useCallback(() => {
    if (status === authStatuses.SIGNED_IN) {
      signout();
      setIsIdleModalShowing(true);
    }
  }, [status, setIsIdleModalShowing]);

  const {
    start: startIdleTimer,
    reset: resetIdleTimer,
    getRemainingTime: getRemainingIdleTime,
  } = useIdleTimer({
    timers: workerTimers,
    timeout: times.IDLE_TIMEOUT,
    startManually: true,
    stopOnIdle: true,
    onIdle: handleIdleSession,
  });

  const handleDestroySession = useCallback(() => {
    resetIdleTimer();
  }, [resetIdleTimer]);

  const fetcher = useFetcher({user});

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(firebaseAuth, (_user) => {
      if (!_user) {
        handleDestroySession();
        refreshInterval && clearInterval(refreshInterval);
        setRefreshInterval('');
        setUser({});
        setStatus(authStatuses.SIGNED_OUT);
        setEnrollmentPhase(enrollmentPhases.PENDING);
      } else {
        const {emailVerified, permissions, agreementsSigned, exp} = jwtDecode(
          _user.accessToken
        );
        if (emailVerified && permissions) {
          setUser(_user);
          setStatus(authStatuses.SIGNED_IN);
          // we don't want to start the timer over if we get here from a token refresh
          getRemainingIdleTime() === times.IDLE_TIMEOUT && startIdleTimer();
          const tokenRefreshInterval = setTokenRefreshInterval.getInstance({
            user: _user,
            refreshTheToken,
            currentExpiration: exp,
            tokenRefreshRate: times.TOKEN_REFRESH_RATE,
          });
          setRefreshInterval(tokenRefreshInterval);
          agreementsSigned
            ? setEnrollmentPhase(enrollmentPhases.COMPLETED)
            : setEnrollmentPhase(enrollmentPhases.INCOMPLETE);
        }
      }
    });
    return () => unsubscribe();
  }, [
    setUser,
    setStatus,
    status,
    setEnrollmentPhase,
    refreshInterval,
    startIdleTimer,
    handleDestroySession,
    getRemainingIdleTime,
  ]);

  const value = useMemo(
    () => ({
      user,
      signup,
      signin,
      signout,
      status,
      sendVerificationEmail,
      confirmEmail,
      authStatuses,
      fetchUserAgreements,
      fetchNodePurchaseAgreements,
      submitUserAgreements,
      resetPassword,
      resetPasswordFromEmail,
      sendForgotPasswordEmail,
      refreshTheToken,
      enrollmentPhase,
      enrollmentPhases,
      fetcher,
      isIdleModalShowing,
      setIsIdleModalShowing,
    }),
    [user, status, enrollmentPhase, fetcher, isIdleModalShowing, setIsIdleModalShowing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
