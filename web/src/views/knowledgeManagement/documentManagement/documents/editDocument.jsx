import React, { Component } from 'react';
import _ from 'lodash';
import { withForm, Button, message } from 'components';
import { withRouter } from 'react-router-dom';
import { black } from 'src/styles/color';
import { parseFileName } from 'utils/string';
import { updateFile, getFileDetail } from 'src/services/knowledgeBase/file';
import { formatFile } from '../utils';

import DocumentBaseForm from './baseForm';

type props = {
  form: {
    validateFieldsAndScroll: () => {},
    setFieldsValue: () => {},
  },
};

class EditDocumentForm extends Component<props> {
  state = {};
  j;
  componentDidMount() {
    this.fetchAndSetData();
  }

  fetchAndSetData = () => {
    const id = _.get(this.props, 'match.params.id');

    this.setState({ loading: true });

    getFileDetail({ id })
      .then(res => {
        const data = _.get(res, 'data.data');
        console.log(data, formatFile(data));
        this.props.form.setFieldsValue(formatFile(data));
        setTimeout(() => this.props.form.setFieldsValue(formatFile(data)), 1000);
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };
  submit = async () => {
    this.props.form.validateFieldsAndScroll(async (err, values) => {
      if (!err) {
        const id = _.get(this.props, 'match.params.id');
        const { attachments, ...params } = values;
        const attachment = attachments[0];
        params.attachmentId = attachment.id;
        const { name, type } = parseFileName(attachment.originalFileName);
        params.name = name;
        params.type = type;
        const {
          data: { statusCode, data },
        } = await updateFile({ id, ...params }).finally(() => {
          this.setState({ loading: false });
        });
        if (statusCode === 200) {
          message.success('编辑成功');
          this.context.router.history.push(`/knowledgeManagement/documents/${id}`);
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
        <div style={{ color: black, fontSize: 18, margin: 20 }}>编辑文件夹</div>
        <DocumentBaseForm type="edit" form={form} />
        {this.renderOperation()}
      </div>
    );
  }
}

EditDocumentForm.contextTypes = {
  router: {},
};

export default withRouter(withForm({}, EditDocumentForm));
