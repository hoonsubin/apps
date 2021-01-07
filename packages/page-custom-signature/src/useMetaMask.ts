// Copyright 2017-2020 @polkadot/app-custom-signature authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useState } from 'react';

import { EthereumProvider } from './types';
import { useEthProvider } from './useEthProvider';

interface UseMetaMask {
  loadedAccounts: string[];
  activateMetaMask: () => Promise<string[]>;
  ethereum?: EthereumProvider;
}

export function useMetaMask (): UseMetaMask {
  const { provider } = useEthProvider();
  const [loadedAccounts, setLoadedAccounts] = useState<string[]>([]);

  const requestAccounts = useCallback(async () => {
    if (typeof provider === 'undefined') {
      throw new Error('Cannot detect MetaMask');
    }

    const accounts = (await provider.request({ method: 'eth_requestAccounts' })) as string[];

    setLoadedAccounts(accounts);

    return accounts;
  }, [provider]);

  useEffect(() => {
    if (provider?.isMetaMask) {
      const ethereum = provider;

      // handle account changes
      ethereum.on('accountsChanged', (accounts: string[]) => {
        setLoadedAccounts(accounts);
      });

      ethereum.on('chainChanged', () => {
        // refresh the page if the use changes the network
        window.location.reload();
      });
    }
  }, [provider]);

  return { activateMetaMask: requestAccounts, ethereum: provider, loadedAccounts };
}
