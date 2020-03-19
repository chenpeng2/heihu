import React from 'react';
import { Select, FormItem, Input } from 'components';
import SearchSelect from 'components/select/searchSelect';
import CONSTANT from '../common/SOPConstant';
import SOPFieldSelect from './SOPFieldSelect';

const Option = Select.Option;
const width = 200;

const DefaultValueLogicSelect = props => {
  const { types, form, SOPDetail, ...rest } = props;
  const { getFieldDecorator, getFieldValue, resetFields } = form;
  const renderDefaultLogicValueField = () => {
    const inputDefaultLogic = getFieldValue('inputDefaultLogic');
    const type = getFieldValue('type');
    if (inputDefaultLogic === CONSTANT.LOGIC_BUSINESS) {
      return <SOPFieldSelect labelInValue SOPDetail={SOPDetail} type={type} />;
    } else if (inputDefaultLogic === CONSTANT.LOGIC_FIXED_VALUE || inputDefaultLogic === CONSTANT.LOGIC_TRIGGER) {
      return <Input style={{ width }} />;
    } else if (inputDefaultLogic === CONSTANT.LOGIC_FIXED_USER) {
      return <SearchSelect type="user" style={{ width }} />;
    }
    return <div />;
  };
  return (
    <FormItem label="默认值逻辑">
      <div>
        {getFieldDecorator('inputDefaultLogic')(
          <Select
            style={{ width: 200, marginRight: 10 }}
            allowClear
            onChange={() => {
              resetFields(['inputDefaultValue']);
            }}
            {...rest}
          >
            {types.map(key => (
              <Option value={key} key={key}>
                {CONSTANT.SopControlShowLogic.get(key)}
              </Option>
            ))}
          </Select>,
        )}
      </div>
      <div>
        <FormItem style={{ marginBottom: 0 }}>
          {getFieldDecorator('inputDefaultValue', {
            rules: [{ required: true, message: '默认值逻辑值不能为空' }],
            hidden: ![
              CONSTANT.LOGIC_FIXED_VALUE,
              CONSTANT.LOGIC_BUSINESS,
              CONSTANT.LOGIC_TRIGGER,
              CONSTANT.LOGIC_FIXED_USER,
            ].includes(getFieldValue('inputDefaultLogic')),
          })(renderDefaultLogicValueField())}
        </FormItem>
      </div>
    </FormItem>
  );
};

export default DefaultValueLogicSelect;
