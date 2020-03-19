import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Button, FormItem, withForm } from 'src/components';
import UserOrUserGroupSelect from './userOrUserGroupSelect';

class SelectForUser extends Component {
  state = {
    value: null,
  };

  render() {
    const { cbForEnsure, onClose, form } = this.props;

    return (
      <div>
        <FormItem label={'通知用户'}>
          <UserOrUserGroupSelect form={form} prefix={'allUser'} params={{ status: 1 }} />,
        </FormItem>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button style={{ width: 110 }} type="ghost" onClick={onClose}>
            取消
          </Button>
          <Button
            style={{ width: 110, marginLeft: 20 }}
            onClick={() => {
              form.validateFields((err, value) => {
                if (!err) {
                  cbForEnsure(value);
                  onClose();
                }
              });
            }}
          >
            确认
          </Button>
        </div>
      </div>
    );
  }
}

SelectForUser.propTypes = {
  style: PropTypes.object,
  cbForEnsure: PropTypes.any,
  onClose: PropTypes.any,
  form: PropTypes.any,
};

export default withForm({}, SelectForUser);
