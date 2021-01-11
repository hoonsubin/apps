// Copyright 2017-2020 @polkadot/app-custom-signature authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useState } from 'react';

import { useMetaMask } from '../useMetaMask';
import CustomSignTx from './CustomSignTx';
import EcdsaAccount from './EcdsaAccount';

function EcdsaCallSigner (): React.ReactElement {
  const { ethereum, loadedAccounts } = useMetaMask();
  const [currentEcdsaAddress, setCurrentEcdsaAddress] = useState<string[]>([]);

  // request signature from MetaMask
  const _onClickSignatureRequest = useCallback(async (payload: string) => {
    const currentEthAccount = loadedAccounts[0];
    const extensionMethodPayload = { method: 'personal_sign', params: [currentEthAccount, payload] };

    console.log(`Signing ${JSON.stringify(extensionMethodPayload)}`);
    // note: error handling should be done from the CustomSignTx component so we don't need to wrap this inside a try catch block
    // fixme: sometimes this will send an empty object to MetaMask RPC which will return a `Cannot read property 'length' of null` error
    const signature = (await ethereum?.request(extensionMethodPayload)) as string;

    console.log(`Signature: ${signature}`);

    return signature;
  }, [ethereum, loadedAccounts]);

  return (
    <>
      <EcdsaAccount
        onAccountChanged={(accounts: string[]) => { setCurrentEcdsaAddress(accounts); }}
      />
      {currentEcdsaAddress.length > 0 && (<CustomSignTx onClickSignTx={_onClickSignatureRequest}
        sender={currentEcdsaAddress[0]}/>)}

    </>
  );
}

export default React.memo(EcdsaCallSigner);
