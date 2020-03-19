import React, { Component } from 'react';

import { Button, message } from 'src/components';
import { createSetting } from 'src/services/knowledgeBase/exceptionalEvent';
import { formatUser } from 'src/containers/exceptionalEvent/subscribeManageList/util';

import BaseForm, { formatWorkstation } from './baseForm';


type Props = {
  style: {},
  onClose: () => {},
  form: {},
  fetchData: () => {}
};

class Create extends Component {
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

                const { name, sendLevel, subscribeLevel, subscribeScope, subscribeCategoryIds } = values || {};
                createSetting({
                  userId: name ? formatUser(name).userId : null,
                  userType: name ? formatUser(name).userType : null,
                  sendLevel,
                  subscribeLevel: subscribeLevel === '不订阅' ? 0 : subscribeLevel,
                  subscribeScope: formatWorkstation(subscribeScope),
                  subscribeCategoryIds,
                }).then(() => {
                  message.success('创建配置成功');
                  if (typeof onClose === 'function') onClose();
                  if (typeof fetchData === 'function') fetchData();
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

export default Create;
