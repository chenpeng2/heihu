import React, { useState } from 'react';
import { Input, Select, Button, FormItem, Textarea, Checkbox } from 'src/components';
import { nameValidatorII, orderNumberFormatII } from 'src/components/form';
import { getMoveTransactionsListUrl } from './utils';
import { MODULE_NAME } from './constants';

type Props = {
  history: any,
  type: string,
  form: any,
  handleSubmit: () => {},
};

const Option = Select.Option;
const itemStyle = { width: 300, height: 32 };

const Base = (props: Props) => {
  const {
    history,
    handleSubmit,
    type,
    form: { getFieldDecorator },
  } = props;
  const [keepCreate, setKeepCreate] = useState(false);

  const renderButton = () => {
    const buttonStyle = { width: 114, height: 32 };
    return (
      <div style={{ marginLeft: 120, display: 'flex', alignItems: 'flex-end' }}>
        <Button
          type="ghost"
          style={buttonStyle}
          onClick={() => {
            history.push(getMoveTransactionsListUrl());
          }}
        >
          取消
        </Button>
        <Button
          style={{ ...buttonStyle, marginLeft: 72 }}
          onClick={() => {
            handleSubmit(keepCreate);
          }}
        >
          保存
        </Button>
        {type === 'create' ? (
          <Checkbox
            style={{ marginLeft: 20 }}
            onChange={e => {
              setKeepCreate(e.target.checked);
            }}
          >
            持续创建
          </Checkbox>
        ) : null}
      </div>
    );
  };

  return (
    <div>
      <div
        style={{
          margin: '20px 0 30px 20px',
          fontSize: 16,
        }}
      >
        {type === 'create' ? '创建' : '编辑'}移动事务
      </div>
      <FormItem label="模块名称">
        {getFieldDecorator('module', {
          rules: [{ required: true, message: '模块名称必填' }],
        })(
          <Select disabled={type === 'edit'} style={itemStyle}>
            {Object.values(MODULE_NAME).map(n => (
              <Option key={n.value}>{n.name}</Option>
            ))}
          </Select>,
        )}
      </FormItem>
      <FormItem label="事务编号">
        {getFieldDecorator('code', {
          rules: [
            { required: true, message: '事务编号必填' },
            { max: 10, message: '最多输入10个字符' },
            { validator: orderNumberFormatII('事务编号') },
          ],
        })(<Input disabled={type === 'edit'} style={itemStyle} placeholder={'请输入'} />)}
      </FormItem>
      <FormItem label="事务名称">
        {getFieldDecorator('name', {
          rules: [
            { required: true, message: '事务名称必填' },
            { max: 10, message: '最多输入10个字符' },
            { validator: nameValidatorII('事务名称') },
          ],
        })(<Input style={itemStyle} placeholder={'请输入'} />)}
      </FormItem>
      <FormItem label="备注">
        {getFieldDecorator('remark')(
          <Textarea maxLength={100} placeholder={'请输入备注'} style={{ width: 300, height: 100 }} />,
        )}
      </FormItem>
      {renderButton()}
    </div>
  );
};

export default Base;
