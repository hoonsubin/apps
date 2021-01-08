// Copyright 2017-2020 @polkadot/app-js authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AppProps as Props } from '@polkadot/react-components/types';

import React, { useRef, useState } from 'react';

import { Tabs } from '@polkadot/react-components';

import CustomSignTx from './CustomSignTx';
import GetAccount from './GetAccount';
import { useTranslation } from './translate';

function CustomSignatureApp ({ basePath }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const [loadedAccounts, setLoadedAccounts] = useState<string[]>([]);

  const itemsRef = useRef([
    {
      isRoot: true,
      name: 'index',
      text: t<string>('Sign Transaction')
    }
  ]);

  return (
    <main>
      <header>
        <Tabs
          basePath={basePath}
          items={itemsRef.current}
        />
      </header>
      <GetAccount
        onAccountChanged={(accounts: string[]) => { setLoadedAccounts(accounts); }}
      />
      {loadedAccounts.length > 0 && (<CustomSignTx sender={loadedAccounts[0]} />)}

    </main>
  );
}

export default React.memo(CustomSignatureApp);
