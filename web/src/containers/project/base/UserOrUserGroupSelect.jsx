import React, { Component } from 'react';
import { Select } from 'antd';
import { FormItem, Searchselect } from 'components';
import _ from 'lodash';

import { arrayIsEmpty } from 'utils/array';
import { getUsers } from 'src/services/auth/user';
import { getWorkgroups } from 'src/services/auth/workgroup';

const { Option } = Select;

type Props = {
  fieldName: String,
  label: String,
  multiple: boolean,
  selectParams: {},
  onChange: () => {},
};

class UserOrUserGroupSelect extends Component {
  props: Props;
  state = {
    filter: 'user',
    data: [],
    subData: [],
    subSelectDisabled: true,
  };

  onFilterChange = v => {
    this.setState({ subData: [] });
    const { filter: prevFilter } = this.state;

    if (prevFilter !== v) {
      this.setState({ filter: v });
    }
  };

  onUserGroupSelectChange = async (value, option) => {
    const { multiple, onChange, selectParams } = this.props;
    onChange(undefined);

    // 当选择为用户组时，要过滤出改组下符合条件的用户，当multiple为false则最多只能选择一个用户组
    if ((option && !multiple) || (multiple && option && option.length > 0)) {
      const {
        data: { data },
      } = await getUsers({
        size: 100,
        active: true,
        groupId: multiple ? null : value.key,
        groupIds: multiple && option && option.length > 0 ? _.join(option.map(({ props }) => props.value), ',') : null,
        fake: false,
        ...selectParams,
      });
      const subData = data && data.map(({ id, name }) => ({ key: id, label: name }));

      this.setState({ subData, subSelectDisabled: true }, () => {
        onChange(subData);
      });
    }

    if ((!multiple && !value) || (multiple && arrayIsEmpty(option))) {
      this.setState({ subSelectDisabled: true }, () => {
        onChange(undefined);
      });
    }
  };

  renderSelections = () => {
    const { filter, subData, subSelectDisabled } = this.state;
    const { multiple, selectParams, onChange } = this.props;

    if (filter === 'userGroup') {
      return (
        <React.Fragment>
          <Searchselect
            type="workgroup"
            mode={multiple ? 'multiple' : null}
            style={{ width: 300, paddingRight: 10, marginTop: 5 }}
            onChange={this.onUserGroupSelectChange}
            params={selectParams}
          />
          <Select
            labelInValue
            onChange={onChange}
            value={subData}
            disabled={subSelectDisabled}
            mode="multiple"
            style={{ width: 300, marginTop: 5 }}
          >
            {arrayIsEmpty(subData) ? [] : subData.map(({ key, label }) => <Option key={key}>{label}</Option>)}
          </Select>
        </React.Fragment>
      );
    }
    return (
      <Searchselect
        onChange={onChange}
        type="account"
        mode="multiple"
        style={{ width: 300, marginTop: 5 }}
        params={selectParams}
      />
    );
  };

  render() {
    const { filter } = this.state;
    const { label } = this.props;

    return (
      <div style={{ display: 'flex', marginBottom: 3 }}>
        <FormItem label={label} required style={{ margin: 0, marginRight: 10 }}>
          <Select placeholder="用户 / 用户组" onChange={this.onFilterChange} value={filter} style={{ width: 150 }}>
            <Option value="user">用户</Option>
            <Option value="userGroup">用户组</Option>
          </Select>
        </FormItem>
        {this.renderSelections(filter)}
      </div>
    );
  }
}

export default UserOrUserGroupSelect;
