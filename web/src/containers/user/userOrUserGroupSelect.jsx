/**
 * @description: 用户或者用户组的选择
 *
 * @date: 2019/4/29 下午5:50
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Select } from 'src/components/index';
import SearchSelect from 'src/components/select/searchSelect';
import { getScheduleTaskWorkerType } from '../project/utils';

const Option = Select.Option;

type Props = {
  style: {},
  form: any,
  prefix: string,
  type: string,
  prodTaskStatus: Number,
  extraOnchangeForOperatorGroup: any,
  extraOnchangeForOperators: any,
  extraOnChangeForType: any,
  selectUserOrUserGroup: boolean,
};

class UserAndUserGroupSelect extends Component {
  props: Props;
  state = {};
  componentWillMount() {
    const { prefix } = this.props;
    if (prefix) {
      this.setState({ prefix });
    } else {
      this.setState({ prefix: '' });
    }
  }
  componentDidMount() {
    const defaultValue = getScheduleTaskWorkerType();
    const { prefix } = this.state;
    if (defaultValue && this.props.form) {
      this.props.form.setFieldsValue({
        [`${prefix}operatorType`]: defaultValue,
      });
    }
  }

  renderTypeSelect = () => {
    const { form, extraOnChangeForType, prodTaskStatus, selectUserOrUserGroup } = this.props;
    const { changeChineseToLocale } = this.context;
    const { resetFields, getFieldDecorator } = form;
    const { prefix } = this.state;

    return (
      <div>
        {getFieldDecorator(`${prefix}operatorType`, {
          onChange: v => {
            if (typeof extraOnChangeForType === 'function') {
              extraOnChangeForType(v);
            }

            if (v === 'user') {
              resetFields([`${prefix}userGroup`]);
            } else {
              resetFields([`${prefix}user`]);
            }
          },
        })(
          <Select
            style={{ width: 170, marginRight: 10 }}
            disabled={prodTaskStatus && prodTaskStatus !== 1 && selectUserOrUserGroup}
          >
            <Option key={'user'}>{changeChineseToLocale('用户')}</Option>
            <Option key={'userGroup'}>{changeChineseToLocale('用户组')}</Option>
          </Select>,
        )}
      </div>
    );
  };

  render() {
    const { form, extraOnchangeForOperatorGroup, extraOnchangeForOperators } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    const { prefix } = this.state;
    const type = getFieldValue(`${prefix}operatorType`);

    getFieldDecorator(`${prefix}operatorIds`);
    getFieldDecorator(`${prefix}operatorGroupId`);

    return (
      <div>
        <div style={{ display: 'inline-block' }}>{this.renderTypeSelect()}</div>
        {type === 'user' ? (
          <span>
            {getFieldDecorator(`${prefix}operatorIds`, {
              onChange: v => {
                if (typeof extraOnchangeForOperators === 'function') {
                  extraOnchangeForOperators(v);
                }
              },
            })(<SearchSelect mode={'multiple'} type={'account'} style={{ width: 190 }} />)}
          </span>
        ) : null}
        {type === 'userGroup' ? (
          <span>
            {getFieldDecorator(`${prefix}operatorGroupId`, {
              onChange: v => {
                if (typeof extraOnchangeForOperatorGroup === 'function') {
                  extraOnchangeForOperatorGroup(v);
                }
              },
            })(<SearchSelect type={'workgroup'} style={{ width: 190 }} />)}
          </span>
        ) : null}
      </div>
    );
  }
}

UserAndUserGroupSelect.contextTypes = {
  changeChineseToLocale: PropTypes.func,
};
export default UserAndUserGroupSelect;
