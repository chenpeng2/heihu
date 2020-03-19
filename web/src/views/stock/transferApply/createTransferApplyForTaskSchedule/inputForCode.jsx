import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Button, FormItem, withForm, Input } from 'components';

class SelectForTargetStorage extends Component {
  state = {
    value: null,
  };

  render() {
    const { cbForEnsure, onClose, form } = this.props;
    const { getFieldDecorator } = form || {};

    return (
      <div>
        <FormItem label={'编号'}>{getFieldDecorator('data', {})(<Input />)}</FormItem>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button style={{ width: 110 }} type="ghost" onClick={onClose}>
            取消
          </Button>
          <Button
            style={{ width: 110, marginLeft: 20 }}
            onClick={async () => {
              form.validateFields((err, value) => {
                if (!err) {
                  cbForEnsure(value ? value.data : null);
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

SelectForTargetStorage.propTypes = {
  style: PropTypes.object,
  cbForEnsure: PropTypes.any,
  onClose: PropTypes.any,
  form: PropTypes.any,
};

export default withForm({}, SelectForTargetStorage);
