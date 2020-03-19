import * as React from 'react';
import { withForm, FormItem, Select } from 'components';
import { addRoleUsers } from 'src/services/auth/role';
import { getUsers } from 'src/services/auth/user';
import SearchSelect from 'components/select/searchSelect';

const Option = Select.Option;

type PropsType = {
  form: any,
  roleId: string,
  onClose: () => {},
  length: number,
};

class RoleAddUser extends React.Component<PropsType> {
  state = {
    users: [],
  };

  componentDidMount() {
    this.setOption();
  }

  setOption = async search => {
    const { data: { data } } = await getUsers({
      op: 'exclude',
      roleId: this.props.roleId,
      name: search,
      size: 50,
    });
    this.setState({ users: data });
  };

  submit = async value => {
    await addRoleUsers(this.props.roleId, value.users);
    this.props.onClose();
  };

  render() {
    const { form: { getFieldDecorator }, length } = this.props;
    const { users } = this.state;
    const options = users.map(({ name, id }) => <Option value={id}>{name}</Option>);
    return (
      <div>
        <FormItem label="成员">
          {getFieldDecorator('users', {
            rules: [{ required: true, message: '用户不能为空' }],
            normalize: value => {
              if (value.length > length) {
                return value.filter((n, index) => index !== value.length - 2);
              }
              return value;
            },
          })(
            <Select
              mode="multiple"
              style={{ width: 450 }}
              onSearch={this.setOption}
              maxTagCount={length}
              maxTagPlaceholder={value => {
                return value[value.length - 1];
              }}
            >
              {options}
            </Select>,
          )}
        </FormItem>
      </div>
    );
  }
}

export default withForm({}, RoleAddUser);
