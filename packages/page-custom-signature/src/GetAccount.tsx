// Copyright 2017-2020 @polkadot/app-js authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useState } from 'react';
import styled from 'styled-components';

import { AddressMini, Button, Icon, Labelled } from '@polkadot/react-components';

import { useTranslation } from './translate';
import { useMetaMask } from './useMetaMask';
import * as utils from './utils';

interface Props {
  allAccounts: string[];
  className?: string;
}

function GetAccount ({ className = '' }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { activateMetaMask, ethereum, loadedAccounts } = useMetaMask();
  // internal message state
  const [errorMessage, setErrorMessage] = useState<Error>();
  // note: currently, MetaMask will only export one account at a time.
  // so this value will always be either an empty array or an array with one item.
  const [ecdsaAccounts, setEcdsaAccounts] = useState<string[]>(loadedAccounts);
  const [isBusy, setIsBusy] = useState(false);

  const _onClickLoadAccount = useCallback(async () => {
    // note: a placeholder message to login
    const SIGN_MSG = 'hello world';

    if (loadedAccounts.length < 1) {
      setIsBusy(true);

      try {
        const accounts = await activateMetaMask();
        const signature = await ethereum?.request({ method: 'personal_sign', params: [accounts[0], SIGN_MSG] });
        const pubKey = utils.recoverPublicKeyFromSig(accounts[0], SIGN_MSG, signature as string);
        // note: the address prefix is hard-coded right now. Fix this this to be read dynamically
        const ss58Address = utils.ecdsaToSs58(pubKey, 42);

        setEcdsaAccounts([ss58Address]);

        console.log(signature);
      } catch (err) {
        setErrorMessage(err);
      } finally {
        setIsBusy(false);
      }
    }
  }, [activateMetaMask, loadedAccounts.length, ethereum]);

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
  align-items: flex-end;
  justify-content: center;

  .summary {
    text-align: center;
  }

  .ecdsaInputAddress {
    margin: -0.25rem 0.5rem -0.25rem 0;
  }

  .accountLabelled {
    align-items: center;
  }
`);
