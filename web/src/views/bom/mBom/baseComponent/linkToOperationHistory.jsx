import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Link, Icon } from 'src/components';
import { primary } from 'src/styles/color';

class LinkToOperationHistory extends Component {
  state = {};

  render() {
    const { style, icon, iconType, id, ...rest } = this.props;
    const { router } = this.context;
    const iconStyle = { paddingRight: 10 };

    if (!id) return null;

    return (
      <Link
        style={{ ...style }}
        onClick={() => {
          router.history.push(`/bom/mbom/${id}/operationHistory`);
        }}
        icon={icon}
        iconType={iconType}
        {...rest}
      >
        查看操作记录
      </Link>
    );
  }
}

LinkToOperationHistory.propTypes = {
  style: PropTypes.object,
  icon: PropTypes.any,
  id: PropTypes.any,
  iconType: PropTypes.any,
};

LinkToOperationHistory.contextTypes = {
  router: PropTypes.any,
};

export default LinkToOperationHistory;
