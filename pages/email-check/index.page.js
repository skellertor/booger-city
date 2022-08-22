import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { useAuth } from '../../hooks/useAuth';
import { config } from '../../config';

import verifyImage from '../../assets/verify-email.svg';
import logo from '../../assets/nerd-logo.png';

import { VerifyEmail } from '@nerdcoresdk/nerd-core-ui';

import styles from './email-check.module.css';

export default function EmailCheck() {
  const { user, sendVerificationEmail } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');

  const handleDidNotReceiveEmail = useCallback(() => {
    sendVerificationEmail({
      email: email,
      link: config.brand.emailConfirmationLinkUrl,
    }).then(() => alert('New email sent'));
  }, [email, sendVerificationEmail]);

  useEffect(() => {
    const email = router.query?.email;
    email && setEmail(email);
  }, [router]);

  return (
    <section className={styles['email-check-section']}>
      <VerifyEmail
        userEmail={email}
        brandImage={logo.src}
        headingText="We need to verify your email address."
        image={verifyImage.src}
        handleDidNotReceiveEmailCallback={handleDidNotReceiveEmail}
      />
    </section>
  );
}

EmailCheck.strictlyPublicRoute = true;
