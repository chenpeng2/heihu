import React, { Component } from 'react';
import { withRouter, Prompt } from 'react-router-dom';
import { Modal, Button, withForm, Spin } from 'src/components';
import { black } from 'src/styles/color/index';
import { createProject } from 'src/services/cooperate/project';
import { formatValueToSubmit, getProjectManagers, saveProjectManagers } from 'src/containers/project/utils';
import ProjectForm from './baseForm';

const { AntModal } = Modal;

type Props = {
  form: any,
  style: any,
  history: any,
  fatherProjectCode: string,
  fatherProjectDetail: any,
};

class CreateProject extends Component {
  props: Props;
  state = {
    confirmed: false,
    loading: false,
  };

  submit = () => {
    this.setState({ loading: true, confirmed: true });
    this.props.form.validateFieldsAndScroll(async (err, values) => {
      console.log(values);
      if (!err) {
        // 保存生产主管
        saveProjectManagers(values ? values.manager : null);

        const { fatherProjectCode } = this.props;
        await createProject({ ...formatValueToSubmit(values), parentCode: decodeURIComponent(fatherProjectCode) })
          .then(({ data: { statusCode } }) => {
            if (statusCode === 200) {
              this.props.history.push(`/cooperate/projects/${encodeURIComponent(values.projectCode)}/detail`);
            }
          })
          .catch(err => console.log(err));
      }
      this.setState({ loading: false });
    });
  };

  renderFooterButtons = () => {
    const baseButtonStyle = { width: 114 };
    const { fatherProjectCode: code, form } = this.props;
    const { loading } = this.state;

    return (
      <div style={{ marginLeft: 120, paddingTop: 20, display: 'flex' }}>
        <Button
          type={'default'}
          style={{ ...baseButtonStyle, marginRight: 60 }}
          onClick={() => {
            if (form.isFieldsTouched()) {
              this.showConfirm();
            } else {
              this.props.history.push(`/cooperate/projects/${encodeURIComponent(code)}/detail`);
            }
          }}
        >
          取消
        </Button>
        <Spin spinning={loading}>
          <Button style={baseButtonStyle} onClick={this.submit}>
            保存
          </Button>
        </Spin>
      </div>
    );
  };

  showConfirm = () => {
    const { fatherProjectCode: code } = this.props;
    this.setState({ confirmed: true });
    AntModal.confirm({
      title: '项目未保存',
      content: '项目还未保存，若离开此页面已填数据将丢失，请确认是否继续？',
      okText: '继续',
      cancelText: '取消',
      onOk: () => {
        this.props.history.push(`/cooperate/projects/${encodeURIComponent(code)}/detail`);
      },
    });
  };

  render() {
    const { fatherProjectCode, fatherProjectDetail, form } = this.props;
    const { confirmed } = this.state;
    const projectData = { ...getProjectManagers() };

    return (
      <div style={{ padding: '20px' }}>
        <Prompt
          message={'项目还未保存，若离开此页面已填数据将丢失，请确认是否继续？'}
          when={form.isFieldsTouched() && !confirmed}
        />
        <div style={{ fontSize: 16, color: black, marginBottom: '30px' }}>创建项目</div>
        <ProjectForm
          form={form}
          initialData={projectData}
          fatherProjectCode={fatherProjectCode}
          fatherProjectDetail={fatherProjectDetail}
        />
        {this.renderFooterButtons()}
      </div>
    );
  }
}

export default withRouter(withForm({}, CreateProject));
