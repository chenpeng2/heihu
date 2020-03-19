import React from 'react';
import { arrayIsEmpty } from 'utils/array';
import PropTypes from 'prop-types';
import { getUsers } from 'services/auth/user';
import _ from 'lodash';
import SearchSelect from './searchSelect';
import Select from './index';

const Option = Select.Option;

class UserAndUserGroupSelect extends React.PureComponent {
  state = {
    type: 'user',
  };

  clearValue = () => this.props.onChange(undefined);

  setUserList = async params => {
    const {
      data: { data },
    } = await getUsers(params);
    const userList = data && data.map(({ name, id }) => ({ key: id, label: name }));
    return userList;
  };

  render() {
    const { type } = this.state;
    const { onChange, value, userSelectParams, userGroupSelectParams, disabled = false } = this.props;
    const showWorkgroupUserList = type === 'workgroup';
    return (
      <div style={{ display: 'flex' }} className="child-gap">
        <Select
          disabled={disabled}
          onChange={type => {
            this.setState({ type });
            this.clearValue();
          }}
          style={{ width: 120, marginRight: 10 }}
          value={type || 'user'}
        >
          <Option value="user">用户</Option>
          <Option value="workgroup">用户组</Option>
        </Select>
        {type === 'user' ? (
          <SearchSelect
            disabled={disabled}
            type="user"
            key="user"
            value={value}
            mode="multiple"
            style={{ width: 400 }}
            onChange={value => {
              if (!value) {
                this.clearValue();
                return;
              }
              if (Array.isArray(value) && arrayIsEmpty(value)) {
                this.clearValue();
                return;
              }
              onChange(value);
            }}
            {...userSelectParams}
          />
        ) : (
          <SearchSelect
            disabled={disabled}
            type="workgroup"
            key="workgroup"
            style={{ width: 120 }}
            onChange={async value => {
              if (!value) {
                this.clearValue();
                return;
              }
              if (Array.isArray(value) && arrayIsEmpty(value)) {
                this.clearValue();
                return;
              }
              const userList = await this.setUserList({ groupId: value.key });
              onChange(userList);
            }}
            {...userGroupSelectParams}
          />
        )}
        {showWorkgroupUserList && (
          <Select style={{ width: 400 }} disabled value={value ? value.map(({ key }) => key) : []} mode="multiple">
            {value && value.map(({ key, label }) => <Option value={key}>{label}</Option>)}
          </Select>
        )}
      </div>
    );
  }
}

UserAndUserGroupSelect.propTypes = {
  userSelectParams: PropTypes.object,
  userGroupSelectParams: PropTypes.object,
};

export default UserAndUserGroupSelect;
