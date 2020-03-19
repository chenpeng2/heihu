import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';

import { Button, message, FormattedMessage } from 'src/components';
import { black, white, content, borderGrey } from 'src/styles/color';
import BaseForm from 'src/containers/newProcess/base/Form';
import { createProcess } from 'src/services/process';

type Props = {};

class Create extends Component {
  props: Props;
  state = {};

  renderTitle = () => {
    return (
      <div style={{ color: black, fontSize: 18, margin: '20px 0 30px 20px' }}>
        <FormattedMessage defaultMessage="创建工序" />
      </div>
    );
  };

  renderBaseForm = () => {
    return <BaseForm wrappedComponentRef={inst => (this.formRef = inst)} />;
  };

  renderOperation = () => {
    const { router } = this.context;
    const normalButtonStyle = {
      width: 114,
      height: 32,
      backgroundColor: white,
      color: content,
      borderColor: borderGrey,
    };

    return (
      <div style={{ margin: '26px 0 100px 160px' }}>
        <Button
          style={{ ...normalButtonStyle, marginRight: 60 }}
          onClick={() => {
            router.history.push('/bom/newProcess');
          }}
          type="primary"
        >
          取消
        </Button>
        <Button style={{ width: 114, height: 32 }} type="primary" onClick={this.submit}>
          保存
        </Button>
      </div>
    );
  };

  submit = async () => {
    const { router } = this.context;

    const value = this.formRef ? await this.formRef.wrappedInstance.getFormValue() : null;
    if (value) {
      createProcess(value).then(res => {
        message.success('创建工序成功');

        const code = _.get(res, 'data.data.code');
        router.history.push(`/bom/newProcess/${encodeURIComponent(code)}/detail`);
      });
    }
  };

  render() {
    return (
      <div>
        {this.renderTitle()}
        {this.renderBaseForm()}
        {this.renderOperation()}
      </div>
    );
  }
}

Create.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default Create;
