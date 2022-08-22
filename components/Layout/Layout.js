import {useCallback, useState} from 'react';
import { useRouter } from 'next/router';
import {Button, EmailSent, ForgotPassword, Modal, SessionExpired} from '@nerdcoresdk/nerd-core-ui';

import { Navbar } from '../Navbar/Navbar';
import { theme } from '../../theme/theme';

import { useAuth } from '../../hooks/useAuth';

import styles from './layout.module.css';
import { routes } from '../../routes/routes';
import {config} from "../../config";
import emailSentImage from "../../assets/verify-email.svg";

export function Layout({ children }) {
  const {isIdleModalShowing, setIsIdleModalShowing, signin, sendForgotPasswordEmail} = useAuth();
  const router = useRouter();
  const [error, setError] = useState({});
  const [showForm, setShowForm] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');

  const handleSessionModalClose = useCallback(() => {
    setIsIdleModalShowing(false);
  }, [setIsIdleModalShowing, router]);

  const handleLoginCallback = useCallback(
    ({email, password}) => {
      localStorage.setItem('email', email);
      return signin({
        email,
        password,
      })
        .then(() => {
          router.replace(routes.agreements.path)
          setIsIdleModalShowing(false);
        })
        .catch((error) => {
          setError(error);
        });
    },
    [signin, router]
  );

  const handleRememberMe = useCallback(({email}) => {
    localStorage.setItem('email', email);
  }, []);

  const handleForgotPasswordClick = useCallback(() => {
    setShowForm(false);
    setShowConfirm(false);
    setShowModal(false);
  }, []);

  const handleSendForgotEmail = useCallback(({email}) => {
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

  const handleCloseForgot = useCallback(() => {
    setShowForm(true);
    setShowModal(false);
  }, []);


  return (
    <div>
      <Navbar brand={theme.brandName}/>
      <div className={styles['app-body']}>{children}</div>
      {isIdleModalShowing && (
        <>
          {showForm ? (
            <Modal closeModal={handleSessionModalClose}
                   modalClassName={styles.mobileModal}
            >
              <SessionExpired
                handleLoginCallback={handleLoginCallback}
                handleCancelCallback={handleSessionModalClose}
                errorMessage={error.message}
                handleForgotPasswordCallback={handleForgotPasswordClick}
                handleRememberMeCallback={handleRememberMe}
              />
            </Modal>
          ) : (
            <>
              {!showConfirm ? (
                <Modal
                  closeModal={handleCloseForgot}
                  modalClassName={styles.mobileModal}
                >
                  <ForgotPassword
                    handleSubmitCallback={handleSendForgotEmail}
                    handleCancelCallback={handleCloseForgot}
                  />
                </Modal>
              ) : (
                <>
                  {showModal && (
                    <Modal
                      closeModal={handleCloseForgot}
                      modalClassName={styles.mobileModal}
                    >
                      <EmailSent userEmail={email} image={emailSentImage.src}/>
                    </Modal>
                  )}
                </>
              )}
            </>
          )}
        </>
        )}
    </div>
  );
}


