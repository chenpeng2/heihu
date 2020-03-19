import React, { Component } from 'react';
import { Select } from 'antd';
import SelectWithIntl from 'components/select/selectWithIntl';
import { FormItem } from 'components';
import _ from 'lodash';

import { arrayIsEmpty } from 'utils/array';
import { getUsers } from 'src/services/auth/user';
import { getWorkgroups } from 'src/services/auth/workgroup';

const { Option } = Select;

type Props = {
  form: any,
  type: String,
  label: String,
  multiple: boolean,
  disabled: Boolean,
};

class UserOrUserGroupSelect extends Component {
  props: Props;
  state = {
    filter: 'user',
    data: [],
    subData: [],
    subSelectDisabled: true,
  };

  componentDidMount() {
    this.handleSearch();
  }

  onFilterChange = v => {
    const { filter: prevFilter } = this.state;

    if (prevFilter !== v) {
      const { type } = this.props;
      this.props.form.setFieldsValue({
        [`${type}`]: [],
        [`${type}-userGroup`]: null,
      });
      this.setState({ filter: v }, () => {
        this.handleSearch();
      });
    }
  };

  handleSearch = async search => {
    const { type } = this.props;
    const { filter } = this.state;
    let selectData = [];

    if (filter === 'userGroup') {
      const roleIds = type === 'planners' ? 4 : 5;
      const {
        data: { data },
      } = await getWorkgroups({
        name: search,
        embed: 'members',
        roleIds,
        active: true,
      });

      selectData = data.map(({ name, id }) => ({
        key: id,
        label: name,
      }));
      this.setState({ data: selectData });
      return;
    }

    switch (type) {
      case 'planners': {
        const {
          data: { data },
        } = await getUsers({
          name: search,
          size: 1000,
          active: true,
          roleId: 4,
        });
        selectData = data.map(({ name, id }) => ({
          key: id,
          label: name,
        }));
        break;
      }
      case 'managers': {
        const {
          data: { data },
        } = await getUsers({
          name: search,
          size: 1000,
          active: true,
          roleId: 5,
        });
        selectData = data.map(({ name, id }) => ({
          key: id,
          label: name,
        }));
        break;
      }
      default:
        selectData = [];
        break;
    }

    this.setState({ data: selectData });
  };

  onUserGroupSelectChange = async (value, option) => {
    const { multiple, type } = this.props;

    // 当选择为用户组时，要过滤出改组下符合条件的用户，当multiple为false则最多只能选择一个用户组
    if ((option && !multiple) || (multiple && option && option.length > 0)) {
      const {
        data: { data },
      } = await getUsers({
        size: 100,
        active: true,
        roleId: type === 'planners' ? 4 : 5,
        groupId: multiple ? null : option.key,
        groupIds: multiple && option && option.length > 0 ? _.join(option.map(({ key }) => key), ',') : null,
        fake: false,
      });
      const subData = data && data.map(({ id, name }) => ({ key: id, label: name }));

      this.setState({ subData, subSelectDisabled: false }, () => {
        this.handleSearch();
        this.props.form.setFieldsValue({ [`${type}`]: subData });
      });
    }

    if ((!multiple && !option) || (multiple && option && !option.length)) {
      this.setState({ subSelectDisabled: true }, () => {
        this.props.form.resetFields([`${type}`]);
      });
    }
  };

  renderSelections = () => {
    const { filter, data, subData, subSelectDisabled } = this.state;
    const {
      form: { getFieldDecorator },
      type,
      label,
      multiple,
      disabled,
    } = this.props;

    if (filter === 'userGroup') {
      return (
        <React.Fragment>
          <FormItem>
            {getFieldDecorator(`${type}-userGroup`, {
              rules: [{ required: true, message: `${label}不能为空` }],
            })(
              <Select
                disabled={disabled}
                mode={multiple ? 'multiple' : null}
                style={{ width: 300, paddingRight: 10 }}
                onFocus={() => this.handleSearch()}
                onSearch={this.handleSearch}
                onChange={this.onUserGroupSelectChange}
              >
                {arrayIsEmpty(data) ? [] : data.map(({ key, label }) => <Option key={key}>{label}</Option>)}
              </Select>,
            )}
          </FormItem>
          <FormItem>
            {getFieldDecorator(`${type}`, {
              rules: [{ required: true, message: `${label}不能为空` }],
            })(
              <Select labelInValue disabled={subSelectDisabled || disabled} mode="multiple" style={{ width: 300 }}>
                {arrayIsEmpty(subData) ? [] : subData.map(({ key, label }) => <Option key={key}>{label}</Option>)}
              </Select>,
            )}
          </FormItem>
        </React.Fragment>
      );
    }
    return (
      <div>
        <FormItem>
          {getFieldDecorator(`${type}`, {
            rules: [{ required: true, message: `${label}不能为空` }],
          })(
            <Select
              labelInValue
              mode="multiple"
              style={{ width: 300 }}
              onFocus={() => this.handleSearch()}
              onSearch={this.handleSearch}
              disabled={disabled}
            >
              {arrayIsEmpty(data) ? [] : data.map(({ key, label }) => <Option key={key}>{label}</Option>)}
            </Select>,
          )}
        </FormItem>
      </div>
    );
  };

  render() {
    const { filter } = this.state;
    const { label, disabled } = this.props;

    return (
      <div style={{ display: 'flex' }}>
        <FormItem label={label} required>
          <SelectWithIntl
            style={{ width: 150, marginRight: 10 }}
            placeholder="用户 / 用户组"
            onChange={this.onFilterChange}
            value={filter}
            disabled={disabled}
          >
            <Option value="user">用户</Option>
            <Option value="userGroup">用户组</Option>
          </SelectWithIntl>
        </FormItem>
        {this.renderSelections(filter)}
      </div>
    );
  }
}

export default UserOrUserGroupSelect;
