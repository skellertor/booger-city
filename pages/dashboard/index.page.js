import { useAuth } from '../../hooks/useAuth';
import { useCallback, useEffect, useState, useMemo } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useRouter } from 'next/router';
import Promise from 'bluebird';
import {
  DownloadSoftware,
  Modal,
  SendConfirmation,
  WalletFunctionality,
  WalletSetup,
} from '@nerdcoresdk/nerd-core-ui';

import { routes } from '../../routes/routes';
import {
  getUserRewardsTotals,
  getUserWalletItem,
  getCoinConversion,
  getTransactionHistory,
  sendTransaction,
} from './node-service.resource';
import { getGasFee } from '../purchase/shopping-service.resource';

import styles from './dashboard.module.css';
import { theme } from '../../theme/theme';
import MyVault from '../../components/MyVault/MyVault';
import DashboardNodes from '../../components/DashboardNodes/DashboardNodes';
import downArrow from '../../assets/fontawesome/caret-down-solid.svg';
import upArrow from '../../assets/fontawesome/caret-up-solid.svg';
import leftArrow from '../../assets/fontawesome/caret-left-solid.svg';
import rightArrow from '../../assets/fontawesome/caret-right-solid.svg';
import greenDot from '../../assets/fontawesome/green-circle.svg';
import orangeDot from '../../assets/fontawesome/orange-circle.svg';
import sendConfirmationImg from '../../assets/SendConfirmation.svg';
import windowsLogo from '../../assets/systemicons/window_logo.png';
import appleLogo from '../../assets/systemicons/apple_logo.png';
import linuxLogo from '../../assets/systemicons/linux_logo.png';

