import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { useAuth } from '../../hooks/useAuth';
import { routes } from '../../routes/routes';

export function EnrollmentRoute({ children }) {
  const router = useRouter();
  const { status, authStatuses, enrollmentPhase, enrollmentPhases, signout } = useAuth();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (status === authStatuses.SIGNED_OUT) {
      return router.push(routes.login.path);
    } else if (
      status === authStatuses.SIGNED_IN &&
      enrollmentPhase === enrollmentPhases.COMPLETED
    ) {
      return router.push(routes.dashboard.path);
    } else if (
      status === authStatuses.SIGNED_IN &&
      enrollmentPhase === enrollmentPhases.INCOMPLETE
    ) {
      setIsVerified(true);
    }
  }, [router, status, authStatuses, enrollmentPhase, enrollmentPhases, signout]);

  if (isVerified) {
    return children;
  } else {
    return null;
  }
}
