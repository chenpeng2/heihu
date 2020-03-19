import React, { Component } from 'react';
import { Radio, FormItem, Form, Input, Textarea, Attachment } from 'components';
import { checkStringLength, codeFormat, checkTwoSidesTrim, requiredRule } from 'components/form';
import FolderSelect from '../../baseComponent/folderSelect';

const RadioGroup = Radio.Group;
const baseFormItemStyle = { width: 300 };

type props = {
  form: {},
  type: string,
};

const codeFormatCheck = name => {
  return (rule, value, callback) => {
    const re = /^[\w\s\*\u00b7\_\/\.\-\uff08\uff09()\&]+$/;
    if (!re.test(value)) {
      callback(`${name}只能由英文字母、数字、*·_ /-.,中文括号,英文括号,&,空格组成`);
    }
    callback();
  };
};

export const versionFormat = type => {
  return (rule, value, callback) => {
    const re = /[\u4e00-\u9fa5]/g;
    if (re.test(value)) {
      callback(`${type}只能由英文字母、数字、字符、空格组成`);
    }
    callback();
  };
};

class FolderBaseForm extends Component<props> {
  state = {};
  render() {
    const { form, type } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Form>
        <FormItem label="文档编码">
          {getFieldDecorator('code', {
            rules: [
              requiredRule('编号'),
              { validator: checkStringLength(50) },
              { validator: checkTwoSidesTrim('文档编码') },
              { validator: codeFormatCheck('文档编码') },
            ],
          })(<Input disabled={type === 'edit' || type === 'changeVersion'} style={baseFormItemStyle} />)}
        </FormItem>
        <FormItem label="文档版本">
          {getFieldDecorator('version', {
            rules: [
              { validator: checkStringLength(50) },
              { validator: checkTwoSidesTrim('文档版本') },
              { validator: versionFormat('文档版本') },
              { required: true, message: '版本必填' },
            ],
          })(<Input disabled={type === 'edit'} style={baseFormItemStyle} />)}
        </FormItem>
        <FormItem label="文件夹">
          {getFieldDecorator('folderId', {
            rules: [{ required: true, message: '文件夹必填' }],
          })(<FolderSelect style={{ width: 300 }} />)}
        </FormItem>
        <FormItem label="状态">
          {getFieldDecorator('status', {
            rules: [{ required: true, message: '状态必填' }],
            initialValue: 1,
          })(
            <RadioGroup style={baseFormItemStyle}>
              <Radio value={1} style={{ marginRight: 100 }}>
                已发布
              </Radio>
              <Radio value={0}>已归档</Radio>
            </RadioGroup>,
          )}
        </FormItem>
        <FormItem label="描述">
          {getFieldDecorator('desc', {
            rules: [{ validator: checkStringLength(1000) }],
          })(
            <Textarea maxLength={1000} placeholder="最多输入1000字符" style={{ ...baseFormItemStyle, height: 100 }} />,
          )}
        </FormItem>
        <FormItem label="上传文档">
          {getFieldDecorator('attachments', {
            rules: [{ required: true, message: '上传文档必填' }],
          })(<Attachment disabled={type === 'edit'} max={1} />)}
        </FormItem>
      </Form>
    );
  }
}

export default FolderBaseForm;
