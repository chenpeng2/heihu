import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';

import { Button, withForm, Spin } from 'src/components';
import { black } from 'src/styles/color/index';
import { editProject, getProject } from 'src/services/cooperate/project';

import ProjectForm from '../base/projectForm';
import { formatValueToSubmit } from '../utils';

type Props = {
  form: any,
  match: {},
  history: any,
};

class EditProject extends Component {
  props: Props;
  state = {
    projectData: null,
    loading: false,
  };

  componentDidMount = async () => {
    const { match } = this.props;
    const { params } = match || {};
    const { projectCode } = params || {};

    if (projectCode) {
      const res = await getProject({ code: decodeURIComponent(projectCode) });
      const data = _.get(res, 'data.data');
      this.setState({
        projectData: data,
      });
    }
  };

  getDisableList = () => {
    const code = _.get(this.state, 'projectData.status.code');

    // 未开始的项目才可以编辑的字段：订单编号，生产 BOM 版本号/工艺路线编号，数量，计划开始时间，计划结束时间，
    if (code === 'created') {
      return {
        projectCode: true,
        product: true,
        projectType: true,
        amount: true,
        purchaseOrder: true,
      };
    }

    // 暂停中的项目才可以编辑的字段：数量，计划结束时间。
    if (code === 'paused' || code === 'running') {
      return {
        projectCode: true,
        product: true,
        purchaseOrder: true,
        startTimePlanned: true,
        endTimePlanned: true,
        processRouting: true,
        mBom: true,
        ebom: true,
        projectType: true,
        productBatch: true,
        amount: true,
      };
    }

    // 所有状态都可以编辑的字段：项目负责人，附件，编辑保存后更新到所有任务中。
    return {
      projectCode: true,
      product: true,
      amount: true,
      purchaseOrder: true,
      startTimePlanned: true,
      endTimePlanned: true,
      processRouting: true,
      mBom: true,
      ebom: true,
      projectType: true,
    };
  };

  submit = () => {
    this.setState({ loading: true });
    this.props.form.validateFieldsAndScroll(async (err, values) => {
      if (!err) {
        await editProject(formatValueToSubmit(values))
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
    const { loading } = this.state;

    return (
      <div style={{ marginLeft: 120, paddingTop: 20, display: 'flex' }}>
        <Button
          type={'default'}
          style={{ ...baseButtonStyle, marginRight: 60 }}
          onClick={() => {
            this.props.history.goBack();
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

  render() {
    const { projectData } = this.state;
    const { form } = this.props;

    return (
      <div style={{ padding: '20px' }}>
        <div style={{ fontSize: 16, color: black, marginBottom: '30px' }}>编辑项目</div>
        <ProjectForm editing form={form} initialData={projectData} disabledList={this.getDisableList()} />
        {this.renderFooterButtons()}
      </div>
    );
  }
}

export default withForm({}, EditProject);
