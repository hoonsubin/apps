// Copyright 2017-2020 @polkadot/app-custom-signature authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsic } from '@polkadot/api/types';

import React, { useCallback, useState } from 'react';
import styled from 'styled-components';

import { Button, Extrinsic, Icon, TxButton } from '@polkadot/react-components';
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
  // internal message state
  const [errorMessage, setErrorMessage] = useState<Error>();

  const _onChangeExtrinsic = useCallback(
    (method: SubmittableExtrinsic<'promise'> | null = null) => {
      // reset the signature if the user changes the extrinsic
      setCallSignature(undefined);
      setMethod(() => method);
    }, []
  );

  const _onClickSignCall = useCallback(async () => {
    if (method) {
      setIsBusy(true);
      // fixme: the call serialization method is different from what the chain is expecting, which will spit a `Bad Signature` error
      const callPayload = method.toHex(true);

      try {
        // reset the error message if it already exists
        if (typeof errorMessage !== 'undefined') {
          setErrorMessage(undefined);
        }

        const callSig = await onClickSignTx(callPayload);

        setCallSignature(callSig);
      } catch (err) {
        console.log(err);
        setErrorMessage(err);
      } finally {
        setIsBusy(false);
      }
    }
  }, [errorMessage, method, onClickSignTx]);

  return (
    <section className={className}>
      <Extrinsic
        defaultValue={api.tx.balances.transfer}
        label={t<string>('submit the following extrinsic')}
        onChange={_onChangeExtrinsic}
      />
      <Button.Group>
        {/* TODO: transaction button to be in a modal layout (ask for signature -> waiting for response indicator -> send transaction) */}
        {callSignature
          ? <TxButton
            icon='paper-plane'
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

export default React.memo(styled(CustomSignTx)`

`);
