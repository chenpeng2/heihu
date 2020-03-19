import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Icon, Link } from 'src/components';
import { primary, error, blacklakeGreen } from 'src/styles/color';
import PopConfirmForMBom from 'src/containers/mBom/base/popConfirmForMBom';
import auth from 'src/utils/auth';

class LinkToEditMBom extends Component {
  state = {};

  render() {
    const { id, status, iconType, icon, style, ...rest } = this.props;
    const { router } = this.context;
    const baseStyle = { marginRight: 10, cursor: 'pointer', color: blacklakeGreen };
    const iconStyle = { paddingRight: 10, cursor: 'pointer' };

    if (!id) return null;

    if (status === 1) {
      return (
        <PopConfirmForMBom text={'已经发布的生产BOM不可编辑，请先停用该生产BOM'}>
          {icon ? <Icon iconType={iconType} type={icon} style={{ color: error, ...iconStyle }} /> : null}
          <Link type="error" style={{ marginRight: 10 }}>
            编辑
          </Link>
        </PopConfirmForMBom>
      );
    }
    return (
      <Link
        auth={auth.WEB_EDIT_MBOM_DEF}
        style={{ ...baseStyle, ...style }}
        onClick={() => {
          router.history.push(`/bom/mbom/${id}/edit`);
        }}
        iconType={iconType}
        icon={icon}
        {...rest}
      >
        编辑
      </Link>
    );
  }
}

LinkToEditMBom.propTypes = {
  style: PropTypes.object,
  id: PropTypes.string,
  status: PropTypes.any,
  iconType: PropTypes.any,
  icon: PropTypes.any,
};

LinkToEditMBom.contextTypes = {
  router: PropTypes.any,
};

export default LinkToEditMBom;
