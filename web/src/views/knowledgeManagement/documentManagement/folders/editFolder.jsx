import React, { Component } from 'react';
import _ from 'lodash';
import { withForm, Button, message } from 'components';
import { withRouter } from 'react-router-dom';
import { black } from 'src/styles/color';
import { updateFolder, getFolderDetail } from 'src/services/knowledgeBase/file';
import { formatFolder } from '../utils';

import FolderBaseForm from './baseForm';

type props = {
  form: {
    validateFieldsAndScroll: () => {},
    setFieldsValue: () => {},
  },
};

class CreateFolderForm extends Component<props> {
  state = {};
  j;
  componentDidMount() {
    this.fetchAndSetData();
  }

  fetchAndSetData = () => {
    const id = _.get(this.props, 'match.params.id');

    this.setState({ loading: true });

    getFolderDetail({ id })
      .then(res => {
        const data = _.get(res, 'data.data');
        console.log(formatFolder(data));
        this.props.form.setFieldsValue(formatFolder(data));
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };
  submit = async () => {
    this.props.form.validateFieldsAndScroll(async (err, values) => {
      if (!err) {
        const id = _.get(this.props, 'match.params.id');
        const {
          data: { statusCode, data },
        } = await updateFolder({ id, ...values }).finally(() => {
          this.setState({ loading: false });
        });
        if (statusCode === 200) {
          message.success('编辑成功');
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
        <div style={{ color: black, fontSize: 18, margin: 20 }}>编辑文件夹</div>
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
