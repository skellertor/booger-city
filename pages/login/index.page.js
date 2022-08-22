import { useCallback, useState } from 'react';
import { useRouter } from 'next/router';

import { theme } from '../../theme/theme';
import { routes } from '../../routes/routes';
import logo from '../../assets/nerd-logo.png';
import emailSentImage from '../../assets/verify-email.svg';
import { useAuth } from '../../hooks/useAuth';
import { config } from '../../config';
import {
  ForgotPassword,
  EmailSent,
  Modal,
  LogIn as LoginForm,
  Button,
} from '@nerdcoresdk/nerd-core-ui';

import styles from './login.module.css';

export default function Login() {
  const router = useRouter();
  const { signin, sendForgotPasswordEmail, sendVerificationEmail } = useAuth();
  const [error, setError] = useState({});
  const [showForm, setShowForm] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [email, setEmail] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [invalidPassword, setInvalidPassword] = useState(false);
  const customerSupportLink = 'http://localhost:3000';

  const handleSendForgotEmail = useCallback(({ email }) => {
    localStorage.setItem('email', email);
    sendForgotPasswordEmail({
      email: email,
      link: config.brand.emailForgotPasswordLinkUrl,
    })
      .then(() => {
        setEmail(email);
        setShowConfirm(true);
        setShowModal(true);
      })
      .catch((error) => console.log(error));
  }, []);

  const handleForgotPasswordClick = useCallback(() => {
    setShowForm(false);
    setShowConfirm(false);
    setShowModal(false);
  }, []);

  const handleCloseForgot = useCallback(() => {
    setShowForm(true);
    setShowModal(false);
  }, []);

  const handleCreateUser = useCallback(() => {
    router.push(routes.signup.path);
  }, []);

  const handleRememberMe = useCallback(({ email }) => {
    localStorage.setItem('email', email);
  }, []);

  const handleDidNotReceiveEmail = useCallback(() => {
    const email = localStorage.getItem('email');
    sendVerificationEmail({
      email: email,
      link: config.brand.emailConfirmationLinkUrl,
    }).then(() => alert('New email sent'));
  }, [sendVerificationEmail]);

  const handleSubmit = useCallback(
    ({ email, password }) => {      
      localStorage.setItem('email', email);
      return signin({
        email,
        password,
      })
        .then(() => router.replace(routes.agreements.path))
        .catch((error) => {
          if (error.message === 'Email not verified') {
            error.message = (
              <div className={styles['error-message-container']}>
                <div className={styles['error-message']}>Email not verified</div>
                <Button kind="link" onClick={handleDidNotReceiveEmail}>
                  send confirmation again?
                </Button>
              </div>
            );
          } else if (error.message === "That wasn't quite right... try again?") {
            setInvalidPassword(true);
          }
          setError(error);
        });
    },
    [signin, router, handleDidNotReceiveEmail]
  );

  return (
    <section className={styles['signin-section']}>
      <div className={styles['signin-container']}>
        {showForm ? (
          <>
            <LoginForm
              brandName={theme.brandName}
              createAccountCallback={handleCreateUser}
              handleForgotPasswordCallback={handleForgotPasswordClick}
              handleSubmitCallback={handleSubmit}
              handleRememberMeCallback={handleRememberMe}
              invalidPassword={invalidPassword}
              clearInvalidPasswordCallback= {() => {setInvalidPassword(false)}}
            />
            {error.message && error.message}
            <p className={styles.needHelpText}>
              Need Help?{' '}
              <span className={styles.supportHelpText}>
                <a href={customerSupportLink}></a>Contact Support
              </span>
            </p>
          </>
        ) : (
          <>
            {!showConfirm ? (
              <div
                className={styles.forgotPasswordModal}
              >
                <ForgotPassword
                  handleSubmitCallback={handleSendForgotEmail}
                  handleCancelCallback={handleCloseForgot}
                />
              </div>
            ) : (
              <>
                {showModal && (
                  <Modal
                    closeModal={handleCloseForgot}
                    modalClassName={styles.emailSentModal}
                  >
                    <EmailSent userEmail={email} image={emailSentImage.src} />
                  </Modal>
                )}
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}

Login.strictlyPublicRoute = true;
