import React, { Component } from 'react';

import { Button, withForm, message } from 'src/components';
import { editReason } from 'src/services/stock/qrCodeAdjustReason';

import BaseForm from '../base/form';

const BUTTON_WIDTH = 114;

type Props = {
  style: {},
  form: any,
  onClose: () => {},
  cbForEdit: () => {},
  initialData: any,
};

class EditModal extends Component {
  props: Props;
  state = {};

  submitValue = cb => {
    const { form } = this.props;
    const { validateFieldsAndScroll } = form || {};

    validateFieldsAndScroll((err, value) => {
      if (err) return;

      const { name, code } = value;

      editReason(code, {
        code,
        name,
      }).then(() => {
        if (typeof cb === 'function') cb();
      });
    });
  };

  renderFooter = () => {
    const { onClose, cbForEdit } = this.props;

    return (
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        <div style={{ display: 'inline-block' }}>
          <Button
            type={'default'}
            style={{ width: BUTTON_WIDTH, marginRight: 30 }}
            onClick={() => {
              if (typeof onClose === 'function') onClose();
            }}
          >
            取消
          </Button>
          <Button
            type={'primary'}
            style={{ width: BUTTON_WIDTH }}
            onClick={() => {
              this.submitValue(() => {
                message.success('调整原因编辑成功');
                this.props.form.resetFields();
                if (typeof cbForEdit === 'function') cbForEdit();
                if (typeof onClose === 'function') onClose();
              });
            }}
          >
            保存
          </Button>
        </div>
      </div>
    );
  };

  render() {
    const { form, initialData } = this.props;

    return (
      <div>
        <BaseForm form={form} type={'edit'} initialData={initialData} />
        {this.renderFooter()}
      </div>
    );
  }
}

export default withForm({ }, EditModal);
