import React from 'react';
import { withForm, FormItem, Input, Select, Radio, message } from 'components';
import { addCustomField } from 'services/knowledgeBase/sop';
import { addSOPTemplateCustomField } from 'services/knowledgeBase/sopTemplate';
import { typeMapField } from './SOPFieldSelect';
import CONSTANT from '../common/SOPConstant';

const Option = Select.Option;
const RadioGroup = Radio.Group;
const { requiredRule } = withForm.rules;

class CreateFieldModal extends React.PureComponent {
  state = {};

  submit = async value => {
    const {
      form: { validateFields },
      SOPId,
      onClose,
      setSOPDetail,
      mode,
    } = this.props;
    validateFields(async (err, values) => {
      if (!err) {
        const addFieldApi = mode === 'sopTemplate' ? addSOPTemplateCustomField : addCustomField;
        await addFieldApi(SOPId, values);
        message.success('操作成功！');
        setSOPDetail();
        // onClose();
      }
    });
  };

  render() {
    const { form, type } = this.props;
    const { getFieldDecorator } = form;
    return (
      <div>
        <FormItem label="名称">
          {getFieldDecorator('name', {
            rules: [requiredRule('名称')],
          })(<Input />)}
        </FormItem>
        <FormItem label="类型">
          {getFieldDecorator('type', {
            initialValue: typeMapField.get(type),
            rules: [requiredRule('类型')],
          })(
            <Select style={{ width: '100%' }}>
              {Array.from(CONSTANT.SOPFieldType, ([key, value]) => (
                <Option value={key}>{value}</Option>
              ))}
            </Select>,
          )}
        </FormItem>
        <FormItem label="是否多值">
          {getFieldDecorator('multi', {
            rules: [requiredRule('是否多值')],
          })(
            <RadioGroup>
              <Radio value>是</Radio>
              <Radio value={false}>否</Radio>
            </RadioGroup>,
          )}
        </FormItem>
        <FormItem label="读写权限">
          {getFieldDecorator('rwPermission', {
            rules: [requiredRule('读写权限')],
          })(
            <RadioGroup>
              {Array.from(CONSTANT.SopFieldRwPermissionMap, ([key, value]) => (
                <Radio value={key}>{value}</Radio>
              ))}
            </RadioGroup>,
          )}
        </FormItem>
      </div>
    );
  }
}

export default withForm({}, CreateFieldModal);
