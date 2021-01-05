// Copyright 2017-2020 @polkadot/app-js authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsic } from '@polkadot/api/types';

import React, { useCallback, useState } from 'react';
import styled from 'styled-components';

import { Button, Extrinsic, Icon, TxButton } from '@polkadot/react-components';
import { useApi } from '@polkadot/react-hooks';

import { useTranslation } from './translate';

interface Props {
  className?: string;
  isMine: boolean;
}

function CustomSignTx ({ className, isMine }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { api } = useApi();
  const [method, setMethod] = useState<SubmittableExtrinsic<'promise'> | null>(null);

  const _onChangeExtrinsic = useCallback(
    (method: SubmittableExtrinsic<'promise'> | null = null) => setMethod(() => method),
    []
  );

  return isMine
    ? (
      <section className={className}>
        <Extrinsic
          defaultValue={api.tx.balances.transfer}
          label={t<string>('submit the following extrinsic')}
          onChange={_onChangeExtrinsic}
        />
        <Button.Group>
          <TxButton
            icon='sign-in-alt'
            isDisabled={!method || !api.tx.ethCall.call}
            isUnsigned
            label={t<string>('Submit Transaction')}
            params={[method]}
            tx={api.tx.ethCall.call}
            withSpinner
          />
        </Button.Group>
      </section>
    )
    : (
      <article className='error padded'>
        <div>
          <Icon icon='ban' />
          {t<string>('You do not have access to the current sudo key')}
        </div>
      </article>
    );
}

export default React.memo(styled(CustomSignTx)`
  .sudoToggle {
    width: 100%;
    text-align: right;
  }
`);
