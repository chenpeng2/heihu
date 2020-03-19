import React, { Component } from 'react';

import { Button, message } from 'src/components';
import { createType } from 'src/services/knowledgeBase/exceptionalEvent';
import BaseForm from './baseForm';

type Props = {
  style: {},
  onClose: () => {},
  form: {},
  fetchData: () => {}
};

class CreateType extends Component {
  props: Props;
  state = {};

  renderForm = () => {
    return <BaseForm ref={inst => (this.formInst = inst)} />;
  };

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

                const { name, priority, overdueDate } = values || {};
                createType({
                  name,
                  priority,
                  overdueTimeout: overdueDate,
                }).then(() => {
                  message.success('创建异常类型成功');
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

  render() {
    return (
      <div>
        {this.renderForm()}
        {this.renderFooterButtons()}
      </div>
    );
  }
}

export default CreateType;
