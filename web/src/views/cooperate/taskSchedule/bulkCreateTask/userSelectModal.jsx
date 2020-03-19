import React, { Component } from 'react';
import { withForm, Button } from 'components';
import UserOrUserGroupSelect from 'src/containers/user/userOrUserGroupSelect';

class UserSelectModal extends Component {
  props: {
    form: {},
    onOk: () => {},
    onCancel: () => {},
  };
  state = {};
  render() {
    const { onOk, form, onCancel } = this.props;
    return (
      <div>
        <div style={{ margin: '5px 20px', padding: 30 }}>
          <UserOrUserGroupSelect form={form} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
          <Button style={{ width: 100 }} type="ghost" onClick={() => onCancel()}>
            取消
          </Button>
          <Button style={{ width: 100, marginLeft: 40 }} onClick={() => onOk(form.getFieldsValue())}>
            确定
          </Button>
        </div>
      </div>
    );
  }
}

export default withForm({}, UserSelectModal);
