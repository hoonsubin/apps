// Copyright 2017-2020 @polkadot/app-custom-signature authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useState } from 'react';

import { EcdsaAddressFormat } from '../types';
import { useMetaMask } from '../useMetaMask';
import CustomSignTx from './CustomSignTx';
import EcdsaAccount from './EcdsaAccount';

interface Props {
  className?: string;
}

function EcdsaCallSigner ({ className = '' }: Props): React.ReactElement<Props> {
  const { ethereum } = useMetaMask();
  const [currentEthAddress, setCurrentEthAddress] = useState<EcdsaAddressFormat>();

  // request signature from MetaMask
  const _onClickSignatureRequest = useCallback(
    async (payload: string) => {
      // we're signing the message with the first account
      const extensionMethodPayload = { method: 'personal_sign', params: [currentEthAddress?.ethereum, payload] };

      // console.log(`Sending method ${JSON.stringify(extensionMethodPayload)}`);

      // fixme: this function will not return an error even if the user cancels the signature from MetaMask
      const sigResponse = await ethereum?.request(extensionMethodPayload);

      if (typeof sigResponse !== 'string') {
        throw new Error('Failed to fetch signature');
      }

      return sigResponse;
    },
    [ethereum, currentEthAddress]
  );

  return (
    <section className={`${className}`}>
      <EcdsaAccount onAccountChanged={setCurrentEthAddress} />
      {currentEthAddress && <CustomSignTx onClickSignTx={_onClickSignatureRequest}
        sender={currentEthAddress.ss58} />}
    </section>
  );
}

export default React.memo(EcdsaCallSigner);
