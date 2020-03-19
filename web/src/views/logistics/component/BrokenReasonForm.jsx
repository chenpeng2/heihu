import React from 'react';
import { withForm, FormItem, Input, message } from 'components';
import SearchSelect from 'components/select/searchSelect';
import {
  createReceiptDamageReason,
  editReceiptDamageReason,
  createSendDamageReason,
  editSendDamageReason,
} from 'services/shipment/damage';
import { checkPositiveInteger } from 'components/form';

class BrokenReasonForm extends React.PureComponent<any> {
  state = {};

  componentDidMount() {
    const { edit, value, form: { setFieldsValue } } = this.props;
    if (edit) {
      const { description, unit, notifyCount } = value;
      setFieldsValue({
        description,
        notifyCount,
        unit: unit && {
          key: unit.id,
          label: unit.name,
        },
      });
    }
  }

  submit = async value => {
    const { type, edit, callback } = this.props;
    const submitValue = {
      description: value.description,
      notifyCount: value.notifyCount && parseInt(value.notifyCount, 10),
      unitId: value.unit && value.unit.key,
    };
    if (type === 'receipt') {
      if (edit) {
        await editReceiptDamageReason(this.props.value.id, submitValue);
      } else {
        await createReceiptDamageReason(submitValue);
      }
    } else if (type === 'send') {
      if (edit) {
        await editSendDamageReason(this.props.value.id, submitValue);
      } else {
        await createSendDamageReason(submitValue);
      }
    }
    message.success('操作成功！');
    callback();
  };

  render() {
    const { form: { getFieldDecorator, getFieldValue }, type, edit } = this.props;
    const tip =
      type === 'send'
        ? '<成品发运>任务，车号：<车牌号-承运商>，<物料编码/物料名称><当前破损原因>破损数量<数量><单位>'
        : '<纸箱收货>任务，车号：<车牌号-承运商>，<物料编码/物料名称><当前破损原因>破损数量<数量><单位>';
    return (
      <div>
        <FormItem label="破损原因">
          {getFieldDecorator('description', {
            rules: [
              { required: true, message: '请输入破损原因' },
              { max: 10, message: '破损原因长度不能超过10' },
            ],
          })(<Input />)}
        </FormItem>
        <FormItem label="通知规则">
          <span>超过 </span>
          {getFieldDecorator('notifyCount')(
            <Input style={{ width: 100, margin: '0 4px' }} placeholder="输入整数" />,
          )}
          {getFieldDecorator('unit')(
            <SearchSelect type="unit" style={{ width: 100, margin: '0 4px' }} />,
          )}
          <span>，发送通知给保管员</span>
        </FormItem>
        <FormItem label="通知内容">
          <span>{tip}</span>
        </FormItem>
      </div>
    );
  }
}

export default withForm({}, BrokenReasonForm);
