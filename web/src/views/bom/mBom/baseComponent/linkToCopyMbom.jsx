import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Icon, Link } from 'src/components';
import auth from 'src/utils/auth';
import { blacklakeGreen, primary } from 'src/styles/color';

class LinkToCopyMbom extends Component {
  state = {};

  render() {
    const baseStyle = { marginRight: 10, cursor: 'pointer', color: blacklakeGreen };
    const { id, icon, style, iconType, ...rest } = this.props;
    const iconStyle = { paddingRight: 10 };
    const { router } = this.context;

    if (!id) return null;

    return (
      <Link
        auth={auth.WEB_CREATE_MBOM_DEF}
        style={{ ...baseStyle, ...style }}
        onClick={() => {
          router.history.push(`/bom/mbom/${id}/copy`);
        }}
        icon={icon}
        iconType={iconType}
        {...rest}
      >
        复制
      </Link>
    );
  }
}

LinkToCopyMbom.propTypes = {
  style: PropTypes.object,
  icon: PropTypes.any,
  iconType: PropTypes.any,
};

LinkToCopyMbom.contextTypes = {
  router: PropTypes.any,
};

export default LinkToCopyMbom;
