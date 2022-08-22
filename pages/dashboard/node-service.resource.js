import { config } from '../../config';

export function getUserPurchases() {
  return {
    method: 'get',
    url: `${config.core.shoppingServiceUrl}/api/purchases/summary`,
  };
}

export function getCoinConversion({ token, currency }) {
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

export function getTransactionHistory({ symbol, page, pageSize, sortBy, sortDir }) {
  let sortByParam = `${sortBy}+${sortDir}`;
  sortByParam = sortBy !== 'timestamp' ? `${sortByParam},timestamp+desc` : sortByParam;

  const queryParams = `?page=${page - 1}&pageSize=${pageSize}&sortBy=${sortByParam}`;
  return {
    method: 'GET',
    url: `${config.core.walletServiceUrl}/api/wallets/transactions/${symbol}${queryParams}`,
  };
}

export function getUserRewardsHistory({ sortBy, pageSize, page, sortDir }) {
  return {
    method: 'GET',
    url: `${config.core.walletServiceUrl}/api/rewards/?sortBy=${sortBy}+${sortDir}&pageSize=${pageSize}&page=${page}`,
  };
}

export function getUserRewardsTotals() {
  return {
    method: 'GET',
    url: `${config.core.walletServiceUrl}/api/rewards/summary`,
  };
}

export function sendTransaction({ amount, symbol, to, walletPassword }) {
  return {
    method: 'POST',
    url: `${config.core.walletServiceUrl}/api/transactions/transfer`,
    data: { amount, symbol, to, walletPassword },
  };
}

export function mintUserRewards(passCode) {
  return {
    method: 'POST',
    url: `${config.core.walletServiceUrl}/api/rewards/mint-rewards`,
    data: {
      passCode: passCode,
    },
  };
}
