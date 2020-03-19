import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { authorityWrapper, message } from 'src/components';
import { primary } from 'src/styles/color';
import { updateDeliveryRequestStatus } from 'src/services/stock/deliveryRequest';
import log from 'src/utils/log';
import { replaceSign } from 'src/constants';
import auth from 'src/utils/auth';

import { DELIVERY_REQUEST_STATUS } from '../util';

const updateStatus = async params => {
  try {
    const res = await updateDeliveryRequestStatus(params);
    if (res && res.status === 200) {
      message.success('更新发运申请状态成功');
    }
    return res;
  } catch (e) {
    log.error(e);
  }
};

const IssueComponent = authorityWrapper(props => {
  const { baseStyle, code, cbForUpdate, status, changeChineseToLocale } = props;
  return (
    <span
      style={{
        ...baseStyle,
        opacity: status === DELIVERY_REQUEST_STATUS.create.value ? 1 : 0.4,
        marginLeft: 0,
      }}
      onClick={async () => {
        if (status === DELIVERY_REQUEST_STATUS.create.value) {
          const res = await updateStatus({ code, status: DELIVERY_REQUEST_STATUS.issued.value });
          if (sensors) {
            sensors.track('web_stock_deliveryRequest', {
              OperationID: '下发',
            });
          }
          if (res && res.status === 200 && typeof cbForUpdate === 'function') {
            cbForUpdate();
          }
        }
      }}
    >
      {changeChineseToLocale('下发')}
    </span>
  );
});

class UpdateStatus extends Component {
  state = {};

  render() {
    const { data, cbForUpdate } = this.props;
    const { changeChineseToLocale } = this.context;
    if (!data) return null;

    const { status, code } = data || {};
    const baseStyle = { color: primary, margin: '0px 5px', cursor: 'pointer' };

    // 已创建状态的操作为下发和取消
    // 已下发和执行中状态的操作为异常结束
    // 其他状态返回空
    if (
      status === DELIVERY_REQUEST_STATUS.create.value ||
      status === DELIVERY_REQUEST_STATUS.issued.value ||
      status === DELIVERY_REQUEST_STATUS.execute.value
    ) {
      return (
        <div style={{ whiteSpace: 'nowrap' }}>
          <IssueComponent
            auth={auth.WEB_DELIVERY_REQUEST_ISSUE}
            baseStyle={baseStyle}
            cbForUpdate={cbForUpdate}
            code={code}
            status={status}
            changeChineseToLocale={changeChineseToLocale}
          />
          <span
            style={{ ...baseStyle, opacity: status === DELIVERY_REQUEST_STATUS.create.value ? 1 : 0.4 }}
            onClick={async () => {
              if (status === DELIVERY_REQUEST_STATUS.create.value) {
                await updateStatus({ code, status: DELIVERY_REQUEST_STATUS.cancel.value });
                if (sensors) {
                  sensors.track('web_stock_deliveryRequest', {
                    OperationID: '取消',
                  });
                }
                if (typeof cbForUpdate === 'function') cbForUpdate();
              }
            }}
          >
            {changeChineseToLocale('取消')}
          </span>
          <span
            style={{
              ...baseStyle,
              opacity:
                status === DELIVERY_REQUEST_STATUS.issued.value || status === DELIVERY_REQUEST_STATUS.execute.value
                  ? 1
                  : 0.4,
            }}
            onClick={async () => {
              if (status === DELIVERY_REQUEST_STATUS.issued.value || status === DELIVERY_REQUEST_STATUS.execute.value) {
                await updateStatus({ code, status: DELIVERY_REQUEST_STATUS.exception.value });
                if (sensors) {
                  sensors.track('web_stock_deliveryRequest', {
                    OperationID: '异常结束',
                  });
                }
                if (typeof cbForUpdate === 'function') cbForUpdate();
              }
            }}
          >
            {changeChineseToLocale('异常结束')}
          </span>
        </div>
      );
    }
    return <div>{replaceSign}</div>;
  }
}

UpdateStatus.propTypes = {
  style: PropTypes.object,
  data: PropTypes.any,
  cbForUpdate: PropTypes.func,
};

UpdateStatus.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default UpdateStatus;
