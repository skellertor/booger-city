import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { useAuth } from '../../hooks/useAuth';

export function StrictlyPublicRoute({ children }) {
  const router = useRouter();
  const { status, authStatuses, enrollmentPhase, enrollmentPhases, signout } = useAuth();
  const [isVerified, setIsVerified] = useState(false);

  if (status === authStatuses.SIGNED_OUT) {
    return children;
  } else {
    return null;
  }
}
