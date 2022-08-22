import { config } from '../../config';

export function getWalletMnemonicRecoveryPhrase() {
  return {
    url: `${config.core.walletServiceUrl}/api/wallets/mnemonic`,
  };
}

export function createWallet({ walletPasscode, walletMnemonicRecoveryPhrase }) {
  return {
    method: 'POST',
    url: `${config.core.walletServiceUrl}/api/wallets`,
    data: {
      mnemonic: walletMnemonicRecoveryPhrase,
      passcode: walletPasscode,
    },
  };
}
