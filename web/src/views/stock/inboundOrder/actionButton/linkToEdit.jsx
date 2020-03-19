import React from 'react';
import { withRouter } from 'react-router-dom';
import { Link } from 'src/components';
import { getEditInboundOrderUrl } from './utils';

const LinkToEdit = ({ history, style, inboundOrderCode }: { history: any, style: {}, inboundOrderCode: string }) => {
  return (
    <Link
      // auth={auth.WEB_CREATE_EBOM_DEF}
      style={{ marginLeft: 20, ...style }}
      onClick={() => {
        history.push(getEditInboundOrderUrl(inboundOrderCode));
      }}
    >
      编辑
    </Link>
  );
};

export default withRouter(LinkToEdit);
