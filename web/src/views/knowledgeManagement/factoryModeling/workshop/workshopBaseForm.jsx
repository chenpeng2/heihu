import React from 'react';
import { FormItem, Input, Textarea, Attachment, Select } from 'components';
import LocalStorage from 'utils/localStorage';
import SearchSelect from 'components/select/searchSelect';
import { codeFormat, qrCodeFormat } from 'components/form';
import RelationWorkerFormItem from '../common/RelationWorkerFormItem';
import RelationWorkerTooltip from '../common/RelationWorkerTooltip';

const { Option } = Select;
class WorkshopBaseForm extends React.PureComponent<any> {
  state = {};
  render() {
    const { formItemWidth } = this.props;
    const width = formItemWidth || 300;
    const {
      form: { getFieldDecorator },
      inModal,
      inEdit,
    } = this.props;
    const orgName = LocalStorage.get('orgName');
    const form = [
      {
        label: '上级区域',
        name: 'parent',
        options: {
          rules: [{ required: true, message: '上级区域为必填' }],
          initialValue: orgName,
        },
        component: (
          <Select style={{ width }} disabled>
            <Option value={orgName}>{orgName}</Option>
          </Select>
        ),
      },
      {
        label: '车间编码',
        name: 'code',
        options: {
          rules: [
            { required: true, message: '车间编码为必填' },
            { validator: codeFormat('编码') },
            {
              max: 20,
              message: '不超过20个字',
            },
          ],
        },
        component: <Input style={{ width }} disabled={inEdit} />,
      },
      {
        label: '车间名称',
        name: 'name',
        options: {
          rules: [{ required: true, message: '车间名称为必填' }, { max: 20, message: '不超过20个字' }],
        },
        component: <Input style={{ width }} />,
      },
      {
        label: '二维码',
        name: 'qrCode',
        component: <Input style={{ width }} />,
        options: {
          rules: [{ max: 30, message: '不超过30个字' }, { validator: qrCodeFormat('二维码') }],
        },
      },
      {
        label: '负责人',
        name: 'managerId',
        component: <SearchSelect type="account" style={{ width }} />,
      },
      {
        label: '备注',
        name: 'remark',
        component: <Textarea style={{ width, height: 100 }} maxLength={50} />,
      },
      {
        label: '附件',
        name: 'attachments',
        component: <Attachment style={{ width }} />,
      },
    ];
    if (inModal) {
      form.shift();
    }
    return (
      <React.Fragment>
        {form.map(({ label, name, options, component }) => (
          <FormItem label={label} key={name}>
            {getFieldDecorator(name, options || {})(component)}
          </FormItem>
        ))}
        <FormItem
          label={
            <span>
              关联人员 <RelationWorkerTooltip />
            </span>
          }
        >
          <RelationWorkerFormItem form={this.props.form} />
        </FormItem>
      </React.Fragment>
    );
  }
}

export default WorkshopBaseForm;
