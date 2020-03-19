import React, { Component } from 'react';
import { Spin } from 'antd';
import { FormItem, Form, Input, Radio, Select, Attachment, Icon, Textarea } from 'components';
import { queryUnits } from 'src/services/bom/material';
import { checkStringLength, nullCharacterVerification } from 'components/form';

const RadioGroup = Radio.Group;
const Option = Select.Option;

type Props = {
  form: any,
  edit: boolean,
  material: any,
};

class BasicInfoForm extends Component {
  props: Props;

  state = {
    visible: false, // control tip visible
    loading: false,
    title: '', // 显示的提示框文字
    editing: false,
    units: [],
  };

  componentWillMount() {
    const keys = this.state.keys || [0];
    this.props.form.getFieldDecorator('keys', {
      initialValue: keys,
    });
    const { edit } = this.props;
    if (edit) {
      // edit or add
      this.setState({
        editing: true,
      });
    }
  }

  componentDidMount() {
    this.setState({ loading: true });
    queryUnits({ name })
      .then(res => {
        this.setState({ units: res.data.data });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  }

  getPayload(value) {
    const payload = {};
    Object.assign(payload, this.getBasicInfoFromFormValue(value));
    return payload;
  }

  getBasicInfoFromFormValue = value => {
    return {
      name: value.name,
      code: value.code,
      unitId: value.unitId,
      status: value.status,
      desc: value.desc,
      attachments: value.attachments ? value.attachments.map(file => file.id) : [],
    };
  };

  getAttachmentFromValue = value => {
    return { images: value.images.map(file => file.response.location).join('|') };
  };

  handleChange = e => {
    const { value } = e.target;
    if (!this.props.material) {
      return;
    }
    const {
      category: { value: categoryOldValue },
      hasUpstream,
      hasDownstream,
    } = this.props.material;
    const hasStructure = hasUpstream || hasDownstream;
    if (categoryOldValue === 'raw' && value !== 'raw' && hasStructure === true) {
      // raw => semi or prod
      this.setState({
        visible: true,
        title: (
          <span>
            <Icon type="exclamation-circle" style={{ marginRight: 10 }} />
            {`变更为${value === 'semi' ? '半成品' : '成品'}
          需要创建物料结构和生产录数信息，且会将涉及的成品结构变为未完成状态`}
          </span>
        ),
      });
    } else if (categoryOldValue !== 'raw' && value === 'raw' && hasStructure === true) {
      // semi or prod => raw
      this.setState({
        visible: true,
        title: (
          <span>
            <Icon type="exclamation-circle" style={{ marginRight: 10 }} />
            变更为原料会删除相关结果和生产录数信息
          </span>
        ),
      });
    } else {
      this.setState({ visible: false });
    }
  };

  render() {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    const { units } = this.state;
    const materialCodeFormatCheck = (rule, value, callback) => {
      const re = /^[\w*·_ /.-]+$/;
      if (!re.test(value)) {
        callback('物料编号只能由英文字母、数字、*·_ /-.组成');
      }
      callback();
    };

    return (
      <Spin spinning={this.state.loading}>
        <Form>
          <FormItem label="编号">
            {getFieldDecorator('code', {
              rules: [
                { required: true, message: '请输入物料编号' },
                { max: 30, message: '长度不能超过30个字符' },
                { validator: nullCharacterVerification('编号') },
                { validator: materialCodeFormatCheck },
                { validator: checkStringLength(30) },
              ],
            })(<Input placeholder="最多输入30字符" disabled={this.state.editing} style={{ width: 300, height: 32 }} />)}
          </FormItem>
          <FormItem label="名称">
            {getFieldDecorator('name', {
              rules: [
                { required: true, message: '请输入物料名称' },
                { max: 150, message: '长度不能超过150个字符' },
                { validator: nullCharacterVerification('名称') },
                { validator: checkStringLength(150) },
              ],
            })(<Input placeholder="最多输入150字符" style={{ width: 300, height: 32 }} />)}
          </FormItem>
          <FormItem label="状态">
            {getFieldDecorator('status', {
              rules: [{ required: true, message: '请选择物料状态' }, { validator: checkStringLength(100) }],
            })(
              <RadioGroup disabled={this.state.editing || status === 1 || status === 0}>
                <Radio value={1}>启用中</Radio>
                <Radio value={0}>停用中</Radio>
              </RadioGroup>,
            )}
          </FormItem>
          <FormItem label="单位">
            {getFieldDecorator('unitId', {
              rules: [{ required: true, message: '请选择单位' }],
            })(
              <Select placeholder="请选择" disabled={this.state.editing} style={{ width: 300, height: 32 }}>
                {units &&
                  units.map(node => (
                    <Option key={node.id} value={node.id}>
                      {node.name}
                    </Option>
                  ))}
              </Select>,
            )}
          </FormItem>
          <FormItem label="规格描述">
            {getFieldDecorator('desc', {
              rules: [{ validator: checkStringLength(100) }],
            })(<Textarea maxLength={100} style={{ width: 300, height: 100 }} placeholder="请输入规格描述" />)}
          </FormItem>
          <FormItem label="附件：">{getFieldDecorator('attachments', {})(<Attachment />)}</FormItem>
        </Form>
      </Spin>
    );
  }
}

export default BasicInfoForm;
