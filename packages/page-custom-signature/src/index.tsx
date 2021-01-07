// Copyright 2017-2020 @polkadot/app-js authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AppProps as Props } from '@polkadot/react-components/types';

import React, { useRef } from 'react';
import { Route, Switch } from 'react-router';

import { Tabs } from '@polkadot/react-components';
import { useSudo } from '@polkadot/react-hooks';

import CustomSignTx from './CustomSignTx';
import GetAccount from './GetAccount';
import { useTranslation } from './translate';

function CustomSignatureApp ({ basePath }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { allAccounts } = useSudo();

  const itemsRef = useRef([
    {
      isRoot: true,
      name: 'index',
      text: t<string>('Sign Transaction')
    },
    {
      name: 'account',
      text: t<string>('ECDSA Account')
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
      <Switch>
        <Route path={`${basePath}/account`}>
          <GetAccount />
        </Route>
        <Route>
          <CustomSignTx
            allAccounts={allAccounts}
          />
        </Route>
      </Switch>
    </main>
  );
}

export default React.memo(CustomSignatureApp);
