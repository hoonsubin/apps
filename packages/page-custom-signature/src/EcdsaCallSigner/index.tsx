// Copyright 2017-2020 @polkadot/app-custom-signature authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useState } from 'react';

import { EcdsaAddressFormat } from '../types';
import { useMetaMask } from '../useMetaMask';
import CustomSignTx from './CustomSignTx';
import EcdsaAccount from './EcdsaAccount';

function EcdsaCallSigner (): React.ReactElement {
  const { ethereum } = useMetaMask();
  const [currentEthAddress, setCurrentEthAddress] = useState<EcdsaAddressFormat>();

  // request signature from MetaMask
  const _onClickSignatureRequest = useCallback(async (payload: string) => {
    // we're signing the message with the first account
    const extensionMethodPayload = { method: 'personal_sign', params: [currentEthAddress?.ethereum, payload] };

    console.log(`Sending method ${JSON.stringify(extensionMethodPayload)}`);

    const signature = (await ethereum?.request(extensionMethodPayload)) as string;

    console.log(`Signature: ${signature}`);

    return signature;
  }, [ethereum, currentEthAddress]);

  return (
    <>
      <EcdsaAccount
        onAccountChanged={setCurrentEthAddress}
      />
      {currentEthAddress && (<CustomSignTx onClickSignTx={_onClickSignatureRequest}
        sender={currentEthAddress.ss58}/>)}

    </>
  );
}

export default React.memo(EcdsaCallSigner);
