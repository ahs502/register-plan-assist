import React, { FC } from 'react';
import SampleModal, { useSampleModalState } from 'src/components/_SampleModalComponent';

const SampleModalComponentUsage: FC = () => {
  const [sampleModalState, openSimpleModal, closeSimpleModal] = useSampleModalState();

  return (
    <div>
      <button onClick={e => openSimpleModal({ stateProperty: 10 })}>Open</button>

      <SampleModal
        state={sampleModalState}
        onClose={() => closeSimpleModal()}
        onSomeAction={someData => {
          /* ... */
        }}
        onSomeAsyncAction={async someData => {
          /* ... */
        }}
      />
    </div>
  );
};
