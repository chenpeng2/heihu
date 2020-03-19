import React from 'react';
import { withRouter } from 'react-router-dom';

import { blacklakeGreen } from 'src/styles/color';
import auth from 'src/utils/auth';
import { Link } from 'src/components';

const LinkToEdit = (props: { id: string }) => {
  const { id } = props;
  if (!id) return null;

  const baseStyle = { marginRight: 10, cursor: 'pointer', color: blacklakeGreen };

  return (
    <Link
      auth={auth.WEB_VIEW_PROCESS_ROUTING_DEF}
      style={baseStyle}
      to={`/bom/processRoute/${encodeURIComponent(id)}/detail`}
    >
      查看
    </Link>
  );
};

export default withRouter(LinkToEdit);
