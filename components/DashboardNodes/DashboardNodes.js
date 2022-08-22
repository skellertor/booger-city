import { useAuth } from '../../hooks/useAuth';
import { useCallback, useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import { routes } from '../../routes/routes';
import { WalletVault } from '@nerdcoresdk/nerd-core-ui';

import { getUserPurchases } from '../../pages/dashboard/node-service.resource';


import styles from './dashboardNodes.module.css';

export default function DashboardNodes({ walletItems, isLoading, setShowSetupNode }) {
  const { fetcher } = useAuth();
  const router = useRouter();

  
  const [nodesVaultData, setNodesVaultData] = useState([
    {
      headingText: 'Total Active Nodes',
      nodeDataOne: 0,
      nodeDataTwo: 0,
    },
    {
      headingText: 'Total Smart Nodes',
      nodeDataOne: 0,
    },
    {
      headingText: 'Total Lite Nodes',
      nodeDataOne: 0,
    },
  ]);
  const [nodesData, setNodesData] = useState({
    userHasPurchasedNodes: false,
    nodesNeedSetup: false,
  });

  const handleFetchNodeData = useCallback(async () => {
    const userNodes = await fetcher(getUserPurchases());

    if (userNodes) {
      setNodesVaultData([
        {
          headingText: 'Total Nodes',
          nodeDataOne: Number(userNodes?.totalActive) || 0,
        },
        {
          headingText: 'Total Smart Nodes',
          nodeDataOne: Number(userNodes?.productTotals?.smartNode) || 0,
        },
        {
          headingText: 'Total Lite Nodes',
          nodeDataOne: Number(userNodes?.productTotals?.liteNode) || 0,
        },
      ]);

      setNodesData((prevState) => ({
        ...prevState,
        userHasNodes: userNodes?.totalActive > 0,
        nodesNeedSetup: userNodes?.totalActive > 0,
      }));
    }
  }, []);

  const purchaseNodes = useCallback(() => {
    router.push(routes.purchase.path);
  }, [router]);


  useEffect(() => {
    handleFetchNodeData();
  }, []);

  const setupNodes = useCallback(() => {
    setShowSetupNode(true);
  }, []);

  return (
    <div> 
        <div className={styles['dashboard-item']}>
          <WalletVault
            titleText="My Nerd Nodes"
            nodes={nodesVaultData}
            buttonOneText={(walletItems?.length > 1) ? "Purchase Nodes" : null}
            buttonOneCallback={purchaseNodes}
            buttonTwoText={nodesData.userHasNodes ? 'Set Up Nodes' : null}
            buttonTwoCallback={nodesData.userHasNodes ? setupNodes : null}
          />
        </div>      
    </div>
  );
}
