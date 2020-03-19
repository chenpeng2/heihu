import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { primary } from 'src/styles/color';
import { updateCustomRuleStatus } from 'src/services/systemConfig/customRule';
import { message } from 'src/components';
import log from 'src/utils/log';

import { STATUS } from '../utils';

class UpdateStatus extends Component {
  state = {};

  render() {
    const { detailData, style, cbForUpdate } = this.props;
    if (!detailData) return null;

    const { ruleType, status, action, module, businessType } = detailData || {};

    // 规则类型为空不出现改变状态按钮，质量管理模块中业务类型仅「手动创建任务」需要停用启用状态
    if (!ruleType || (module === '质量管理' && businessType !== '手动创建任务')) return null;

    let name;
    let nextStatus;
    if (status === STATUS.disabled.value) {
      name = STATUS.enabled.name;
      nextStatus = STATUS.enabled.value;
    } else {
      name = STATUS.disabled.name;
      nextStatus = STATUS.disabled.value;
    }

    return (
      <span
        onClick={async () => {
          try {
            const res = await updateCustomRuleStatus({ action, status: nextStatus });
            if (!(res && res.status >= 200 && res.status < 300)) return;

            message.success(`${name}自定义规则成功`);
            if (typeof cbForUpdate === 'function') {
              cbForUpdate();
            }
          } catch (e) {
            log.error(e);
          }
        }}
        style={{ color: primary, cursor: 'pointer', ...style }}
      >
        {name}
      </span>
    );
  }
}

UpdateStatus.propTypes = {
  style: PropTypes.object,
  detailData: PropTypes.any,
  cbForUpdate: PropTypes.func,
};

export default UpdateStatus;
