import React, { Component } from 'react';
import _ from 'lodash';
import { Spin } from 'antd';
import { middleGrey } from 'src/styles/color';
import { FormItem, Form, Input, Radio, Searchselect, Attachment, Textarea } from 'components';
import { getSpareParts } from 'src/services/equipmentMaintenance/spareParts';
import { checkStringLength, codeInUrlValidator } from 'components/form';

const RadioGroup = Radio.Group;

type Props = {
  form: any,
  edit: boolean,
  data: any,
  loading: boolean,
  location: {},
};

class BasicInfoForm extends Component {
  props: Props;

  state = {
    loading: false,
  };

  componentWillMount() {
    if (this.props.edit) {
      this.fetchData();
    }
  }

  fetchData = () => {
    const { location: { query }, form } = this.props;
    const { code } = query;
    this.setState({ loading: true });
    getSpareParts(encodeURIComponent(code))
      .then(res => {
        const data = res.data.data;
        if (data.attachments && data.attachments.length) {
          data.attachments = _.cloneDeep(data.attachmentFiles);
          data.attachments.forEach(n => {
            n.originalFileName = n.original_filename;
            n.restId = n.id;
          });
        }
        form.setFieldsValue(data);
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  render() {
    const { form, edit } = this.props;
    const { loading } = this.state;
    const { getFieldDecorator } = form;
    const materialCodeFormatCheck = (rule, value, callback) => {
      const re = /^[\w*·_/.-]+$/;
      if (!re.test(value)) {
        callback('备件编号只能由英文字母、数字、*·_/-.组成');
      }
      callback();
    };
    const materialNameFormatCheck = (rule, value, callback) => {
      const re = /^[\w\u4e00-\u9fa5*·_/.-]+$/;
      if (!re.test(value)) {
        callback('备件名称只能由中文、英文字母、数字、*·_/-.组成');
      }
      callback();
    };

    return (
      <Spin spinning={loading}>
        <Form>
          <FormItem label="编号">
            {getFieldDecorator('code', {
              rules: [
                { required: true, message: '请输入备件编号' },
                { max: 30, message: '长度不能超过30个字符' },
                { validator: materialCodeFormatCheck },
                { validator: checkStringLength(30) },
              ],
            })(<Input placeholder="最多输入30字符" disabled={edit} style={{ width: 300, height: 32 }} />)}
          </FormItem>
          <FormItem label="名称">
            {getFieldDecorator('name', {
              rules: [
                { required: true, message: '请输入备件名称' },
                { max: 150, message: '长度不能超过150个字符' },
                { validator: materialNameFormatCheck },
                { validator: checkStringLength(150) },
              ],
            })(<Input placeholder="最多输入150字符" style={{ width: 300, height: 32 }} />)}
          </FormItem>
          <FormItem label="状态">
            {getFieldDecorator('enableStatus', {
              initialValue: status || null,
              rules: [{ required: true, message: '请选择备件状态' }],
            })(
              <RadioGroup disabled={edit}>
                <Radio value={1}>启用中</Radio>
                <Radio value={0}>停用中</Radio>
              </RadioGroup>,
            )}
          </FormItem>
          <FormItem label="消耗品">
            {getFieldDecorator('consumable', {
              initialValue: 0,
              rules: [{ required: true, message: '请选择备件是否为消耗品' }],
            })(
              <RadioGroup>
                <Radio value={1}>是</Radio>
                <Radio value={0}>否</Radio>
              </RadioGroup>,
            )}
          </FormItem>
          <FormItem label="单位">
            {getFieldDecorator('unit', {
              rules: [{ required: true, message: '请选择单位' }],
            })(
              <Searchselect labelInValue={false} placeholder="请选择" disabled={edit} style={{ width: 300, height: 32 }} type={'unit'} />,
            )}
          </FormItem>
          <FormItem label="规格描述">
            {getFieldDecorator('desc', {
              rules: [{ validator: checkStringLength(100) }],
            })(<Textarea maxLength={100} style={{ width: 300, height: 100 }} placeholder="请输入规格描述" />)}
          </FormItem>
          <FormItem label="附件：">
            {getFieldDecorator('attachments', {})(
              <Attachment
                prompt={
                  <div
                    style={{
                      color: middleGrey,
                      position: 'absolute',
                      marginLeft: 120,
                      top: 0,
                      width: 570,
                    }}
                  >
                    支持扩展名：JPG/PNG/JPEG/PDF，最大不能超过10M
                  </div>
                }
              />,
            )}
          </FormItem>
        </Form>
      </Spin>
    );
  }
}

export default BasicInfoForm;
