import React, { Component } from 'react';
import _ from 'lodash';
import { withForm, FormItem, Button, message, Radio } from 'components';
import { withRouter } from 'react-router-dom';
import { black } from 'src/styles/color';
import { changeFileVersion, getFileDetail } from 'src/services/knowledgeBase/file';
import { parseFileName } from 'utils/string';
import { formatFile } from '../utils';
import DocumentBaseForm from './baseForm';

const RadioGroup = Radio.Group;

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
        const { version, attachments, ...value } = formatFile(data);
        this.props.form.setFieldsValue(value);
        setTimeout(() => this.props.form.setFieldsValue(value), 1000);
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
        } = await changeFileVersion({ id, ...params }).finally(() => {
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
    const { getFieldDecorator } = form;
    return (
      <div>
        <div style={{ color: black, fontSize: 18, margin: 20 }}>版本更新方式</div>
        <FormItem label="变更方式">
          {getFieldDecorator('changeType', {
            rules: [{ required: true, message: '状态必填' }],
            initialValue: 2,
          })(
            <RadioGroup style={{ wdith: 100 }}>
              <Radio value={2} style={{ marginRight: 100 }}>
                更新版本
              </Radio>
              <Radio value={1}>增加版本</Radio>
            </RadioGroup>,
          )}
        </FormItem>
        <div style={{ color: black, fontSize: 18, margin: 20 }}>文档基础信息</div>
        <DocumentBaseForm type="changeVersion" form={form} />
        {this.renderOperation()}
      </div>
    );
  }
}

EditDocumentForm.contextTypes = {
  router: {},
};

export default withRouter(withForm({}, EditDocumentForm));
