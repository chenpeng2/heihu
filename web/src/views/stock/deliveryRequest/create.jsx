import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Button, message } from 'src/components';
import { black } from 'src/styles/color';
import BaseForm from 'src/containers/deliveryRequest/baseComponent/form/index';
import { formatFormValue } from 'src/containers/deliveryRequest/util';
import { createDeliveryRequest } from 'src/services/stock/deliveryRequest';
import log from 'src/utils/log';

class Create extends Component {
  state = {};

  renderTitle = () => {
    const { changeChineseToLocale } = this.context;
    return (
      <div style={{ color: black, fontSize: 20, margin: '20px 0px' }}>{changeChineseToLocale('创建发运申请')}</div>
    );
  };

  renderButtons = () => {
    const { router, changeChineseToLocale } = this.context;
    const baseStyle = { width: 120 };

    return (
      <div style={{ marginLeft: 120 }}>
        <Button
          style={{ ...baseStyle }}
          type={'default'}
          onClick={() => {
            if (router) {
              router.history.push('/stock/deliveryRequest');
            }
          }}
        >
          {changeChineseToLocale('取消')}
        </Button>
        <Button
          type={'primary'}
          style={{ ...baseStyle, marginLeft: 10 }}
          onClick={async () => {
            if (!this.formRef) return null;
            const getFormValue = _.get(this.formRef, 'wrappedInstance.getFormValue');
            if (typeof getFormValue === 'function') {
              const value = getFormValue();
              if (value) {
                const _value = formatFormValue(value);
                try {
                  await createDeliveryRequest(_value);
                  if (sensors) {
                    sensors.track('web_stock_deliveryRequest', {
                      OperationID: '创建',
                    });
                  }
                  message.success('创建发运申请成功');
                  if (router) {
                    router.history.push('/stock/deliveryRequest');
                  }
                } catch (e) {
                  log.error(e);
                }
              }
            }
          }}
        >
          {changeChineseToLocale('确定')}
        </Button>
      </div>
    );
  };

  render() {
    return (
      <div style={{ marginLeft: 20, paddingBottom: 30 }}>
        {this.renderTitle()}
        <BaseForm wrappedComponentRef={inst => (this.formRef = inst)} />
        {this.renderButtons()}
      </div>
    );
  }
}

Create.propTypes = {
  style: PropTypes.object,
};

Create.contextTypes = {
  router: PropTypes.any,
  changeChineseToLocale: PropTypes.any,
};

export default Create;
