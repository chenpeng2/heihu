import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import { Button, Spin, message, FormattedMessage } from 'src/components';
import { black, white, primary } from 'src/styles/color';
import Form from 'src/containers/provider/base/form';
import { createProvider } from 'src/services/provider';

const BUTTON_WIDTH = 114;

type Props = {
  style: {},
  history: any,
};

class Create extends Component {
  props: Props;
  state = {
    loading: false,
  };

  renderTitle = () => {
    return (
      <div style={{ color: black, margin: '10px 0 20px', fontSize: 18 }}>
        <FormattedMessage defaultMessage={'创建供应商'} />
      </div>
    );
  };

  renderForm = () => {
    return <Form wrappedComponentRef={inst => (this.formRef = inst)} />;
  };

  renderFooter = () => {
    const saveData = () => {
      if (!this.formRef) return;

      const formInstance = this.formRef.wrappedInstance;
      const value = formInstance.getFormValue();

      if (value) {
        this.setState({ loading: true });
        return createProvider(value)
          .then(() => {
            message.success('创建供应商成功');
          })
          .finally(() => {
            this.setState({ loading: false });
          });
      }
    };

    const backToListPage = () => {
      const { history } = this.props;
      history.push('/knowledgeManagement/provider');
    };

    const clearFormValue = () => {
      if (!this.formRef) return;

      const formInstance = this.formRef.wrappedInstance;
      formInstance.clearFormValue();
    };

    return (
      <div style={{ marginLeft: 120 }}>
        <Button
          style={{ width: BUTTON_WIDTH, marginRight: 20 }}
          onClick={() => {
            const res = saveData();
            if (res) {
              res.then(backToListPage);
            }
          }}
        >
          保存
        </Button>
        <Button
          style={{ width: BUTTON_WIDTH, background: white, color: primary }}
          onClick={() => {
            const res = saveData();
            if (res) {
              res.then(clearFormValue);
            }
          }}
        >
          保存并继续
        </Button>
      </div>
    );
  };

  render() {
    return (
      <Spin spinning={this.state.loading}>
        <div style={{ padding: 20 }}>
          {this.renderTitle()}
          {this.renderForm()}
          {this.renderFooter()}
        </div>
      </Spin>
    );
  }
}

export default withRouter(Create);
