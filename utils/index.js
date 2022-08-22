const TEN_MINUTES_IN_MILLIS = 600000;

export function isBrowser() {
  return typeof window !== 'undefined';
}

/********************************************************************************
 * token refresh interval singleton only allows one instance to ever be created *
 *******************************************************************************/
export const setTokenRefreshInterval = (() => {
  let sessionInterval = null;

  return {
    // tokenRefreshRate needs to be less than 59 minutes
    getInstance({
      user,
      refreshTheToken,
      currentExpiration,
      tokenRefreshRate = TEN_MINUTES_IN_MILLIS,
    }) {
      const tokenTimeRemaining = Date.now() - currentExpiration;
      if (tokenTimeRemaining < tokenRefreshRate) {
        refreshTheToken({ user });
        console.info(
          `token has been refreshed due to the current expiration time ${currentExpiration} is before the scheduled refresh`
        );
      }
      if (sessionInterval) return sessionInterval;
      else {
        sessionInterval = setInterval(() => {
          refreshTheToken({ user });
        }, tokenRefreshRate);
        console.info(
          `token refresh interval ID:${sessionInterval} is every ${tokenRefreshRate} milliseconds`
        );
        return sessionInterval;
      }
    },
  };
})();
