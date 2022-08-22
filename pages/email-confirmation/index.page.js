import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/Card/Card';

import { routes } from '../../routes/routes';

import styles from './email-confirmation.module.css';

export default function EmailConfirmation() {
  const router = useRouter();
  const { confirmEmail } = useAuth();

  const [error, setError] = useState({});
  const [routingMessage, setRoutingMessage] = useState('');

  useEffect(() => {
    if (router.query?.code) {
      confirmEmail({ code: router.query?.code })
        .then(() => {
          setRoutingMessage('Email confirmed. Rerouting you to the signin page');
          setTimeout(() => router.push(routes.login.path), 5000);
        })
        .catch(setError);
    }
  }, [router, confirmEmail]);

  return (
    <section className={styles['email-confirmation-section']}>
      <div>{routingMessage && <Card>{routingMessage}</Card>}</div>
      <Card>Email Confirmation</Card>
      {error.message && error.message}
    </section>
  );
}

EmailConfirmation.strictlyPublicRoute = true;
