import React from 'react';
import { withRouter } from 'react-router-dom';

import { Icon, Link } from 'src/components';
import { blacklakeGreen } from 'src/styles/color';

const LinkToHistory = (props: { id: string, history: {}, iconType: string, style: {} }) => {
  const { id, history, iconType, style } = props;
  if (!id) return null;

  const baseStyle = { margin: '0px 10px', cursor: 'pointer', color: blacklakeGreen };
  const iconStyle = { paddingRight: 10 };

  return (
    <Link
      style={{ ...baseStyle, ...style }}
      onClick={() => {
        history.push(`/bom/processRoute/${encodeURIComponent(id)}/detail/operationHistory`);
      }}
      icon={iconType}
    >
      查看操作记录
    </Link>
  );
};

export default withRouter(LinkToHistory);
