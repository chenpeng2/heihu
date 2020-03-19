import React from 'react';
import { withRouter } from 'react-router-dom';

import { Icon, Popconfirm, Link, FormattedMessage } from 'src/components';
import { blacklakeGreen, error } from 'src/styles/color';
import auth from 'src/utils/auth';

const PopConfirm = Popconfirm.PopConfirmWithCustomButton;

const LinkToEdit = (props: { id: string, history: {}, statusNow: {}, iconType: string, style: {} }) => {
  const { id, statusNow, iconType, style, history } = props;
  if (!id) return null;

  const baseStyle = { margin: '0px 10px', cursor: 'pointer', color: blacklakeGreen };
  const iconStyle = { paddingRight: 10 };

  if (statusNow === 1) {
    return (
      <PopConfirm text={<FormattedMessage defaultMessage={'已经发布的工艺路线不可编辑，请先停用该工艺路线'} />}>
        <span style={baseStyle}>
          {iconType ? <Icon type={iconType} style={{ color: error, ...iconStyle }} /> : null}
          <Link type="error">编辑</Link>
        </span>
      </PopConfirm>
    );
  }

  return (
    <Link
      auth={auth.WEB_EDIT_PROCESS_ROUTING_DEF}
      style={{ ...baseStyle, ...style }}
      to={`/bom/processRoute/${encodeURIComponent(id)}/edit`}
      icon={iconType}
    >
      编辑
    </Link>
  );
};

export default withRouter(LinkToEdit);