export default function Dashboard() {
  const { fetcher } = useAuth();
  const router = useRouter();
  const isMobile = useIsMobile();

  //Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [hasWalletError, setHasWalletError] = useState(false);
  const [walletItems, setWalletItems] = useState([]);

  //Current Coin Wallet Functionality Modal States
  const [currentCoinItemData, setCurrentCoinItemData] = useState({});
  const [estimatedGasFee, setEstimatedGasFee] = useState(0);
  const [showCoinItemData, setShowCoinItemData] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortMethod, setSortMethod] = useState({
    column: 'Date & Time',
    ascending: false,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(1);
  const [data, setData] = useState([]);
  const [pagesDropdownOptions, setPagesDropdownOptions] = useState([
    { key: 'key1', value: '1' },
  ]);
  const [hasIncorrectPasscodeError, setHasIncorrectPasscodeError] = useState(false);
  const [sendConfirmIsLoading, setSendConfirmIsLoading] = useState(false);
  const [showTransactionSuccess, setShowTransactionSuccess] = useState(false);
  const [showGenericError, setShowGenericError] = useState(false);
  const [showSetupNode, setShowSetupNode] = useState(false);

  //MyVault state items
  const [rewardsData, setRewardsData] = useState([
    {
      headingText: 'Most Recent Reward',
      nodeDataOne: 0,
    },
    {
      headingText: 'Rewards Available to Mint',
      nodeDataOne: 0,
    },
    {
      headingText: 'Total Rewards Earned',
      nodeDataOne: 0,
    },
  ]);
  const [hasRewards, setHasRewards] = useState(false);
  const [hasMintableRewards, setHasMintableRewards] = useState(false);

  const transactionHistoryTableProps = {
    currentRowsPerPage: pageSize,
    handleSortColumnsCallback: (column) => {
      // default to ascending: true for a new column, toggle asc/desc if the same column is clicked again
      let sortAscending = true;
      if (column === sortMethod.column) {
        sortAscending = !sortMethod.ascending;
      }
      setSortMethod({
        column,
        ascending: sortAscending,
      });
      setPage(1);
    },
    icons: {
      headingSortDescendingIcon: downArrow.src,
      headingSortAscendingIcon: upArrow.src,
      paginationLeftIcon: leftArrow.src,
      paginationRightIcon: rightArrow.src,
    },
    items: {
      currentStart: 1 + (page - 1) * pageSize,
      currentEnd: (page - 1) * pageSize + data.length,
      totalItems,
      itemsName: 'items',
    },
    pageData: {
      currentPage: page,
      totalPages,
      nextPageCallback: () => {
        if (page < totalPages) {
          setPage(page + 1);
        }
      },
      previousPageCallback: () => {
        if (page > 1) {
          setPage(page - 1);
        }
      },
    },
    pages: pagesDropdownOptions,
    rowsPerPageList: [
      {
        key: '25',
        value: '25',
        handleClick: () => {
          setPageSize(25);
          setPage(1);
        },
      },
      {
        key: '50',
        value: '50',
        handleClick: () => {
          setPageSize(50);
          setPage(1);
        },
      },
      {
        key: '75',
        value: '75',
        handleClick: () => {
          setPageSize(75);
          setPage(1);
        },
      },
      {
        key: '100',
        value: '100',
        handleClick: () => {
          setPageSize(100);
          setPage(1);
        },
      },
    ],
    sortMethod,
    tableData: data,
    useIsMobile: isMobile,
  };

  //Dashboard Functions
  useEffect(() => {
    async function getWalletItems() {
      const symbols = [theme.brandCoin, 'ETH', 'BTC'];
      setHasWalletError(false);
      const coins = await Promise.map(symbols, async (symbol) => {
        try {
          const coinData = await fetcher(getUserWalletItem({ symbol }));

          let currentCoinConversion;
          if (symbol !== theme.brandCoin) {
            currentCoinConversion = await fetcher(
              getCoinConversion({
                token: symbol,
                currency: 'usd',
              })
            );
          }

          return { coinData, currentCoinConversion };
        } catch (err) {
          if (err.response.data.title === 'Not Found') {
            return;
          } else {
            setHasWalletError(true);
          }
        }
      });

      const walletItemsArr = coins
        .filter((coin) => coin?.coinData)
        .map((coin) => ({
          coinSymbol: coin.coinData.symbol,
          coinAmt: Number(coin.coinData.balance),
          coinLogo: coin.coinData.icon,
          coinName: coin.coinData.name,
          usd: coin.currentCoinConversion
            ? parseFloat((coin.coinData.balance * coin.currentCoinConversion).toFixed(2))
            : null,
          walletId: coin.coinData.address,
          valid: coin.coinData.canSendFunds,
        }));

      return walletItemsArr;
    }

    async function handleFetchWalletItems() {
      const walletItemsArr = await getWalletItems();
      setWalletItems(walletItemsArr);
      setIsLoading(false);
    }

    handleFetchWalletItems();
    handleFetchVaultData();

    const updateWalletInterval = setInterval(async () => {
      handleFetchVaultData();
      const walletItemsArr = await getWalletItems();
      // only update the wallet if we have items to display
      if (walletItemsArr.length) {
        setWalletItems(walletItemsArr);
      }
    }, 60000);

    return function cleanup() {
      if (updateWalletInterval) {
        clearInterval(updateWalletInterval);
      }
    };
  }, []);

  const handleFetchVaultData = useCallback(async () => {
    const userRewards = await fetcher(getUserRewardsTotals());
    if (userRewards.totalRewards > 0) {
      setHasRewards(true);
      setRewardsData([
        {
          headingText: 'Most Recent Reward',
          nodeDataOne: userRewards.recentRewards,
        },
        {
          headingText: 'Rewards Available to Mint',
          nodeDataOne: userRewards.unmintedRewards,
        },
        {
          headingText: 'Total Rewards Earned',
          nodeDataOne: userRewards.totalRewards,
        },
      ]);
      if (userRewards.unmintedRewards > 0) {
        setHasMintableRewards(true);
      } else {
        setHasMintableRewards(false);
      }
    }
  });

  const setupWallet = useCallback(() => {
    router.push(routes.setupWallet.path);
  }, [router]);

  const selectWalletItem = useCallback(
    (walletItemSymbol) => {
      const item = walletItems.find((item) => item.coinSymbol === walletItemSymbol);

      setCurrentCoinItemData({
        coinAmt: item.coinAmt,
        coinLogo: item.coinLogo,
        coinName: item.coinName,
        coinSymbol: item.coinSymbol,
        usd: item.usd,
        walletId: item.walletId,
      });
      setShowCoinItemData(true);
    },
    [walletItems]
  );

  //Wallet Functionality Functions
  const compileTransactionHistoryTableData = (transactions) => {
    return transactions.map((transaction) => {
      const timestamp = new Date(transaction.timestamp);
      const statusIndicatorSrc =
        transaction.status === 'Complete' ? greenDot.src : orangeDot.src;
      return {
        type: transaction.type,
        amount: Math.abs(transaction.amount),
        status: (
          <>
            <img className={styles['status-indicator']} src={statusIndicatorSrc} />{' '}
            {transaction.status}
          </>
        ),
        'Date & Time': timestamp.toLocaleString('en-US', {
          dateStyle: 'long',
          timeStyle: 'long',
        }),
      };
    });
  };

  useEffect(() => {
    async function fetchGasFee() {
      if (currentCoinItemData?.coinSymbol) {
        const gasFeeData = await fetcher(
          getGasFee({ token: currentCoinItemData.coinSymbol })
        );
        setEstimatedGasFee(gasFeeData.fast);
      }
    }
    fetchGasFee();
  }, [currentCoinItemData.coinSymbol, fetcher]);

  useEffect(() => {
    if (currentCoinItemData?.coinSymbol) {
      fetcher(
        getTransactionHistory({
          symbol: currentCoinItemData.coinSymbol,
          page,
          pageSize,
          sortBy: sortMethod.column === 'Date & Time' ? 'timestamp' : sortMethod.column,
          sortDir: sortMethod.ascending ? 'asc' : 'desc',
        })
      ).then((historyData) => {
        const historyDataForCoin = historyData.wallet.find((wallet) => {
          return wallet.symbol === currentCoinItemData.coinSymbol;
        });
        const tableData = compileTransactionHistoryTableData(
          historyDataForCoin.transactions
        );
        const newPagesDropdownOptions = [];
        for (let i = 1; i <= historyDataForCoin.totalPages; i++) {
          newPagesDropdownOptions.push({
            key: `pagesDropdownKey${i}`,
            value: `${i}`,
            handleClick: () => setPage(i),
          });
        }

        setPagesDropdownOptions(newPagesDropdownOptions);
        setTotalPages(historyDataForCoin.totalPages);
        setTotalItems(historyDataForCoin.totalRecords);
        setData(tableData);
      });
    }
  }, [currentCoinItemData.coinSymbol, page, pageSize, sortMethod]);

  const handleSendFormSubmit = useCallback(
    (formData) => {
      setSendConfirmIsLoading(true);
      setHasIncorrectPasscodeError(false);
      setShowGenericError(false);
      fetcher(
        sendTransaction({
          amount: formData.amountToSend.value,
          symbol: currentCoinItemData.coinSymbol,
          to: formData.sendToAddress.value,
          walletPassword: formData.walletPasscode.value,
        })
      )
        .then((result) => {
          setShowTransactionSuccess(true);
          setShowCoinItemData(false);
        })
        .catch((err) => {
          const errorRes = err.response.data.detail;
          if (errorRes.includes('Incorrect')) {
            setHasIncorrectPasscodeError(true);
            setSendConfirmIsLoading(false);
            return;
          } else {
            setSendConfirmIsLoading(false);
            setShowGenericError(true);
            setTimeout(() => {
              setShowGenericError(false);
            }, 5000);
          }
        });
    },
    [currentCoinItemData, fetcher]
  );

  const handleReturnToDashboard = useCallback(() => {
    setShowCoinItemData(false);
    setShowTransactionSuccess(false);
    setSendConfirmIsLoading(false);
  }, [router]);

  //My Node Functions
  const downloadNodeStepOneData = useMemo(() => {
    return {
      downloadSystemOneLink: ' https://static.setpowerfree.com/softnode/green_mac.dmg',
      downloadSystemTwoLink: 'https://static.setpowerfree.com/softnode/green_win.exe',
      downloadSystemThreeLink:
        'https://static.setpowerfree.com/softnode/green_linux.AppImage',
      systemOneIcon: appleLogo.src,
      systemTwoIcon: windowsLogo.src,
      systemThreeIcon: linuxLogo.src,
      downloadSystemOneText: 'Download for Mac OS',
      downloadSystemTwoText: 'Download for Windows',
      downloadSystemThreeText: 'Download for Linux',
    };
  }, []);
  const cancelSetupNodes = useCallback(() => {
    setShowSetupNode(false);
  }, []);

  return (
    <div>
      <section>
        <div className={styles['dashboard-wrapper']}>
          <div className={styles['dashboard-item']}>
            <WalletSetup
              walletName="My Nerd Wallet"
              isLoading={isLoading}
              setupButtonCallback={setupWallet}
              buttonText="Set Up Wallet"
              walletItems={
                walletItems.filter((coin) => coin.coinSymbol === 'ETH').length > 0
                  ? walletItems
                  : []
              }
              clickCallback={selectWalletItem}
              hasError={hasWalletError}
              errorMessage="Error Loading Wallet Data - Please Refresh the page"
            />
            <hr className={styles.breakRow} />
          </div>
          <div className={styles['dashboard-item']}>
            <DashboardNodes
              walletItems={walletItems}
              isLoading={isLoading}
              setShowSetupNode={setShowSetupNode}
            />
          </div>

          <div className={styles['dashboard-item']}>
            <hr className={styles.breakRow} />
            <MyVault
              walletItems={walletItems}
              rewardsData={rewardsData}
              hasRewards={hasRewards}
              hasMintableRewards={hasMintableRewards}
              handleFetchVaultData={handleFetchVaultData}
            />
          </div>
          {showCoinItemData && (
            <Modal
              modalClassName={styles.currentCoinData}
              closeModal={() => setShowCoinItemData(false)}
            >
              <div
                className={styles.currentCoinDataCloseX}
                onClick={() => setShowCoinItemData(false)}
              >
                x
              </div>
              <div
                style={isMobile ? { width: '100%', padding: '0' } : { width: '1087px' }}
              >
                <WalletFunctionality
                  style={
                    isMobile ? { margin: '70px 20px 20px 20px' } : { margin: '20px' }
                  }
                  coinAmt={currentCoinItemData.coinAmt}
                  coinLogo={currentCoinItemData.coinLogo}
                  coinName={currentCoinItemData.coinName}
                  coinSymbol={currentCoinItemData.coinSymbol}
                  estimatedGasFee={estimatedGasFee}
                  incorrectPasscodeError={hasIncorrectPasscodeError}
                  handleSendFormSubmitCallback={handleSendFormSubmit}
                  receiveTabHandleDoneButtonCallback={() => setShowCoinItemData(false)}
                  sendConfirmIsLoading={sendConfirmIsLoading}
                  tabLabels={
                    isMobile
                      ? ['Send', 'Receive', 'Tx History']
                      : ['Send', 'Receive', 'Transaction History']
                  }
                  transactionHistoryTableProps={transactionHistoryTableProps}
                  usd={currentCoinItemData.usd}
                  walletId={currentCoinItemData.walletId}
                />
              </div>
              {showGenericError && (
                <div className={styles['generic-error']}>
                  There was a problem with the transaction. Please check the Send To
                  Address and try again.
                </div>
              )}
            </Modal>
          )}
          {showTransactionSuccess && (
            <Modal className={styles.transferConfirmationWrapper}>
              <SendConfirmation
                brandName="Nerd Prime"
                headingText="Transfer Complete"
                buttonText="Return To Dashboard"
                bodyText="Your transaction has been sent, please verify and check status from your dashboard."
                image={sendConfirmationImg.src}
                handleReturnToDashboardCallback={handleReturnToDashboard}
              />
            </Modal>
          )}
          {showSetupNode && (
            <Modal
              closeModal={cancelSetupNodes}
              modalClassName={styles['setup-node-modal']}
            >
              <DownloadSoftware
                stepOneData={downloadNodeStepOneData}
                handleFinishSetupCallback={cancelSetupNodes}
                handleDownloadHelpDocumentCallback={
                  'https://core-sdk-dev-public-temp.s3.us-west-2.amazonaws.com/docs/node-set-up-instructions-basic.pdf'
                }
              />
            </Modal>
          )}
        </div>
      </section>
    </div>
  );
}

Dashboard.protectedRoute = true;
