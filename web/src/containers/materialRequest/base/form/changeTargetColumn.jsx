import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withForm, FormItem } from 'src/components';

import SecondStorageSelect from './secondeStorageSelect';

class ChangeTargetColumn extends Component {
  state = {};

  submit = (value) => {
    const { successCb, onClose } = this.props;
    const { target } = value || {};

    if (typeof successCb === 'function') successCb(target);
    if (typeof onClose === 'function') onClose();
  }

  render() {
    const { form } = this.props;
    const { getFieldDecorator } = form;

    return (
      <FormItem label={'目的地'}>
        {getFieldDecorator('target', {
          rules: [
            {
              required: true,
              message: '目的地必填',
            },
          ],
        })(<SecondStorageSelect style={{ width: 400 }} />)}
      </FormItem>
    );
  }
}

ChangeTargetColumn.propTypes = {
  style: PropTypes.object,
  form: PropTypes.any,
  successCb: PropTypes.func,
  onClose: PropTypes.any,
};

export default withForm({ showFooter: true }, ChangeTargetColumn);
