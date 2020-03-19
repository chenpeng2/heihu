import React, { Component } from 'react';
import { withForm, Button, message } from 'components';
import { withRouter } from 'react-router-dom';
import { black } from 'src/styles/color';
import { createFolder } from 'src/services/knowledgeBase/file';

import FolderBaseForm from './baseForm';

type props = {
  form: {
    validateFieldsAndScroll: () => {},
  },
};

class CreateFolderForm extends Component<props> {
  state = {};

  submit = async () => {
    this.props.form.validateFieldsAndScroll(async (err, values) => {
      if (!err) {
        if (!values.parentId) {
          values.parentId = null;
        }

        const {
          data: { statusCode },
        } = await createFolder(values).finally(() => {
          this.setState({ loading: false });
        });
        if (statusCode === 200) {
          message.success('创建成功');
          this.context.router.history.push('/knowledgeManagement/folders');
        }
      }
    });
  };

  renderOperation = () => {
    const { router } = this.context;

    return (
      <div style={{ margin: '26px 0 100px 110px' }}>
        <Button
          style={{ width: 114, height: 32, marginRight: 60 }}
          onClick={() => {
            router.history.push('/knowledgeManagement/folders');
          }}
          type="ghost"
        >
          取消
        </Button>
        <Button style={{ width: 114, height: 32 }} type="primary" onClick={this.submit}>
          保存
        </Button>
      </div>
    );
  };

  render() {
    const { form } = this.props;
    return (
      <div>
        <div style={{ color: black, fontSize: 18, margin: 20 }}>创建文件夹</div>
        <FolderBaseForm form={form} />
        {this.renderOperation()}
      </div>
    );
  }
}

CreateFolderForm.contextTypes = {
  router: {},
};

export default withRouter(withForm({}, CreateFolderForm));
