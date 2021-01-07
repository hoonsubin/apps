// Copyright 2017-2020 @polkadot/app-js authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

import { AddressMini, Button, Icon, Labelled } from '@polkadot/react-components';

import { useTranslation } from './translate';
import { useMetaMask } from './useMetaMask';
import * as utils from './utils';

interface Props {
  className?: string;
  onAccountLoaded?: (accounts: string[]) => Promise<void>;
}

function GetAccount ({ className = '', onAccountLoaded }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { activateMetaMask, ethereum, loadedAccounts } = useMetaMask();
  // internal message state
  const [errorMessage, setErrorMessage] = useState<Error>();
  // note: currently, MetaMask will only export one account at a time.
  // so this value will always be either an empty array or an array with one item.
  const [ecdsaAccounts, setEcdsaAccounts] = useState<string[]>([]);
  const [isBusy, setIsBusy] = useState(false);

  const _onClickLoadAccount = useCallback(async () => {
    // note: a placeholder message to login
    const SIGN_MSG = 'hello world';

    if (loadedAccounts.length < 1 || ecdsaAccounts.length < 1) {
      setIsBusy(true);

      // reset the error message if it already exists
      if (typeof errorMessage !== 'undefined') {
        setErrorMessage(undefined);
      }

      try {
        const accounts = await activateMetaMask();
        const signature = await ethereum?.request({ method: 'personal_sign', params: [accounts[0], SIGN_MSG] });
        const pubKey = utils.recoverPublicKeyFromSig(accounts[0], SIGN_MSG, signature as string);

        // note: the address prefix is hard-coded right now. Fix this this to be read dynamically
        const ss58Address = utils.ecdsaToSs58(pubKey, 42);

        setEcdsaAccounts([ss58Address]);

        onAccountLoaded && await onAccountLoaded([ss58Address]);
      } catch (err) {
        setErrorMessage(err);
      } finally {
        setIsBusy(false);
      }
    }
  }, [activateMetaMask, loadedAccounts.length, ecdsaAccounts.length, ethereum, errorMessage, onAccountLoaded]);

  // reset the loaded accounts if the user changes the account from metamask
  useEffect(() => {
    if (loadedAccounts.length > 0) {
      setEcdsaAccounts([]);
    }
  }, [loadedAccounts]);

  return (
    <section className={`${className} ui--row`}>
      {ecdsaAccounts.length < 1
        ? (
          <>
            <Button
              icon='sync'
              isBusy={isBusy}
              isDisabled={!window.ethereum}
              label={t<string>('Load account from MetaMask')}
              onClick={_onClickLoadAccount}
            />
          </>
        )
        : (
          <>
            <Labelled
              className='ui--Dropdown accountLabelled'
              label={t<string>('ECDSA account')}
              withLabel
            >
              <AddressMini value={ecdsaAccounts[0]} />
            </Labelled>
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
