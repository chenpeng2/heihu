import * as React from 'react';
import { withForm, FormItem } from 'components';
import SearchSelect from 'components/select/searchSelect';
import { addMembers } from 'src/services/auth/workgroup';

type PropsType = {
  form: any,
  groupId: string,
};

class GroupAddUser extends React.Component<PropsType> {
  state = {};

  submit = async value => {
    const { onClose, groupId } = this.props;
    await addMembers(groupId, value);
    onClose();
  };

  render() {
    const { form: { getFieldDecorator }, groupId } = this.props;
    return (
      <div>
        <FormItem label="成员">
          {getFieldDecorator('memberIds')(
            <SearchSelect
              labelInValue={false}
              mode="multiple"
              type="user"
              style={{ width: 450 }}
              params={{
                groupId,
                op: 'exclude',
                fake: 'all',
              }}
            />,
          )}
        </FormItem>
      </div>
    );
  }
}

export default withForm({}, GroupAddUser);
