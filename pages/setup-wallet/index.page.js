import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getWalletMnemonicRecoveryPhrase, createWallet } from './setup-wallet.resource';
import { theme } from '../../theme/theme';
import {
  CreateWalletSteps,
  CreatePasscode,
  DisplayRecoveryPhrase,
  ConfirmRecoveryPhrase,
  SetupProcessing,
  ModalWithTextAndButton,
} from '@nerdcoresdk/nerd-core-ui';
import { useAuth } from '../../hooks/useAuth';
import { routes } from '../../routes/routes';
import setupProcessingImg from '../../public/setupProcessingImage.png';
import styles from './setup-wallet.module.css';

export default function SetupWallet() {
  const { user, fetcher } = useAuth();
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [walletPasscode, setWalletPasscode] = useState('');
  const [walletMnemonicRecoveryPhrase, setWalletMnemonicRecoveryPhrase] = useState('');
  const [showCreatingWalletScreen, setShowCreatingWalletScreen] = useState(false);
  const [showCreateWalletResultModal, setShowCreateWalletResultModal] = useState(false);
  const [createWalletResultText, setCreateWalletResultText] = useState('');

  // when the component loads, get a mnemonic 12 word recovery phrase
  useEffect(() => {
    fetcher(getWalletMnemonicRecoveryPhrase()).then(({ mnemonic }) => {
      setWalletMnemonicRecoveryPhrase(mnemonic);
    });
  }, [fetcher]);

  function navigateToDashboard() {
    router.push(routes.dashboard.path);
  }

  function createPasscodeCallback(passcode) {
    setWalletPasscode(passcode);
    setCurrentStepIndex(1);
  }

  async function createWalletHandler() {
    setShowCreatingWalletScreen(true);
    await fetcher(createWallet({ walletPasscode, walletMnemonicRecoveryPhrase }))
      .then(() =>
        setCreateWalletResultText(
          `Your ${theme.brandName} Wallet is now set up! You can now send, receive, and hold token balances.`
        )
      )
      .catch(() =>
        setCreateWalletResultText(
          `Sorry, there was an issue trying to create your wallet. Please try again.`
        )
      );
    setShowCreatingWalletScreen(false);
    setShowCreateWalletResultModal(true);
  }

  if (showCreateWalletResultModal) {
    return (
      <ModalWithTextAndButton
        modalText={createWalletResultText}
        buttonText="Go To Dashboard"
        handleButtonCallback={navigateToDashboard}
      />
    );
  }

  if (showCreatingWalletScreen) {
    return (
      <SetupProcessing
        processingText={`Please wait, this page will refresh when your ${theme.brandName} Wallet is set
    up.`}
        imgSrc={setupProcessingImg.src}
      />
    );
  }

  return (
    <div className={styles.setupWallet}>
      <CreateWalletSteps
        currentIndex={currentStepIndex}
        className={styles.stepsContainer}
      >
        {currentStepIndex === 0 && (
          <CreatePasscode
            headerText="Create A Wallet Passcode"
            subHeaderText={`Please create a wallet passcode. This will be used to access and perform transactions with your ${theme.brandName} wallet.`}
            createPasscodeCallback={createPasscodeCallback}
            finishLaterCallback={navigateToDashboard}
          />
        )}
        {currentStepIndex === 1 && (
          <DisplayRecoveryPhrase
            brandName={theme.brandName}
            areYouSureContinueButtonCallback={() => setCurrentStepIndex(2)}
            passphrase={walletMnemonicRecoveryPhrase}
          />
        )}
        {currentStepIndex === 2 && (
          <ConfirmRecoveryPhrase
            brandName={theme.brandName}
            passphrase={walletMnemonicRecoveryPhrase}
            completeConfirmationButtonCallback={createWalletHandler}
            returnToWalletButtonCallback={() => setCurrentStepIndex(1)}
          />
        )}
      </CreateWalletSteps>
    </div>
  );
}

SetupWallet.protectedRoute = true;
