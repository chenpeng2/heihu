import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Spin, Button, message } from 'src/components';
import { black } from 'src/styles/color';
import BaseForm from 'src/containers/deliveryRequest/baseComponent/form/index';
import { getDeliveryRequestDetail, updateDeliveryRequest } from 'src/services/stock/deliveryRequest';
import { formatFormValue } from 'src/containers/deliveryRequest/util';
import log from 'src/utils/log';

class Edit extends Component {
  state = {
    data: null,
    loading: false,
  };

  componentDidMount() {
    this.fetchAndSetData();
  }

  fetchAndSetData = async () => {
    const { match } = this.props;
    const id = _.get(match, 'params.id');

    if (!id) return;

    this.setState({ loading: true });

    try {
      const res = await getDeliveryRequestDetail(id);
      const data = _.get(res, 'data.data');
      this.setState({ data });
    } catch (e) {
      log.error(e);
    } finally {
      this.setState({ loading: false });
    }
  };

  renderTitle = () => {
    const { changeChineseToLocale } = this.context;

    return (
      <div style={{ color: black, fontSize: 20, margin: '20px 0px' }}>{changeChineseToLocale('编辑发运申请')}</div>
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
                  await updateDeliveryRequest(_value);
                  if (sensors) {
                    sensors.track('web_stock_deliveryRequest', {
                      OperationID: '编辑',
                    });
                  }
                  message.success('编辑发运申请成功');
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
      <Spin spinning={this.state.loading}>
        <div style={{ marginLeft: 20, paddingBottom: 30 }}>
          {this.renderTitle()}
          <BaseForm isEdit initialData={this.state.data} wrappedComponentRef={inst => (this.formRef = inst)} />
          {this.renderButtons()}
        </div>
      </Spin>
    );
  }
}

Edit.propTypes = {
  style: PropTypes.object,
};

Edit.contextTypes = {
  router: PropTypes.any,
  changeChineseToLocale: PropTypes.any,
};

export default Edit;
