import React from 'react';
import { withRouter } from 'react-router-dom';
import { Button } from 'src/components';
import { getCreateInboundOrderUrl } from './utils';

const LinkToCreate = ({ history, style }: { history: any, style: {} }) => {
  return (
    <Button
      style={style}
      icon="plus-circle-o"
      onClick={() => {
        history.push(getCreateInboundOrderUrl());
      }}
    >
      创建入库单
    </Button>
  );
};

export default withRouter(LinkToCreate);
