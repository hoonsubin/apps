// Copyright 2017-2020 @polkadot/app-custom-signature authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsic } from '@polkadot/api/types';

import React, { useCallback, useState } from 'react';
import styled from 'styled-components';

import { Button, Extrinsic, TxButton } from '@polkadot/react-components';
import { useApi } from '@polkadot/react-hooks';

import { useTranslation } from '../translate';

interface Props {
  // method that takes the payload and returns its signature
  onClickSignTx: (payload: string) => Promise<string | undefined>;
  sender: string;
  className?: string;
}

function CustomSignTx ({ className, onClickSignTx, sender }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { api } = useApi();
  const [method, setMethod] = useState<SubmittableExtrinsic<'promise'> | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [callSignature, setCallSignature] = useState<string>();

  const _onChangeExtrinsic = useCallback(
    (method: SubmittableExtrinsic<'promise'> | null = null) => {
      // reset the signature if the user changes the extrinsic
      setCallSignature(undefined);
      setMethod(() => method);
    }, []
  );

  const _onClickSignCall = useCallback(async () => {
    setIsBusy(true);

    if (method) {
      // fixme: the call serialization method is different from what the chain is expecting
      const callPayload = method.toJSON();

      try {
        const callSig = await onClickSignTx(callPayload);

        setCallSignature(callSig);
      } catch (err) {
        // todo: add proper error message display
        console.log(err);
      } finally {
        setIsBusy(false);
      }
    }
  }, [method, onClickSignTx]);

  return (
    <section className={className}>
      <Extrinsic
        defaultValue={api.tx.balances.transfer}
        label={t<string>('submit the following extrinsic')}
        onChange={_onChangeExtrinsic}
      />
      <Button.Group>
        {callSignature
          ? <TxButton
            icon='sign-in-alt'
            isDisabled={!callSignature}
            isUnsigned
            label={t<string>('Send Transaction')}
            params={[method, sender, callSignature]}
            tx={api.tx.ethCall.call}
            withSpinner
          />
          : <Button
            icon='sign-in-alt'
            isBusy={isBusy}
            isDisabled={!method || !api.tx.ethCall.call}
            label={t<string>('Sign Transaction')}
            onClick={_onClickSignCall}
          />}

      </Button.Group>
    </section>
  );
}

export default React.memo(styled(CustomSignTx)`

`);
