import { useCallback, useState } from 'react';
import { useRouter } from 'next/router';

import { ResetPasswordForm, PasswordChanged, Modal } from '@nerdcoresdk/nerd-core-ui';

import { routes } from '../../routes/routes';
import { useAuth } from '../../hooks/useAuth';
import { config } from '../../config';

import styles from './reset-password.module.css';

export default function ResetPassword({}) {
  const router = useRouter();
  const { resetPasswordFromEmail, sendForgotPasswordEmail } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmitPassword = useCallback(
    ({ password }) => {
      const userEmail = localStorage.getItem('email');
      resetPasswordFromEmail({
        email: userEmail,
        code: router.query?.code,
        password: password,
      })
        .then(() => setShowConfirm(true))
        .catch((error) => {
          // if the reset link has already been used, we'll get a 404 back from the backend
          if (error?.error?.response?.status === 404) {
            setError({
              message:
                'That reset link has already been used. We will send a new reset link to your email',
            });
            sendForgotPasswordEmail({
              email: userEmail,
              link: config.brand.emailForgotPasswordLinkUrl,
            }).catch((error) => setError(error));
          } else {
            setError(error);
          }
        });
    },
    [router, resetPasswordFromEmail, sendForgotPasswordEmail]
  );

  const handleConfirmLogin = useCallback(() => {
    setShowConfirm(false);
    router.push(routes.login.path);
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
              handleSuccessfulPasswordChangeCallback={handleConfirmLogin}
              buttonText="Log in"
            />
          </div>
        </Modal>
      )}
    </section>
  );
}
