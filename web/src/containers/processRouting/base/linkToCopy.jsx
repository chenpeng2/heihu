import React from 'react';
import { withRouter } from 'react-router-dom';

import { Icon, Link } from 'src/components';
import { blacklakeGreen } from 'src/styles/color';
import auth from 'src/utils/auth';

const LinkToCopy = (props: { id: string, history: {}, iconType: string, style: {} }) => {
  const { id, history, iconType, style } = props;
  if (!id) return null;

  const baseStyle = { margin: '0px 10px', cursor: 'pointer', color: blacklakeGreen };
  const iconStyle = { paddingRight: 10 };

  return (
    <Link
      style={{ ...baseStyle, ...style }}
      to={`/bom/processRoute/${encodeURIComponent(id)}/copy`}
      auth={auth.WEB_CREATE_PROCESS_ROUTING_DEF}
      icon={iconType}
    >
      复制
    </Link>
  );
};

export default withRouter(LinkToCopy);
