/**
 * @description: 用户或者用户组的选择
 *
 * @date: 2019/4/29 下午5:50
 */
import React, { Component } from 'react';
import _ from 'lodash';

import { Select } from 'src/components/index';
import SearchSelect from 'src/components/select/searchSelect';
import { error } from 'src/styles/color';

const Option = Select.Option;

export const TYPES = {
  user: { name: '用户', value: 0 },
  userGroup: { name: '用户组', value: 1 },
};

type Props = {
  style: {},
  form: any,
  prefix: string,
  type: string,
  extraOnchangeForOperatorGroup: any,
  extraOnchangeForOperators: any,
  extraOnChangeForType: any,
  initialValue: any,
};

class UserAndUserGroupSelect extends Component {
  props: Props;
  state = {
    type: null,
  };

  componentWillMount() {
    const { prefix } = this.props;
    if (prefix) {
      this.setState({ prefix });
    } else {
      this.setState({ prefix: '' });
    }
  }

  componentDidMount() {
    this.setInitialValue();
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.initialValue, this.props.initialValue)) {
      this.setInitialValue(nextProps);
    }
  }

  setInitialValue = props => {
    const { initialValue, form } = props || this.props;
    const { prefix } = this.state;
    if (!initialValue) return;

    const { operatorType, operatorIds, operatorGroupId } = initialValue;
    this.setState({ type: operatorType }, () => {
      // prefix可能是数组元素，对象属性等。这里必须要用setFields。setFields的实现里面有用lodash。
      form.setFields({
        [`${prefix}operatorType`]: { value: operatorType },
        [`${prefix}operatorIds`]: { value: operatorIds },
        [`${prefix}operatorGroupId`]: { value: operatorGroupId },
      });
    });
  };

  renderTypeSelect = () => {
    const { form, extraOnChangeForType } = this.props;
    const { resetFields, getFieldDecorator } = form;
    const { prefix } = this.state;

    return (
      <div>
        {getFieldDecorator(`${prefix}operatorType`, {
          onChange: v => {
            if (typeof extraOnChangeForType === 'function') {
              extraOnChangeForType(v);
            }

            if (v === TYPES.user.value) {
              resetFields([`${prefix}userGroup`]);
            } else {
              resetFields([`${prefix}user`]);
            }

            this.setState({ type: v });
          },
          rules: [{ required: true, message: '用户类型必选' }],
        })(
          <Select style={{ width: 170, marginRight: 10 }}>
            {Object.values(TYPES).map(i => {
              const { name, value } = i || {};
              return (
                <Option value={value} key={value}>
                  {name}
                </Option>
              );
            })}
          </Select>,
        )}
        {form.getFieldError(`${prefix}operatorType`) ? (
          <div style={{ color: error, lineHeight: '20px' }}>{form.getFieldError(`${prefix}operatorType`)}</div>
        ) : null}
      </div>
    );
  };

  render() {
    const { form, extraOnchangeForOperatorGroup, extraOnchangeForOperators } = this.props;
    const { getFieldDecorator } = form;
    const { prefix, type } = this.state;

    return (
      <div>
        <div>
          <div style={{ display: 'inline-block' }}>{this.renderTypeSelect()}</div>
          {type === TYPES.user.value ? (
            <span>
              {getFieldDecorator(`${prefix}operatorIds`, {
                onChange: v => {
                  if (typeof extraOnchangeForOperators === 'function') {
                    extraOnchangeForOperators(v);
                  }
                },
                rules: [{ required: true, message: '用户必填' }],
              })(<SearchSelect mode={'multiple'} type={'account'} style={{ width: 190 }} />)}
            </span>
          ) : null}
          {type === TYPES.userGroup.value ? (
            <span>
              {getFieldDecorator(`${prefix}operatorGroupId`, {
                onChange: v => {
                  if (typeof extraOnchangeForOperatorGroup === 'function') {
                    extraOnchangeForOperatorGroup(v);
                  }
                },
                rules: [{ required: true, message: '用户组必填' }],
              })(<SearchSelect mode={'multiple'} type={'workgroup'} style={{ width: 190 }} />)}
            </span>
          ) : null}
        </div>
        <div>
          {form.getFieldError(`${prefix}operatorIds`) ? (
            <div style={{ color: error, lineHeight: '20px' }}>{form.getFieldError(`${prefix}operatorIds`)}</div>
          ) : null}
          {form.getFieldError(`${prefix}operatorGroupIds`) ? (
            <div style={{ color: error, lineHeight: '20px' }}>{form.getFieldError(`${prefix}operatorGroupIds`)}</div>
          ) : null}
        </div>
      </div>
    );
  }
}

export default UserAndUserGroupSelect;
