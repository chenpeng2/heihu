import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Link, message } from 'components';
import { updateQcPlanStatus } from 'services/qualityManagement/qcPlan';

import { QCPLAN_STATUS_ENABLE } from '../../constants';

const baseLinkStyle = { marginRight: 10 };

class UpdateQcPlanStatusLink extends React.Component {
  state = {};

  updateStatus = ({ code, status }) => {
    const { changeChineseToLocale } = this.context;
    const display = status === QCPLAN_STATUS_ENABLE ? changeChineseToLocale('启用') : changeChineseToLocale('停用');
    const { redirectUrl, refetchData } = this.props;

    updateQcPlanStatus({ code, status })
      .then(res => {
        const statusCode = _.get(res, 'data.statusCode');
        if (statusCode === 200) {
          message.success(`${display} ${changeChineseToLocale('成功')}`);
          if (typeof redirectUrl === 'string') {
            history.push(redirectUrl);
            return;
          }
          if (typeof refetchData === 'function') {
            refetchData();
          }
        } else {
          message.error(`${display} ${changeChineseToLocale('失败')}`);
        }
      })
      .catch(err => console.log(err));
  };

  render() {
    const { children, params, ...rest } = this.props;
    const { status, code } = params || {};
    const { changeChineseToLocale } = this.context;
    if (!code) return null;

    const display = status === QCPLAN_STATUS_ENABLE ? changeChineseToLocale('启用') : changeChineseToLocale('停用');

    return (
      <Link onClick={() => this.updateStatus({ code, status, display })} style={baseLinkStyle} {...rest}>
        {children || display}
      </Link>
    );
  }
}

UpdateQcPlanStatusLink.propTypes = {
  refetchData: PropTypes.func,
  redirectUrl: PropTypes.string,
  style: PropTypes.object,
  params: {
    status: PropTypes.number,
    code: PropTypes.string,
  },
};

UpdateQcPlanStatusLink.contextTypes = {
  changeChineseToLocale: PropTypes.func,
};

export default UpdateQcPlanStatusLink;
