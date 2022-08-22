import { useCallback, useState } from 'react';
import { useRouter } from 'next/router';

import { Benefit, Signup as SignupForm } from '@nerdcoresdk/nerd-core-ui';

import { theme } from '../../theme/theme';
import { config } from '../../config';
import { routes } from '../../routes/routes';
import { useAuth } from '../../hooks/useAuth';
import logo from '../../assets/nerd-logo.png';
import benefitImage from '../../assets/createAccountImage.png';

import styles from './signup.module.css';

export default function Signup() {
  const router = useRouter();
  const { signup } = useAuth();

  const [error, setError] = useState({ message: '' });

  const handleSubmit = useCallback(
    ({ name, email, password, newsletter }) => {
      const sponsorNumber = router.query.sponsor;
      const encodedEmail = encodeURIComponent(email);
      return signup({
        name,
        email,
        password,
        confirmationLinkUrl: config.brand.emailConfirmationLinkUrl,
        sponsor: sponsorNumber,
        newsletter: newsletter,
      })
        .then(() => router.push(`${routes.emailCheck.path}?email=${encodedEmail}`))
        .catch(setError);
    },
    [router, signup]
  );

  const handleRedirectToLogin = useCallback(() => {
    router.push(routes.login.path);
  }, [router]);

  return (
    <>
      <div className={styles['error-message-container']}>
        {error.message && error.message}
      </div>
      <section className={styles['signup-section']}>
        <div className={styles['signup-container']}>
          <SignupForm
            brandImage={logo.src}
            callToActionText={`Join over 100,000 supporters already using ${theme.brandName}!`}
            brandName={theme.brandName}
            handleSubmitCallback={handleSubmit}
            handleRedirectToLoginCallback={handleRedirectToLogin}
          />
        </div>
        <div className={styles['benefit-container']}>
          <Benefit
            benefitImage={benefitImage.src}
            headingText={`Purchase nodes. Earn rewards. Be the blockchain.`}
            bodyText="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
          />
        </div>
      </section>
    </>
  );
}

Signup.strictlyPublicRoute = true;
