import { useCallback, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

import imageLockInPrice from '../../assets/LoadingScreenGraphic.png';
import imageSubmitOrder from '../../assets/enter-passcode.png';
import imageProcessOrder from '../../assets/ProcessOrder.png';
import logo from '../../assets/nerd-logo.png';
import { routes } from '../../routes/routes';
import { CheckoutSteps } from '@nerdcoresdk/nerd-core-ui';
import { theme } from '../../theme/theme';
import { useAuth } from '../../hooks/useAuth';
import {
  submitInvoiceForPayment,
  queryInvoiceStatus,
} from '../../pages/purchase/shopping-service.resource';
import styles from '../../pages/purchase/purchase.module.css';

export default function CheckoutProcess({
  wallet,
  gasFee,
  indexProvider,
  invoice,
  orderTotal,
  setIndexProvider,
  setShowCheckoutProcessModal,
}) {
  const router = useRouter();
  const [etherScanData, setEtherScanData] = useState({});
  const { user, fetcher } = useAuth();
  const [wrongPassCodeError, setWrongPassCodeError] = useState(false);
  const [otherError, setOtherError] = useState(false);
  const [submitOrderLoading, setSubmitOrderLoading] = useState(false);
  const [paymentConfirmationReceived, setPaymentConfirmationReceived] = useState(false);

  useEffect(() => {
    setTimeout(() => setIndexProvider(1), 2000);
  }, []);

  useEffect(() => {
    let etherScanInterval;

    // if we already received payment confirmation, or already have an interval going, end here
    if (paymentConfirmationReceived || etherScanInterval) {
      return;
    }

    if (etherScanData.link) {
      etherScanInterval = setInterval(() => {
        fetcher(queryInvoiceStatus({ invoiceId: invoice.id })).then((data) => {
          if (data.paidAt) {
            setPaymentConfirmationReceived(true);
            setIndexProvider(4);
            setEtherScanData((prevData) => ({
              ...prevData,
              ...data,
            }));
            if (etherScanInterval) {
              clearInterval(etherScanInterval);
            }
          }
        });
      }, 10000);

      return () => {
        if (etherScanInterval) {
          clearInterval(etherScanInterval);
        }
      };
    }
  }, [etherScanData, invoice, setIndexProvider, user, fetcher]);

  //Third screen - submit order form
  const submitOrder = useCallback(
    (passcode) => {
      setSubmitOrderLoading(true);
      fetcher(
        submitInvoiceForPayment({
          passcode,
          invoiceId: invoice.id,
          symbol: 'ETH',
        })
      )
        .then((data) => {
          setSubmitOrderLoading(false);
          if (data.message === 'Incorrect password') {
            setWrongPassCodeError(true);
          } else if (data.message) {
            setOtherError(true);
          } else {
            setEtherScanData(data);
            setOtherError(false)
            setIndexProvider(3);
          }
        })
        .catch((err) => {
          setSubmitOrderLoading(false);
          return err;
        });
    },
    [invoice, setIndexProvider, fetcher]
  );

  const cancelOrder = useCallback(() => {
    //Cancel order at this time closes modal, returns user to purchase page, order still in order summary. Can be called on review order and submit order
    setIndexProvider(0); //go back to beginning of modal for next time they click preview order
    setShowCheckoutProcessModal(false);
  }, []);

  const handlePasscodeInputChange = useCallback((_newValue) => {
    setWrongPassCodeError(false);
  }, []);

  //Fourth screen - process order
  const viewTransactionStatus = useCallback(() => {
    var url = etherScanData.link;
    window.open(url, '_blank');
  }, [etherScanData]);

  //Fifth screen - confirmation
  const finalizeTransactionProcess = useCallback(() => {
    setIndexProvider(0); //go back to beginning of modal for next time they click preview order
    router.push(routes.dashboard.path);
  }, [router, setIndexProvider]);

  return (
    <section>
      <CheckoutSteps
        brandLogo={logo.src}
        brandName={theme.brandName}
        cancelOrderCallback={cancelOrder}
        confirmationGoToDashboardCallback={finalizeTransactionProcess}
        etherScanData={etherScanData}
        gasFee={gasFee}
        indexProvided={indexProvider}
        invoice={invoice}
        lockInPriceImgSrc={imageLockInPrice.src}
        orderTotal={orderTotal}
        processOrderHandleGoToDashboard={finalizeTransactionProcess}
        processOrderHandleShowStatus={viewTransactionStatus}
        processOrderImageSource={imageProcessOrder.src}
        submitOrderLoading={submitOrderLoading}
        submitOrderCallback={submitOrder}
        submitOrderImgSrc={imageSubmitOrder.src}
        timerEndedCancelModalButtonCallback={cancelOrder}
        wallet={wallet}
        createdAt={invoice.createdAt}
        wrongPassCodeError={wrongPassCodeError}
        passcodeInputOnChangeCallback={handlePasscodeInputChange}
      />
      {otherError && (
        <p className={styles.errorMessage}>
          Something went wrong and we were not able to process your payment. Please try
          again.
        </p>
      )}
    </section>
  );
}
