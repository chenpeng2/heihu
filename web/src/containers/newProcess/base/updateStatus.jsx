import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Link, message, Popover, Button, Alert, authorityWrapper } from 'src/components';
import { error, primary, white } from 'src/styles/color';
import { updateProcessStatus } from 'src/services/process';
import auth from 'src/utils/auth';

import { PROCESS_STATUS } from '../constant';

type Props = {
  statusNow: any,
  code: string,
  fetchData: () => {},
};

class UpdateStatus extends Component {
  props: Props;
  state = {
    showTooltip: false, // 工序停用失败的提示显示
  };

  getNesStatus = () => {
    const { statusNow } = this.props;

    return statusNow === 0 ? 1 : 0;
  };

  renderContent = () => {
    return (
      <div style={{ height: 90 }}>
        <div>
          <Alert
            style={{ width: 234, background: white, border: 'none' }}
            showIcon
            type={'error'}
            message={'停用失败！该工序已被用于发布的生产BOM和工艺路线，不可以停用！'}
          />
        </div>
        <Button
          size={'small'}
          style={{ float: 'right' }}
          type={'default'}
          onClick={() => {
            this.setState({ showTooltip: false });
          }}
        >
          {'知道了'}
        </Button>
      </div>
    );
  };

  render() {
    const { code, fetchData, beforeClick, finallyCallback } = this.props;
    const { showTooltip } = this.state;
    const nextStatus = this.getNesStatus();

    if (!code) return null;

    return (
      <Popover
        cancelText={'知道了'}
        content={this.renderContent()}
        visible={showTooltip}
        overlayStyle={{ width: 253 }}
        placement="topLeft"
      >
        <Link
          auth={auth.WEB_EDIT_PROCESS_DEF}
          style={{ marginRight: 20, color: showTooltip ? error : primary }}
          onClick={() => {
            if (typeof beforeClick === 'function') {
              beforeClick();
            }
            updateProcessStatus(code, nextStatus)
              .then(res => {
                const response = _.get(res, 'data');
                const { code } = response || {};

                if (code === 'PROCESS_STOP_FAILED') {
                  // 停用失败的判断。应该和后端一起改为抛出错误
                  this.setState({ showTooltip: true });
                } else {
                  message.success(`${PROCESS_STATUS[nextStatus]}成功`);
                  if (typeof fetchData === 'function') fetchData();
                }
              })
              .finally(() => {
                if (typeof finallyCallback === 'function') {
                  finallyCallback();
                }
              });
          }}
        >
          {PROCESS_STATUS[nextStatus]}
        </Link>
      </Popover>
    );
  }
}

UpdateStatus.propTypes = {
  beforeClick: PropTypes.func,
  finallyCallback: PropTypes.func,
};

export default UpdateStatus;
