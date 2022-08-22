import { useAuth } from '../../hooks/useAuth';
import { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import {
  MintRewards,
  Modal,
  RewardsHistory,
  ThankYouForMintingRewards,
  WalletVault,
} from '@nerdcoresdk/nerd-core-ui';

import { useIsMobile } from '../../hooks/useIsMobile';
import { theme } from '../../theme/theme';
import styles from './myVault.module.css';
import downArrow from '../../assets/fontawesome/caret-down-solid.svg';
import upArrow from '../../assets/fontawesome/caret-up-solid.svg';
import leftArrow from '../../assets/fontawesome/caret-left-solid.svg';
import rightArrow from '../../assets/fontawesome/caret-right-solid.svg';
import minted from '../../assets/fontawesome/green-circle-solid.svg';
import notMinted from '../../assets/fontawesome/red-circle-solid.svg';
import pending from '../../assets/fontawesome/red-circle-solid.svg';
import mintRewardsImage from '../../assets/MintRewards.svg';
import {
  getUserRewardsHistory,
  mintUserRewards,
} from '../../pages/dashboard/node-service.resource';
import { getGasFee } from '../../pages/purchase/shopping-service.resource';

export default function MyVault({
  rewardsData,
  hasRewards,
  hasMintableRewards,
  handleFetchVaultData,
  walletItems,
}) {
  const totalEth = useMemo(() => {
    const eth = walletItems.find((item) => item.coinSymbol === 'ETH');
    return eth?.coinAmt ?? 0;
  }, [walletItems]);

  const { fetcher } = useAuth();
  const isMobile = useIsMobile();
  const initialRender = useRef(true);
  //Data States:
  //Rewards Table
  const [paginationData, setPaginationData] = useState({
    icons: {
      headingSortDescendingIcon: downArrow.src,
      headingSortAscendingIcon: upArrow.src,
      paginationLeftIcon: leftArrow.src,
      paginationRightIcon: rightArrow.src,
    },
    rowsPerPageList: [
      {
        key: '25',
        value: '25',
        handleClick: () => {
          updateRowsPerPage(25);
        },
      },
      {
        key: '50',
        value: '50',
        handleClick: () => {
          updateRowsPerPage(50);
        },
      },
      {
        key: '75',
        value: '75',
        handleClick: () => {
          updateRowsPerPage(75);
        },
      },
      {
        key: '100',
        value: '100',
        handleClick: () => {
          updateRowsPerPage(100);
        },
      },
    ],
  });
  const [rewardsHistory, setRewardsHistory] = useState([]);
  const [sortDirection, setSortDirection] = useState('desc');
  const [sortBy, setSortBy] = useState('created');
  const [pageNumber, setPageNumber] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  //Minting
  const [gasFee, setGasFee] = useState('');

  //Toggle view-ability of modals and buttons state
  const [showMintModal, setShowMintModal] = useState(false);
  const [showInsufficientEthModal, setShowInsufficentEthModal] = useState(false);
  const [showRewardsTable, setShowRewardsTable] = useState(false);
  const [mintingConfirmed, setMintingConfirmed] = useState(false);
  const [mintingLoading, setMintingLoading] = useState(false);
  const [wrongPassCodeError, setWrongPassCodeError] = useState(false);
  const [otherMintingError, setOtherMintingError] = useState(false);

  const handleFetchRewardsHistory = useCallback(async () => {
    let sortName;
    switch (sortBy) {
      case 'Earned Date':
        sortName = 'created';
        break;
      case 'Minted Date & Time':
        sortName = 'dateMint';
        break;
      case 'name':
        sortName = 'symbol';
        break;
      default:
        sortName = sortBy;
    }
    const rewardData = await fetcher(
      getUserRewardsHistory({
        sortBy: sortName,
        pageSize: pageSize,
        page: pageNumber,
        sortDir: sortDirection,
      })
    );
    if (rewardData.totalRecords > 0) {
      //map data to set table rows
      const historyData = rewardData.data.map((reward) => {
        const createdDate = new Date(reward.created);
        const mintedDate = reward.dateMint !== null ? new Date(reward.dateMint) : null;
        let mintImg;
        let mintText;
        switch (reward.status) {
          case 'unminted':
            mintImg = notMinted;
            mintText = 'Not Minted';
            break;
          case 'minted':
            mintImg = minted;
            mintText = 'Minted';
            break;
          default:
            mintImg = notMinted;
            mintText = 'Not Minted';
        }

        const status = (
          <p>
            <img src={mintImg.src} className={styles['reward-img']} /> {mintText}
          </p>
        );

        return {
          name: `${theme.brandName} Rewards`,
          amount: reward.amount.toFixed(2),
          'Earned Date': createdDate.toLocaleDateString(),
          status: status,
          'Minted Date & Time':
            mintedDate !== null
              ? mintedDate?.toLocaleString('en-US', {
                  dateStyle: 'long',
                  timeStyle: 'long',
                })
              : null,
        };
      });
      setRewardsHistory(historyData);
      //create page selection menu for number of available pages
      let pageOptions = [];
      for (let i = 0; i < rewardData.totalPages; i++) {
        let pageValue = i;
        let pageIndex = (pageValue += 1);
        let page = {
          key: `${pageIndex}`,
          value: `${pageIndex}`,
          handleClick: () => setPageNumber(i),
        };
        pageOptions.push(page);
      }
      let pageValue = pageNumber;
      let currentPage = (pageValue += 1);

      //update pagination for table footer
      setPaginationData((prevState) => ({
        ...prevState,
        items: {
          currentStart: 1 + (currentPage - 1) * pageSize,
          currentEnd: Math.min(currentPage * pageSize, rewardData.totalRecords),
          totalItems: rewardData.totalRecords,
          itemsName: 'items',
        },
        pages: pageOptions,
        pageData: {
          currentPage: currentPage,
          totalPages: rewardData.totalPages,
        },
        menuPageNumber: currentPage,
      }));
      setShowRewardsTable(true);
    }
  }, [fetcher, pageNumber, sortBy, pageSize, sortDirection]);

  const handleSortRewardsColumns = useCallback(
    (columnName) => {
      if (columnName === sortBy) {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
      } else {
        setSortBy(columnName);
        setSortDirection('asc');
      }
      setPageNumber(0);
    },
    [sortDirection, sortBy]
  );

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
    } else {
      handleFetchRewardsHistory();
    }
  }, [sortBy, pageNumber, sortDirection, pageSize]);

  const goToNextPage = useCallback(() => {
    let pageIndex = pageNumber;
    if (pageIndex < paginationData.pageData.totalPages - 1) {
      setPageNumber(pageIndex + 1);
    }
  }, [paginationData, pageNumber]);

  const goToPrevPage = useCallback(() => {
    let pageIndex = pageNumber;
    if (pageIndex > 0) {
      setPageNumber(pageIndex - 1);
    }
  }, [paginationData, pageNumber]);

  const updateRowsPerPage = useCallback((rows) => {
    setPageSize(rows);
    setPageNumber(0);
  }, []);

  const handleMintRewards = useCallback(async () => {
    const currentGasFee = await fetcher(getGasFee({ token: 'eth' }));
    setGasFee(
      `${currentGasFee.fast} ETH | $${parseFloat(currentGasFee.usd.fast.toFixed(2))}`
    );
    currentGasFee.fast >= totalEth
      ? setShowInsufficentEthModal(true)
      : setShowMintModal(true);
  }, [fetcher, totalEth]);

  const handleSubmitMintRewards = useCallback(async (data) => {
    setMintingLoading(true);
    setWrongPassCodeError(false);
    setOtherMintingError(false);
    fetcher(mintUserRewards(data.passcode))
      .then((data) => {
        setMintingConfirmed(true);
        setMintingLoading(false);
        handleFetchVaultData();
      })
      .catch((err) => {
        if (err.response.data.ErrorDetail === 'Internal Error: Password Validation.') {
          setWrongPassCodeError(true);
        } else {
          setOtherMintingError(true);
        }
        setMintingLoading(false);
      });
  }, []);

  const closeHistoryTable = useCallback(() => {
    setSortDirection('desc');
    setSortBy('created');
    setPageNumber(0);
    setPageSize(25);
    setShowRewardsTable(false);
    initialRender.current = true;
  }, []);

  return (
    <div>
      <div className={styles['reward-item']}>
        {rewardsData.length && (
          <WalletVault
            titleText="My Nerd Vault"
            nodes={rewardsData}
            buttonOneText={hasMintableRewards ? 'Mint Rewards' : null}
            buttonOneCallback={handleMintRewards}
            buttonTwoText={hasRewards ? 'View Rewards History' : null}
            buttonTwoCallback={handleFetchRewardsHistory}
          />
        )}
      </div>
      {showInsufficientEthModal && (
        <Modal closeModal={() => setShowInsufficentEthModal(false)}>
          <div className={styles['mint-error-modal']}>
            Sorry, you currently do not have enough ETH to mint. Add more ETH then try
            again.
          </div>
        </Modal>
      )}
      {showMintModal && (
        <Modal
          closeModal={() => {
            setWrongPassCodeError(false);
            setShowMintModal(false);
            setOtherMintingError(false);
          }}
          modalClassName={styles['mint-rewards-modal']}
        >
          {!mintingConfirmed ? (
            <MintRewards
              handleConfirm={handleSubmitMintRewards}
              brandName={theme.brandName}
              handleCancel={() => {
                setShowMintModal(false);
                setWrongPassCodeError(false);
                setOtherMintingError(false);
              }}
              gasPrice={gasFee}
              numRewards={rewardsData[1].nodeDataOne.toString()}
              isLoading={mintingLoading}
              wrongPassCodeError={wrongPassCodeError}
            />
          ) : (
            <ThankYouForMintingRewards
              brandName={theme.brandName}
              image={mintRewardsImage.src}
              handleReturnToDashboard={() => {
                setMintingConfirmed(false);
                setShowMintModal(false);
              }}
            />
          )}
          {otherMintingError && (
            <p className={styles['minting-error']}>
              Something went wrong and we are not able to mint your rewards. Please try
              again later.
            </p>
          )}
        </Modal>
      )}
      {showRewardsTable && (
        <Modal
          closeModal={closeHistoryTable}
          modalClassName={styles['reward-history-modal']}
        >
          <div className={styles['reward-history-table-wrapper']}>
            <RewardsHistory
              handleReturnToDashboardCallback={closeHistoryTable}
              rewardsHistoryTableProps={{
                currentRowsPerPage: pageSize,
                handleSortColumnsCallback: (sortMethod) =>
                  handleSortRewardsColumns(sortMethod),
                icons: paginationData.icons,
                items: paginationData.items,
                pages: paginationData.pages,
                pageData: {
                  ...paginationData.pageData,
                  previousPageCallback: goToPrevPage,
                  nextPageCallback: goToNextPage,
                },
                pagesMenuLabel: `${paginationData.menuPageNumber}`,
                pagesMenuLabelSecondary: `of ${paginationData.pageData.totalPages} pages`,
                rowsPerPageList: paginationData.rowsPerPageList,
                tableData: rewardsHistory,
                useIsMobile: isMobile,
                mobileTableHeader: 'Rewards',
                sortMethod: { column: sortBy, ascending: sortDirection === 'asc' },
              }}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
