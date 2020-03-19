import * as React from 'react';
import { withForm, FormItem, Input } from 'components';
import _ from 'lodash';
import { addWorkgroup, editWorkgroup } from 'src/services/auth/workgroup';

type PropsType = {
  form: any,
  name: string,
  type: string,
  setDataSource: () => {},
};

class AddUserGroup extends React.Component<PropsType> {
  state = {
    message: '',
  };

  componentDidMount() {
    const { form, type, name } = this.props;
    if (type === 'edit') {
      form.setFieldsValue({
        name,
      });
    }
  }

  submit = async value => {
    const { onClose, type, groupId } = this.props;
    if (type === 'edit') {
      await editWorkgroup(groupId, value);
    } else {
      await addWorkgroup(value);
    }
    this.props.setDataSource();
    onClose();
  };

  render() {
    const { form: { getFieldDecorator } } = this.props;
    return (
      <div>
        <FormItem label="用户组名称">
          {getFieldDecorator('name', {
            rules: [
              { required: true, message: '用户组名称不能为空' },
              { max: 20, message: '用户组长度补不能超过20' },
            ],
          })(<Input style={{ width: 450 }} trim />)}
        </FormItem>
        {this.state.message}
      </div>
    );
  }
}

export default withForm({}, AddUserGroup);
