import { config } from '../../config';

export function getAvailableProducts() {
  return {
    method: 'GET',
    url: `${config.core.shoppingServiceUrl}/api/products`,
  };
}

export function getETHconversion({ token, currency }) {
  return {
    method: 'GET',
    url: `${config.core.ethConnectUrl}/api/${token}/price/${currency}`,
  };
}

export function getUserWalletItem({ symbol }) {
  return {
    method: 'GET',
    url: `${config.core.walletServiceUrl}/api/wallets/${symbol}`,
  };
}

export function getGasFee({ token }) {
  return {
    method: 'GET',
    url: `${config.core.ethConnectUrl}/api/${token}/fee`,
  };
}

export function createInvoice({ products }) {
  return {
    method: 'POST',
    url: `${config.core.shoppingServiceUrl}/api/invoices`,
    data: {
      products: products,
    },
  };
}

export function submitInvoiceForPayment({ invoiceId, passcode, symbol }) {
  return {
    method: 'POST',
    url: `${config.core.shoppingServiceUrl}/api/invoices/${invoiceId}/payments`,
    data: {
      walletPassword: passcode,
      coinSymbol: symbol,
    },
  };
}

export function queryInvoiceStatus({ invoiceId }) {
  return {
    method: 'GET',
    url: `${config.core.shoppingServiceUrl}/api/invoices/${invoiceId}`,
  };
}
