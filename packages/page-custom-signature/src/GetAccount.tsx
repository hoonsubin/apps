// Copyright 2017-2020 @polkadot/app-js authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

import { AddressMini, Button, Icon } from '@polkadot/react-components';

import { useTranslation } from './translate';
import { useMetaMask } from './useMetaMask';
import * as utils from './utils';

interface Props {
  className?: string;
  onAccountChanged?: (accounts: string[]) => void;
}

function GetAccount ({ className = '', onAccountChanged }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { activateMetaMask, ethereum, loadedAccounts } = useMetaMask();
  // internal message state
  const [errorMessage, setErrorMessage] = useState<Error>();
  // note: currently, MetaMask will only export one account at a time.
  // so this value will always be either an empty array or an array with one item.
  const [ecdsaAccounts, setEcdsaAccounts] = useState<string[]>([]);

  const [currentEthAddress, setCurrentEthAddress] = useState<string>();

  const [isBusy, setIsBusy] = useState(false);

  const _onClickLoadAccount = useCallback(async () => {
    // note: a placeholder message to login. This should be changed to something that is different from chain to chain
    const SIGN_MSG = 'hello world';

    setIsBusy(true);

    // reset the error message if it already exists
    if (typeof errorMessage !== 'undefined') {
      setErrorMessage(undefined);
    }

    try {
      // fetch the current active account from MetaMask
      const accounts = await activateMetaMask();

      // send a signature method to sign an arbitrary message
      // note: we only get the first account for now
      const signature = await ethereum?.request({ method: 'personal_sign', params: [accounts[0], SIGN_MSG] });
      // recover the ethereum ECDSA compressed public key from the signature
      const pubKey = utils.recoverPublicKeyFromSig(accounts[0], SIGN_MSG, signature as string);
      // encode the public key to Substrate-compatible ss58
      // note: the address prefix is hard-coded right now. Fix this this to be read dynamically
      const ss58Address = utils.ecdsaPubKeyToSs58(pubKey, 42);

      setEcdsaAccounts([ss58Address]);
      // set the current address after the ss58 has been loaded
      setCurrentEthAddress(accounts[0]);
    } catch (err) {
      setErrorMessage(err);
    } finally {
      setIsBusy(false);
    }
  }, [activateMetaMask, ethereum, errorMessage]);

  // check if the user installed MetaMask or not
  useEffect(() => {
    if (!window.ethereum) {
      setErrorMessage(new Error('Could not find MetaMask'));
    }
  }, []);

  // reset the account cache if the user changes their account in MetaMask
  useEffect(() => {
    // check if the selected account is different from the loaded account
    if (loadedAccounts.length > 0 && currentEthAddress !== loadedAccounts[0]) {
      setEcdsaAccounts([]);
    }
  }, [currentEthAddress, loadedAccounts]);

  // emit the account change event handler
  useEffect(() => {
    onAccountChanged && onAccountChanged(ecdsaAccounts);
  }, [ecdsaAccounts, onAccountChanged]);

  return (
    <section className={`${className} ui--row`}>
      {ecdsaAccounts.length < 1
        ? (
          <>
            <Button
              icon='sync'
              isBusy={isBusy}
              label={t<string>('Load account from MetaMask')}
              onClick={_onClickLoadAccount}
            />
          </>
        )
        : (
          <>
            <AddressMini value={ecdsaAccounts[0]} />
          </>
        )
      }
      {errorMessage && (
        <article className='error padded'>
          <div>
            <Icon icon='ban' />
            {errorMessage.message}
          </div>
        </article>
      )}
    </section>
  );
}

export default React.memo(styled(GetAccount)`

  .accountLabelled {
    align-items: center;
  }
`);
