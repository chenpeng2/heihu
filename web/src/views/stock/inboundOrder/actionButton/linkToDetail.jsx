import React from 'react';
import { withRouter } from 'react-router-dom';
import { Link } from 'src/components';
import { getInboundOrderDetailUrl } from './utils';

const LinkToDetail = ({ history, style, inboundOrderCode }: { history: any, style: {}, inboundOrderCode: string }) => {
  return (
    <Link
      style={style}
      onClick={() => {
        history.push(getInboundOrderDetailUrl(inboundOrderCode));
      }}
    >
      查看
    </Link>
  );
};

export default withRouter(LinkToDetail);
