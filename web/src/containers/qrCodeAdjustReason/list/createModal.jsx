import React, { Component } from 'react';

import { withForm, Button, message } from 'src/components';
import { createReason } from 'src/services/stock/qrCodeAdjustReason';

import BaseForm from '../base/form';

const BUTTON_WIDTH = 114;

type Props = {
  style: {},
  form: any,
  onClose: () => {},
};

class CreateModal extends Component {
  props: Props;
  state = {};

  submitValue = cb => {
    const { form } = this.props;
    const { validateFieldsAndScroll } = form || {};

    validateFieldsAndScroll((err, value) => {
      if (err) return;

      const { name, code } = value;

      createReason({
        code,
        name,
      }).then(() => {
        if (typeof cb === 'function') cb();
      });
    });
  };

  renderFooter = () => {
    const { onClose } = this.props;
    return (
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        <div style={{ display: 'inline-block' }}>
          <Button
            type={'primary'}
            style={{ width: BUTTON_WIDTH, marginRight: 30 }}
            onClick={() => {
              this.submitValue(() => {
                message.success('调整原因创建成功');
                if (typeof onClose === 'function') onClose();
              });
            }}
          >
            保存
          </Button>
          <Button
            type={'default'}
            style={{ width: BUTTON_WIDTH }}
            onClick={() => {
              this.submitValue(() => {
                message.success('调整原因创建成功');
                this.props.form.resetFields();
              });
            }}
          >
            保存并继续
          </Button>
        </div>
      </div>
    );
  };

  render() {
    const { form } = this.props;

    return (
      <div>
        <BaseForm form={form} />
        {this.renderFooter()}
      </div>
    );
  }
}

export default withForm({}, CreateModal);
