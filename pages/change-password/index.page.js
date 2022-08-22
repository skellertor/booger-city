import { useCallback, useState } from 'react';
import { useRouter } from 'next/router';

import { ResetPasswordForm, PasswordChanged, Modal } from '@nerdcoresdk/nerd-core-ui';

import { routes } from '../../routes/routes';
import { useAuth } from '../../hooks/useAuth';

import styles from './change-password.module.css';

export default function ChangePassword({}) {
  const router = useRouter();
  const { user, resetPassword } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmitPassword = useCallback(
    ({ password }) => {
      if (user.accessToken) {
        resetPassword({ user, password })
          .then(() => setShowConfirm(true))
          .catch((error) => setError(error));
      }
    },
    [user, resetPassword]
  );

  const handleConfirm = useCallback(() => {
    setShowConfirm(false);
    router.push(routes.dashboard.path);
  }, []);

  return (
    <section className={styles['reset-section']}>
      <div className={styles['reset-container']}>
        <ResetPasswordForm handleSubmitCallback={handleSubmitPassword} />
        {error.message && <div>{error.message}</div>}
      </div>
      {showConfirm && (
        <Modal
          closeModal={() => setShowConfirm(false)}
          modalClassName={styles['password-changed-modal']}
        >
          <div className={styles['reset-container']}>
            <PasswordChanged
              handleSuccessfulPasswordChangeCallback={handleConfirm}
              buttonText="Return to Dashboard"
            />
          </div>
        </Modal>
      )}
    </section>
  );
}

ChangePassword.protectedRoute = true;
