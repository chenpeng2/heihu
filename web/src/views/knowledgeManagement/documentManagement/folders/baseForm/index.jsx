import React, { Component } from 'react';
import { Radio, FormItem, Form, Input, Textarea } from 'components';
import { checkStringLength, checkTwoSidesTrim } from 'components/form';
// 前后是否出现空格
import FolderSelect from '../../baseComponent/folderSelect';

const RadioGroup = Radio.Group;
const baseFormItemStyle = { width: 300 };

const nameFormatCheck = name => {
  return (rule, value, callback) => {
    const re = /^[\w\s\*\u00b7\_\/\.\-\uff08\uff09()\&\u4e00-\u9fa5]+$/;
    if (!re.test(value)) {
      callback(`${name}只能由中文、英文字母、数字、*·_ /-.,中文括号,英文括号,&,空格组成`);
    }
    callback();
  };
};

export const codeFormat = (rule, value, callback) => {
  const re = /[\u4e00-\u9fa5]/g;
  if (re.test(value)) {
    callback('编码只能由英文字母、数字、字符、空格组成');
  }
  callback();
};

type props = {
  form: {},
};

class FolderBaseForm extends Component<props> {
  state = {};
  render() {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Form>
        <FormItem label="父级文件夹">
          {getFieldDecorator('parentId')(<FolderSelect disabledNode={node => node.level === 3} style={{ width: 300 }} />)}
        </FormItem>
        <FormItem label="名称">
          {getFieldDecorator('name', {
            rules: [
              { validator: checkStringLength(150) },
              { validator: nameFormatCheck('文件夹名称') },
              { validator: checkTwoSidesTrim('文件夹名称') },
              { required: true, message: '名称必填' },
            ],
          })(<Input placeholder="最多输入150字符" style={{ ...baseFormItemStyle }} />)}
        </FormItem>
        <FormItem label="编码">
          {getFieldDecorator('code', {
            rules: [{ validator: checkTwoSidesTrim('文件夹编号') }, { validator: checkStringLength(50) }, { validator: codeFormat }],
          })(<Input style={baseFormItemStyle} />)}
        </FormItem>
        <FormItem label="状态">
          {getFieldDecorator('status', {
            rules: [{ required: true, message: '状态必填' }],
            initialValue: 1,
          })(
            <RadioGroup style={baseFormItemStyle}>
              <Radio value={1} style={{ marginRight: 100 }}>
                已启用
              </Radio>
              <Radio value={0}>已停用</Radio>
            </RadioGroup>,
          )}
        </FormItem>
        <FormItem label="描述">
          {getFieldDecorator('desc', {
            rules: [{ validator: checkStringLength(1000) }],
          })(<Textarea maxLength={1000} placeholder="最多输入1000字符" style={{ ...baseFormItemStyle, height: 100 }} />)}
        </FormItem>
      </Form>
    );
  }
}

export default FolderBaseForm;
