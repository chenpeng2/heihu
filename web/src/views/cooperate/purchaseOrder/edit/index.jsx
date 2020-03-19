import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import { withForm, Spin, message } from 'components';
import { editPurchaseOrder, getPurchaseOrderDetailById } from 'services/cooperate/purchaseOrder';
import SaleOrderDetailModel from 'models/cooperate/saleOrder/SaleOrderDetailModel';
import { formatFormValue } from '../base/utils';
import Header from './Header';
import Footer from './Footer';
import BaseForm from '../base/BaseForm';

type Props = {
  style: {},
  form: any,
  match: {},
};

type State = {
  id: any,
  loading: Boolean,
  purchaseOrderData: any,
  model: SaleOrderDetailModel,
};

/** 编辑销售订单 */
class EditPurchaseOrder extends Component {
  props: Props;
  state: State;
  baseForm: BaseForm;

  constructor(props: Props) {
    super(props);
    const model = SaleOrderDetailModel.of();
    this.state = {
      id: null,
      loading: false,
      purchaseOrderData: null,
      model,
    };
  }

  componentDidMount() {
    const { match } = this.props;
    const id = _.get(match, 'params.id');
    this.fetchData(id);
  }

  fetchData = async id => {
    this.setState({ loading: true });
    await getPurchaseOrderDetailById(id)
      .then(res => {
        this.setState({
          purchaseOrderData: _.get(res, 'data.data'),
          id,
        });
      })
      .catch(err => console.log(err))
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  onSubmit = () => {
    this.props.form.validateFieldsAndScroll(async (err, vals) => {
      if (err) return;

      this.setState({ loading: true });
      const format = formatFormValue(vals, this.state.purchaseOrderData);
      const { model } = this.state;
      const dto = model.getSoDTO(format, this.baseForm.customOrderFields, this.baseForm.customMaterialFields);
      const { id } = this.state;
      await editPurchaseOrder(id, dto)
        .then(res => {
          message.success('编辑订单成功');
          if (sensors) {
            sensors.track('web_cooperate_purchaseOrders_edit', {});
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

  onCancel = () => {
    const { router } = this.context;
    router.history.push('/cooperate/purchaseOrders');
  };

  render() {
    const { loading, purchaseOrderData } = this.state;
    const { form } = this.props;
    return (
      <Spin spinning={loading}>
        <Header />
        <BaseForm
          ref={ref => (this.baseForm = ref)}
          form={form}
          initialValue={purchaseOrderData}
          disabledList={{ materialList: true, purchaseOrderCode: true, customerId: true }}
        />
        <Footer onCancel={this.onCancel} onSubmit={this.onSubmit} />
      </Spin>
    );
  }
}

EditPurchaseOrder.contextTypes = {
  router: {},
};

export default withForm({}, withRouter(EditPurchaseOrder));
