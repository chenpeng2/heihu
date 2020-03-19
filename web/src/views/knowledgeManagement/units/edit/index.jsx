import React, { Component } from 'react';
import { Form } from 'antd';
import { editUnit, unit } from 'src/services/knowledgeBase/unit';
import { checkStringLength } from 'components/form';
import { Input, FormItem, withForm, message, Spin } from 'components';

type Props = {
  viewer: {
    organization: {},
  },
  id: String,
  onClose: any,
  onCompeleted: any,
  relay: {},
  match: {},
  form: any,
};

class EditUnit extends Component {
  props: Props;
  state = {
    loading: true,
  };

  async componentDidMount() {
    const { data: { data } } = await unit(this.props.id);
    this.setState({ loading: false });
    this.props.form.setFieldsValue({
      name: data.name,
      desc: data.desc,
    });
  }

  submit = async value => {
    await editUnit(this.props.id, value);
    message.success('编辑单位成功');
    this.props.onClose();
    this.props.onCompeleted();
  };

  render() {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Spin spinning={this.state.loading}>
        <Form layout="vertical">
          <FormItem label="名称">
            {getFieldDecorator('name', {
              rules: [
                { required: true, message: '请输入单位名称' },
                { min: 0, max: 12, message: '单位长度不能超过12个字' },
              ],
            })(<Input disabled />)}
          </FormItem>
          <FormItem label="备注">
            {getFieldDecorator('desc', {
              rules: [{ validator: checkStringLength() }],
            })(<Input.TextArea />)}
          </FormItem>
        </Form>
      </Spin>
    );
  }
}

const EditUnitForm = withForm({ showFooter: true }, EditUnit);

export default EditUnitForm;
