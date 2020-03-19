import React, { Component } from 'react';
import _ from 'lodash';

import { Button, Spin, message, FormattedMessage } from 'src/components';
import { black } from 'src/styles/color';
import Form from 'src/containers/provider/base/form';
import { getProviderDetail, editProvider } from 'src/services/provider';

const BUTTON_WIDTH = 114;

type Props = {
  match: any,
  form: any,
  history: any,
};

class Edit extends Component {
  props: Props;
  state = {
    data: null,
    loading: false,
  };

  componentDidMount() {
    this.getAndSetDetailData();
  }

  getAndSetDetailData = () => {
    const { match } = this.props;
    const code = _.get(match, 'params.code');

    this.setState({ loading: true });
    getProviderDetail(code)
      .then(res => {
        const data = _.get(res, 'data.data');

        this.setState({ data });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  renderTitle = () => {
    return (
      <div style={{ color: black, margin: '10px 0 20px', fontSize: 18 }}>
        <FormattedMessage defaultMessage={'编辑供应商'} />
      </div>
    );
  };

  renderForm = () => {
    const { data } = this.state;

    return <Form isEdit initialValue={data} wrappedComponentRef={inst => (this.formRef = inst)} />;
  };

  renderFooter = () => {
    const code = _.get(this.state, 'data.code');

    const saveData = () => {
      if (!this.formRef) return;

      const formInstance = this.formRef.wrappedInstance;
      const value = formInstance.getFormValue();

      if (value) {
        this.setState({ loading: true });
        return editProvider(code, value)
          .then(() => {
            message.success('编辑供应商成功');
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

    return (
      <div style={{ marginLeft: 120 }}>
        <Button type={'default'} style={{ width: BUTTON_WIDTH, marginRight: 72 }} onClick={backToListPage}>
          取消
        </Button>
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

export default Edit;
