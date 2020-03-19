import React from 'react';
import _ from 'lodash';
import { Resizable } from 'react-resizable';

const ResizableTitle = (props: { resizableProps: { onResize: () => {} }, fixed: string }) => {
  const { resizableProps, fixed, ...restProps } = props;

  if (!_.get(resizableProps, 'width') || fixed) {
    return <th {...restProps} />;
  }

  return (
    <Resizable {...resizableProps} height={0}>
      <th {...restProps} />
    </Resizable>
  );
};

export default ResizableTitle;
