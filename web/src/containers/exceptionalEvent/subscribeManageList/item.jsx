import React from 'react';

import { Tooltip } from 'src/components';
import { lightGrey, greyWhite } from 'src/styles/color';

const Item = (props: { text: string }) => {
  const { text } = props;

  return (
    <div
      style={{
        display: 'inline-block',
        background: greyWhite,
        border: `1px solid ${lightGrey}`,
        padding: '0 5px',
        margin: '0 5px 5px 0',
      }}
    >
      <Tooltip text={text} length={8} />
    </div>
  );
};

export default Item;
