import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { withForm, message, Spin } from 'src/components';
import log from 'src/utils/log';
import { addInboundOrder, getInboundOrderCode } from 'src/services/stock/inboundOrder';
import { getFormatParams } from './utils';
import { getInboundOrderDetailUrl } from './actionButton/utils';
import Base from './base';

type Props = {
  form: any,
  location: any,
  history: any,
}

class Create extends Component {
  props: Props
  state = {
    inboundOrderCode: null,
    loading: false,
  };

  async componentDidMount() {
    const { form: { setFieldsValue } } = this.props;
    this.setState({ loading: true });
    try {
      const res = await getInboundOrderCode();
      const inboundOrderCode = _.get(res, 'data.data');
      setFieldsValue({ inboundOrderCode: _.get(res, 'data.data') });
      this.setState({ inboundOrderCode, loading: false });
    } catch (e) {
      log.error(e);
      this.setState({ loading: false });
    }
  }

  handleSubmit = (materialList) => {
    const { form, history } = this.props;
    const { validateFieldsAndScroll } = form;
    const { changeChineseToLocale } = this.context;

    validateFieldsAndScroll((err, value) => {
      if (!err) {
        const params = getFormatParams(value, materialList);
        addInboundOrder(params)
          .then(() => {
            message.success(changeChineseToLocale('创建入库单成功'));
            history.push(getInboundOrderDetailUrl(params.inboundOrderCode));
          });
      }
    });
  }

  render() {
    const { form } = this.props;
    const { inboundOrderCode, loading } = this.state;
    return (
      <Spin spinning={loading}>
        <Base type="create" form={form} inboundOrderCode={inboundOrderCode} handleSubmit={this.handleSubmit} />
      </Spin>
    );
  }
}

Create.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default withForm({}, Create);
