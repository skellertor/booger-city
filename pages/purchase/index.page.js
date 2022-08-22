import { useCallback, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { debounce } from 'lodash';

import { Shopping, Modal, AddMoreETH, NodeAgreements } from '@nerdcoresdk/nerd-core-ui';

import logo from '../../assets/nerd-logo.png';
import { theme } from '../../theme/theme';
import { routes } from '../../routes/routes';
import { useAuth } from '../../hooks/useAuth';
import {
  getAvailableProducts,
  getETHconversion,
  createInvoice,
  getGasFee,
  getUserWalletItem,
} from './shopping-service.resource';
import styles from './purchase.module.css';
import CheckoutProcess from '../../components/CheckoutProcess/CheckoutProcess';

const shoppingFormText = {
  productHeadingText: 'Purchase Nodes',
  productNoticeText:
    'Currently our system supports orders of only one node type at a time. Please select either Smart Nodes (up to 10 quantity) or Lite Nodes (up to 999 quantity). If you would like to purchase both node types, simply complete an order for one and then return to complete an order for the next node type. If you need to select the other node type, lower quantity to 0 for your current node selection and the other node type will become available to select quantity.',
};

export default function Purchase() {
  const { user, fetcher, fetchNodePurchaseAgreements, submitUserAgreements } = useAuth();
  const router = useRouter();

  const [error, setError] = useState({});
  const [products, setProducts] = useState([]);
  const [gasFee, setGasFee] = useState({});
  const [wallet, setWallet] = useState({});
  const [walletIsLoading, setWalletIsLoading] = useState(true);

  const [clientSelectedProducts, setClientSelectedProducts] = useState([]);
  const [invoice, setInvoice] = useState({});
  const [orderTotal, setOrderTotal] = useState({});
  const [indexProvider, setIndexProvider] = useState(0); //set index for checkout process modal as steps are completed

  const [nodeAgreements, setNodeAgreements] = useState([]);

  const [showAddWalletFundsModal, setShowAddWalletFundsModal] = useState(false);
  const [showAgreementsModal, setShowAgreementsModal] = useState(false);
  const [showCheckoutProcessModal, setShowCheckoutProcessModal] = useState(false);

  const handleFetchProducts = useCallback(async ({ currentETHConversion }) => {
    const availableProducts = await fetcher(getAvailableProducts());

    return availableProducts.map((product) => {
      const eachProduct = product;
      eachProduct.ETH = (product.price / currentETHConversion).toFixed(6);
      return eachProduct;
    });
  }, []);

  const handleFetchETHWallet = useCallback(
    async ({ currentETHConversion }) => {
      if (!user || !user.accessToken) {
        return {};
      }

      const userWallet = await fetcher(getUserWalletItem({ symbol: 'ETH' })).catch(
        (error) => ({})
      );

      return userWallet.canSendFunds
        ? {
            id: userWallet.address,
            name: theme.brandName,
            icon: userWallet.icon,
            totalUSD: parseFloat(
              (Number(userWallet.balance) * currentETHConversion).toFixed(2)
            ),
            totalETH: parseFloat(Number(userWallet.balance).toFixed(6)),
            valid: userWallet.canSendFunds,
          }
        : {};
    },
    [user, fetcher]
  );

  const handleFetchGasFee = useCallback(async () => {
    const currentGasFee = await fetcher(getGasFee({ token: 'eth' }));

    setGasFee({
      USD: parseFloat(currentGasFee.usd.fast.toFixed(2)),
      ETH: currentGasFee.fast,
    });
  }, [fetcher]);

  const updateDataFields = useCallback(() => {
    fetcher(
      getETHconversion({
        token: 'eth',
        currency: 'usd',
      })
    )
      .then((currentETHConversion) =>
        Promise.all([
          handleFetchProducts({ currentETHConversion }),
          handleFetchETHWallet({ currentETHConversion }),
        ])
      )
      .then(([productList, wallet]) => {
        setProducts(productList);
        setWallet(wallet);
      })
      .catch((error) => {
        setError({ message: 'Experiencing difficulties. Try again later' });
      })
      .finally(() => setWalletIsLoading(false));
  }, [handleFetchProducts, handleFetchETHWallet, fetcher]);

  const debouncedUpdateDataFields = debounce(updateDataFields, 2000);

  useEffect(() => {
    updateDataFields();
    handleFetchGasFee();

    const fetchWalletInterval = setInterval(() => {
      updateDataFields();
      handleFetchGasFee();
    }, 300000);

    return function cleanup() {
      if (fetchWalletInterval) {
        clearInterval(fetchWalletInterval);
      }
    };
  }, [updateDataFields]);

  //Step one -user clicks preview order, save products and fetch node agreements, user must sign before they can purchase

  const handlePreviewOrder = useCallback(
    async (products) => {
      // save products list for after agreements are signed
      setClientSelectedProducts(products);

      const agreements = await fetchNodePurchaseAgreements({
        token: user.accessToken,
      });
      // this massages the data into the format the component expects
      const unsignedAgreements = (agreements?.unsignedAgreements || []).map(
        (agreement) => ({
          ...agreement,
          id: agreement.agreementId,
        })
      );
      setNodeAgreements(unsignedAgreements);
      setShowAgreementsModal(true);
    },
    [fetchNodePurchaseAgreements, user.accessToken]
  );

  const handleCreateInvoice = useCallback(async () => {
    const productsList = clientSelectedProducts.map((product) => ({
      productId: product.id,
      quantity: product.purchaseQuantity,
    }));

    const returnedInvoice = await fetcher(createInvoice({ products: productsList }));

    // create a dictionary map of currency codes for each product id
    let currencyCodeForProductIdMap = clientSelectedProducts.reduce((map, product) => {
      map[product.id] = product.currencyCode;
      return map;
    }, {});

    // massage the data into the format the components expect
    returnedInvoice.lineItems = returnedInvoice.lineItems.map((lineItem) => ({
      ...lineItem,
      totalCurrency: lineItem.priceUSD * lineItem.qty,
      totalETH: parseFloat(Number(lineItem.priceETH * lineItem.qty).toFixed(5)),
      purchaseQuantity: lineItem.qty,
      currencyCode: currencyCodeForProductIdMap[lineItem.productId],
    }));

    return returnedInvoice;
  }, [clientSelectedProducts, fetcher]);

  //user invoice has totals per line item, convert to order total object including gas fees
  const createOrderTotal = useCallback(
    (productList) => {
      const currentOrderTotal = productList.reduce(
        (acc, product) => {
          acc.totalCurrency += product.totalCurrency;
          acc.totalETH += product.totalETH;
          acc.totalQuantity += product.qty;
          return acc;
        },
        {
          totalCurrency: gasFee.USD,
          totalETH: gasFee.ETH,
          totalQuantity: 0,
          totalCurrencyCode: 'USD',
        }
      );
      return currentOrderTotal;
    },
    [gasFee]
  );

  //Step two - submit agreements and request invoice from api, open modal for lock in price page
  const handleSubmitAgreements = useCallback(
    async (agreements) => {
      const signedFormsData = agreements.map((form) => ({
        agreementId: form.agreementId,
        agreementVersionId: form.agreementVersionId,
        acknowledgmentImageData: form.data,
      }));
      submitUserAgreements({ token: user.accessToken, signedForms: signedFormsData })
        .then(() => handleCreateInvoice())
        .then((invoice) => {
          setInvoice(invoice);
          const newOrderTotal = createOrderTotal(invoice.lineItems);
          setOrderTotal(newOrderTotal);
          setShowAgreementsModal(false);
          setShowCheckoutProcessModal(true);
        })
        .catch((e) =>
          setError({
            message:
              'Experiencing difficulties setting up your order. Please try again later',
          })
        );
    },
    [submitUserAgreements, user, handleCreateInvoice, createOrderTotal]
  );

  const addETHClick = useCallback(() => {
    setShowAddWalletFundsModal((prevState) => !prevState);
  }, [setShowAddWalletFundsModal]);

  const setupWalletClick = useCallback(() => {
    router.push(routes.setupWallet.path);
  }, [router]);

  const loginClick = useCallback(() => {
    router.push(`${routes.login.path}?shopping=true`);
  }, [router]);

  return (
    <section className={styles['purchase-section']}>
      {error.message ? (
        <div className={styles.errorMessage}>{error.message}</div>
      ) : (
        <div className={styles['purchase-component']}>
          <Shopping
            brandImage={logo.src}
            brandName={theme.brandName}
            user={user}
            wallet={wallet}
            products={products}
            gasFee={gasFee}
            handlePreviewOrderCallback={handlePreviewOrder}
            handleAddETHCallback={addETHClick}
            handleSetupWalletCallback={setupWalletClick}
            handleLoginCallback={loginClick}
            updateDataFields={debouncedUpdateDataFields}
            walletIsLoading={walletIsLoading}
            shoppingFormText={shoppingFormText}
          />
          {showAddWalletFundsModal && (
            <Modal closeModal={addETHClick} modalClassName={styles.addFundsModal}>
              <AddMoreETH
                wallet={wallet}
                handleDoneCallback={addETHClick}
                handleCancelCallback={addETHClick}
                headerText="Add More Funds To Your Wallet"
                bodyText="Send Ethereum to your Nerd Wallet by either scanning the QR code or simply copying and pasting this wallet address into the send to/recipient address of a compatible wallet application.  After successfully sending, please click done below and refresh the purchase page every few minutes until you see your funds appear.  This usually takes 5-10 minutes, although it could take longer if the network is busy."
                bodyTextSecond="As a reminder, Smart Node prices increase as more are sold. Given the fact that Ethereum's price and gas fees are volatile, we recommend transferring at least 10% more than you anticipate needing to complete your purchase.  Any remaining Ethereum in your Nerd Wallet after making a purchase can be used to mint your node's digital rewards into Nerd coins on the Ethereum Blockchain."
              />
            </Modal>
          )}
          {showAgreementsModal && (
            <Modal
              modalClassName={styles.agreementsModal}
              closeModal={() => setShowCheckoutProcessModal(false)}
            >
              <NodeAgreements
                nodeAgreements={nodeAgreements}
                submitButtonCallback={handleSubmitAgreements}
                cancelButtonCallback={() => setShowAgreementsModal(false)}
              />
            </Modal>
          )}
          {showCheckoutProcessModal && (
            <Modal modalClassName={styles.checkoutModal}>
              <CheckoutProcess
                wallet={wallet}
                gasFee={gasFee}
                indexProvider={indexProvider}
                invoice={invoice}
                orderTotal={orderTotal}
                setIndexProvider={setIndexProvider}
                setShowCheckoutProcessModal={setShowCheckoutProcessModal}
              />
            </Modal>
          )}
        </div>
      )}
    </section>
  );
}
