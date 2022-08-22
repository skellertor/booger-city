import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';

import { Agreements as AgreementsForm } from '@nerdcoresdk/nerd-core-ui';

import { useAuth } from '../../hooks/useAuth';
import { routes } from '../../routes/routes';

import styles from './agreements.module.css';

export default function Agreements() {
  const router = useRouter();
  const {
    user,
    fetchUserAgreements,
    submitUserAgreements,
    refreshTheToken,
    enrollmentPhase,
    enrollmentPhases,
  } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [forms, setForms] = useState([]);
  const [error, setError] = useState({});

  useEffect(() => {
    if (enrollmentPhase !== enrollmentPhases.COMPLETED) {
      const token = user.accessToken;
      fetchUserAgreements({ token })
        .then((agreements) => setForms(agreements?.unsignedAgreements))
        .finally(() => setIsLoading(false));
    } else {
      router.push(routes.dashboard.path);
    }
  }, []);

  const handleSubmit = useCallback(
    async (signedForms) => {
      const token = user?.accessToken;
      const signedFormsData = signedForms.map((form) => ({
        agreementId: form.agreementId,
        agreementVersionId: form.agreementVersionId,
        acknowledgmentImageData: form.signatureImageData,
      }));
      submitUserAgreements({ token, signedForms: signedFormsData })
        .then(() => refreshTheToken({ user }))
        .catch((error) => {
          setError({ message: 'Something Went Wrong' });
        });
    },
    [submitUserAgreements, refreshTheToken, user]
  );

  return isLoading ? null : (
    <section className={styles['agreements']}>
      <div className={styles['canvasWrapper']}>
        <AgreementsForm formsList={forms} handleSubmitCallback={handleSubmit} />
        {error.message && (
          <div className={styles['content']}>
            <p className={styles['intro']}>{error.message}</p>
          </div>
        )}
      </div>
    </section>
  );
}

Agreements.enrollmentRoute = true;
