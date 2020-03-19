import React, { Component } from 'react';
import { Prompt } from 'react-router-dom';
import { Modal, Button, withForm, Spin } from 'src/components';
import { black } from 'src/styles/color/index';
import { createProject } from 'src/services/cooperate/project';
import {
  formatValueToSubmit,
  getProjectManagers,
  saveProjectManagers,
  saveProjectProductBatchType,
  getInitialProjectProductBatchType,
} from 'src/containers/project/utils';
import ProjectForm from '../base/projectForm';

const { AntModal } = Modal;

type Props = {
  form: any,
  style: any,
  saveProjectData: any,
  projectData: any,
  location: {},
  history: any,
};

class CreateProject extends Component {
  props: Props;
  state = {
    initialData: {},
    loading: false,
    confirmed: false,
  };

  componentDidMount() {
    this.getInitialData();
  }

  getInitialData = async () => {
    const {
      location: { state },
    } = this.props;
    const productBatchType = getInitialProjectProductBatchType();
    this.setState({ initialData: { ...state, productBatchType, ...getProjectManagers() } });
  };

  submit = () => {
    this.setState({ loading: true, confirmed: true });
    this.props.form.validateFieldsAndScroll(async (err, values) => {
      console.log(values);
      if (!err) {
        // 保存项目生产主管
        saveProjectManagers(values.managerIds);
        // 保存项目成品批号绑定方式
        saveProjectProductBatchType(values && values.productBatchType);

        await createProject(formatValueToSubmit(values))
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

  showConfirm = () => {
    this.setState({ confirmed: true });
    AntModal.confirm({
      title: '项目未保存',
      content: '项目还未保存，若离开此页面已填数据将丢失，请确认是否继续？',
      okText: '继续',
      cancelText: '取消',
      onOk: () => {
        this.props.history.push('/cooperate/projects');
      },
    });
  };

  renderFooterButtons = () => {
    const baseButtonStyle = { width: 114 };

    return (
      <div style={{ marginLeft: 120, paddingTop: 20, display: 'flex' }}>
        <Button
          type={'default'}
          style={{ ...baseButtonStyle, marginRight: 60 }}
          onClick={() => {
            if (this.props.form.isFieldsTouched()) {
              this.showConfirm();
            } else {
              this.props.history.push('/cooperate/projects');
            }
          }}
        >
          取消
        </Button>
        <Button style={baseButtonStyle} onClick={this.submit}>
          保存
        </Button>
      </div>
    );
  };

  render() {
    const { form } = this.props;
    const { initialData, loading, confirmed } = this.state;
    const { disabledList, ...restData } = initialData || {};

    return (
      <Spin spinning={loading}>
        <Prompt
          message={'项目还未保存，若离开此页面已填数据将丢失，请确认是否继续？'}
          when={form.isFieldsTouched() && !confirmed}
        />
        <div style={{ padding: '20px' }}>
          <div style={{ fontSize: 16, color: black, marginBottom: '30px' }}>创建项目</div>
          <ProjectForm form={form} initialData={restData} disabledList={disabledList} />
          {this.renderFooterButtons()}
        </div>
      </Spin>
    );
  }
}

export default withForm({}, CreateProject);
