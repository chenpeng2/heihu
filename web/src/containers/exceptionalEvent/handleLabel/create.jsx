import React, { Component } from 'react';

import { Button, message } from 'src/components';
import { createLabel } from 'src/services/knowledgeBase/exceptionalEvent';
import BaseForm from './baseForm';

type Props = {
  style: {},
  onClose: () => {},
  form: {},
  fetchData: () => {},
};

class Create extends Component {
  props: Props;
  state = {};

  renderFooterButtons = () => {
    const { onClose, fetchData } = this.props;
    const buttonStyle = { width: 114 };

    return (
      <div style={{ paddingBottom: 35 }}>
        <div style={{ width: 280, margin: 'auto' }}>
          <Button
            type={'default'}
            style={{ ...buttonStyle, marginRight: 40 }}
            onClick={() => {
              if (onClose && typeof onClose === 'function') onClose();
            }}
          >
            取消
          </Button>
          <Button
            style={buttonStyle}
            onClick={() => {
              this.formInst.validateFieldsAndScroll((err, values) => {
                if (err) return;

                const { name } = values || {};
                createLabel({
                  name,
                }).then(() => {
                  message.success('创建处理标签成功');
                  if (typeof onClose === 'function') onClose();
                  if (typeof fetchData === 'function') fetchData({ page: 1 });
                });
              });
            }}
          >
            完成
          </Button>
        </div>
      </div>
    );
  };

  renderForm = () => {
    return <BaseForm ref={inst => (this.formInst = inst)} />;
  };

  render() {
    return (
      <div>
        {this.renderForm()}
        {this.renderFooterButtons()}
      </div>
    );
  }
}

export default Create;
