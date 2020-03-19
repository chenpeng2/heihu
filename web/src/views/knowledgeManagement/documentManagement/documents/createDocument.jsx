import React, { Component } from 'react';
import { withForm, Button, message } from 'components';
import { withRouter } from 'react-router-dom';
import { black } from 'src/styles/color';
import { createFile } from 'src/services/knowledgeBase/file';
import { parseFileName } from 'utils/string';

import DocumentBaseForm from './baseForm';

type props = {
  form: {
    validateFieldsAndScroll: () => {},
  },
};

class CreateDocumentForm extends Component<props> {
  state = {};

  submit = async () => {
    this.props.form.validateFieldsAndScroll(async (err, values) => {
      if (!err) {
        const { attachments, ...params } = values;
        const attachment = attachments[0];
        params.attachmentId = attachment.id;
        const { type, name } = parseFileName(attachment.originalFileName);
        params.name = name;
        params.type = type;
        const {
          data: { statusCode, data },
        } = await createFile(params).finally(() => {
          this.setState({ loading: false });
        });
        if (statusCode === 200) {
          message.success('创建成功');
          // const { id } = data;
          this.context.router.history.push('/knowledgeManagement/documents');
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
            router.history.push('/knowledgeManagement/documents');
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
        <div style={{ color: black, fontSize: 18, margin: 20 }}>创建文件</div>
        <DocumentBaseForm form={form} />
        {this.renderOperation()}
      </div>
    );
  }
}

CreateDocumentForm.contextTypes = {
  router: {},
};

export default withRouter(withForm({}, CreateDocumentForm));
