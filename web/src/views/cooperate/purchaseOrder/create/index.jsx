import React, { Component } from 'react';
import _ from 'lodash';
import { withForm, message } from 'components';
import { createPurchaseOrder } from 'services/cooperate/purchaseOrder';
import SaleOrderDetailModel from 'models/cooperate/saleOrder/SaleOrderDetailModel';
import BaseForm from '../base/BaseForm';
import { formatFormValue } from '../base/utils';
import Footer from './Footer';
import Header from './Header';

type Props = {
  style: {},
  form: {
    validateFieldsAndScroll: () => {},
  },
};

type State = {
  model: SaleOrderDetailModel,
};

class CreatePurchaseOrder extends Component {
  props: Props;
  baseForm: BaseForm;
  state: State = {};

  constructor(props: Props) {
    super(props);
    const model = SaleOrderDetailModel.of();
    this.state = {
      model,
    };
  }

  onCancel = () => {
    this.context.router.history.push('/cooperate/purchaseOrders');
  };

  onSubmit = () => {
    this.props.form.validateFieldsAndScroll(async (err, vals) => {
      if (err) return;

      const { model } = this.state;
      this.setState({ loading: true });
      const format = formatFormValue(vals);
      const dto = model.getSoDTO(format, this.baseForm.customOrderFields, this.baseForm.customMaterialFields);
      await createPurchaseOrder(dto)
        .then(res => {
          message.success('创建订单成功');
          if (sensors) {
            sensors.track('web_cooperate_purchaseOrders_create', { CreateMode: '手动创建', amount: 1 });
          }
          const code = _.get(res, 'data.data.id');
          this.context.router.history.push(`/cooperate/purchaseOrders/${code}/detail`);
        })
        .catch(err => console.log(err))
        .finally(() => {
          this.setState({ loading: false });
        });
    });
  };

  render() {
    const { form } = this.props;
    return (
      <div>
        <Header />
        <BaseForm ref={ref => (this.baseForm = ref)} form={form} />
        <Footer onCancel={this.onCancel} onSave={this.onSubmit} />
      </div>
    );
  }
}

CreatePurchaseOrder.contextTypes = {
  router: {},
};

export default withForm({}, CreatePurchaseOrder);
