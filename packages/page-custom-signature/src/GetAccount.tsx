// Copyright 2017-2020 @polkadot/app-js authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useState } from 'react';
import styled from 'styled-components';

import { AddressMini, Button, Icon, Labelled } from '@polkadot/react-components';

import { useTranslation } from './translate';
import { useMetaMask } from './useMetaMask';

interface Props {
  allAccounts: string[];
  className?: string;
  isMine?: boolean;
  sudoKey?: string;
}

function GetAccount ({ className = '' }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { activateMetaMask, error, ethereum, loadedAccounts } = useMetaMask();
  const [ecdsaAccounts, setEcdsaAccounts] = useState<string[]>(loadedAccounts);
  const [isBusy, setIsBusy] = useState(false);

  const _onClickLoadAccount = useCallback(async () => {
    if (loadedAccounts.length < 1) {
      setIsBusy(true);
      const accounts = await activateMetaMask();

      setEcdsaAccounts(accounts);
      setIsBusy(false);
      console.log(ethereum);
    }
  }, [activateMetaMask, loadedAccounts.length, ethereum]);

  return (
    <section>
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
            <Labelled
              className='ui--Dropdown accountLabelled'
              label={t<string>('ECDSA account')}
              withLabel
            >
              <AddressMini value={ecdsaAccounts[0]} />
            </Labelled>
          )
        }
        {error && (
          <article className='error padded'>
            <div>
              <Icon icon='ban' />
              {error.message}
            </div>
          </article>
        )}
      </section>
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
