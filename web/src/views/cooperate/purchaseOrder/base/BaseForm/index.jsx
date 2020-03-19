import React, { Component } from 'react';
import _ from 'lodash';
import SearchSelect from 'components/select/searchSelect';
import { getAttachments } from 'services/attachment';
import { orderNumberFormat, checkStringLength } from 'components/form';
import { FormItem, Form, Input, Textarea, Attachment } from 'components';
import moment from 'utils/time';
import { getSOCustomProperty } from 'models/cooperate/saleOrder/service';
import { getDeliveryRequestByPurchaseOrder } from 'services/cooperate/purchaseOrder';
import BaseFormModel from 'models/cooperate/saleOrder/BaseFormModel';
import MaterialTable from '../materialTable';
import CustomOrderField from './CustomOrderField';
import WorkOrderItem from './WorkOrderItem';

const INPUT_WIDTH = 300;

type Props = {
  style: {},
  form: {
    setFieldsValue: () => {},
    getFieldsValue: () => {},
  },
  initialValue: any,
  disabledList: [],
};

type State = {
  model: BaseFormModel,
  customerData: any,
  materialList: any[],
};

class BaseForm extends Component {
  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);
    const { initialValue } = props;
    const model = BaseFormModel.of();
    model.saleOrder = initialValue;
    this.state = {
      customerData: null, // 客户的option
      materialList: [],
      model,
    };
  }

  componentDidMount() {
    const fetchCustomProperty = async () => {
      try {
        const properties = await getSOCustomProperty();
        const { model } = this.state;
        model.customProperty = properties;
        this.setState({ model });
      } catch (error) {
        //
      }
    };
    fetchCustomProperty();
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.initialValue, this.props.initialValue)) {
      this.setInitialData(nextProps.initialValue);
    }
  }

  get customOrderFields() {
    const { model } = this.state;
    return model.customOrderFields;
  }

  get customMaterialFields() {
    const { model } = this.state;
    return model.customMaterialFields;
  }

  formatAndCheckMaterialList = async initialValue => {
    const { purchaseOrderCode, materialList } = initialValue || {};
    let _materialList;

    if (materialList && materialList.length > 0) {
      _materialList = materialList.map(data => {
        const { amountDone } = data;
        if (Number(amountDone) > 0) {
          return {
            ...data,
            disabled: true,
            deletable: false,
            cantDeleteMsg: '已按订单出厂的物料不能删除',
          };
        }
        return data;
      });
      const lineIds = _materialList.map(({ id }) => id);
      await getDeliveryRequestByPurchaseOrder({
        headerStatus: [0, 1, 2, 3, 5, 4],
        code: purchaseOrderCode,
        lineIds,
      })
        .then(res => {
          const data = _.get(res, 'data.data');
          _materialList = _materialList.map(line => {
            const { id } = line;
            const deliveryRequest = _.find(data, o => o.purchaseLineNo === id);
            if (deliveryRequest) {
              let disabled = false;
              let deletable = true;
              let amountDisabled = false;
              let targetDateDisabled = false;
              let cantDeleteMsg = '已有关联的发运申请，不能删除';
              const { headerStatus } = deliveryRequest;
              switch (headerStatus) {
                case 0:
                case 1:
                case 2:
                case 3:
                  disabled = true;
                  deletable = false;
                  amountDisabled = true;
                  targetDateDisabled = true;
                  break;
                case 4:
                  cantDeleteMsg = '';
                  break;
                case 5:
                  disabled = true;
                  deletable = false;
                  amountDisabled = true;
                  targetDateDisabled = true;
                  break;

                default:
                  break;
              }
              return {
                ...line,
                disabled,
                deletable,
                cantDeleteMsg,
                amountDisabled,
                targetDateDisabled,
              };
            }
            return line;
          });
        })
        .catch(err => console.log(err));
      _materialList = _materialList.map(data => {
        const { planWorkOrder, projects } = data;
        if (_.get(planWorkOrder, 'length') > 0) {
          return {
            ...data,
            disabled: true,
            deletable: false,
            cantDeleteMsg: '已有关联的计划工单，不能删除',
          };
        }
        if (_.get(projects, 'length') > 0) {
          return { ...data, disabled: true, deletable: false, cantDeleteMsg: '已有关联的项目，不能删除' };
        }
        return data;
      });
    }
    this.setState({ materialList: _materialList });
  };

  setInitialData = initialValue => {
    const { model } = this.state;
    model.saleOrder = initialValue;
    if (initialValue) {
      const { attachments, remark, customer, targetDate, purchaseOrderCode } = initialValue;
      if (attachments && attachments.length > 0) {
        this.fetchAndSetAttachments(attachments);
      }
      this.props.form.setFieldsValue({
        targetDate: moment(targetDate),
        customerId: customer ? { key: customer.id, label: customer.name } : undefined,
        purchaseOrderCode,
        remark,
      });
      this.formatAndCheckMaterialList(initialValue);
    }
  };

  fetchAndSetAttachments = async ids => {
    const {
      data: { data },
    } = await getAttachments(ids);
    const attachments = data.map(x => {
      x.originalFileName = x.original_filename;
      x.originalExtension = x.original_extension;
      return x;
    });
    this.props.form.setFieldsValue({ attachments });
  };

  renderForm = () => {
    const { form, disabledList } = this.props;
    const { getFieldDecorator } = form;
    const { materialList, model } = this.state;
    const orderCodeRules = [
      {
        required: true,
        message: '订单必填',
      },
      { max: 20, message: '订单号长度不能超过20个字' },
      { validator: orderNumberFormat('订单号') },
    ];
    const customerIdRules = [{ required: true, message: '请选择客户' }];
    const remarkRules = [{ validator: checkStringLength(1000) }];

    return (
      <Form>
        <FormItem label="订单号">
          {getFieldDecorator('purchaseOrderCode', { rules: orderCodeRules })(
            <Input style={{ width: INPUT_WIDTH }} disabled={disabledList ? disabledList.purchaseOrderCode : false} />,
          )}
        </FormItem>
        <FormItem label="客户">
          {getFieldDecorator('customerId', { rules: customerIdRules })(
            <SearchSelect
              style={{ width: INPUT_WIDTH }}
              params={{ status: 1 }}
              disabled={disabledList ? disabledList.purchaseOrderCode : false}
              type="customer"
              placeholder="请选择客户"
            />,
          )}
        </FormItem>
        <WorkOrderItem visible={model.workOrderVisible} workOrders={model.allWorkOrderStr} />
        <FormItem label="物料">
          <MaterialTable
            form={form}
            fieldName="materialList"
            initialValue={materialList}
            edit={disabledList ? disabledList.materialList : false}
            soCustomFields={model.customMaterialFields}
          />
        </FormItem>
        <CustomOrderField form={form} inputWidth={INPUT_WIDTH} fields={model.customOrderFields} />
        <FormItem label="备注">
          {getFieldDecorator('remark', { rules: remarkRules })(
            <Textarea placeholder="请输入备注" style={{ width: INPUT_WIDTH, height: 100 }} maxLength={1000} />,
          )}
        </FormItem>
        <FormItem label="附件">{getFieldDecorator('attachments')(<Attachment />)}</FormItem>
      </Form>
    );
  };

  render() {
    return <div>{this.renderForm()}</div>;
  }
}

export default BaseForm;
