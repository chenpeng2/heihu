import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Spin } from 'antd';
import _ from 'lodash';

import { Button, withForm } from 'src/components';
import { black } from 'src/styles/color/index';
import { editProject } from 'src/services/cooperate/project';

import ProjectForm from '../createSonProject/baseForm';
import { formatValueToSubmit } from '../utils';

type Props = {
  history: any,
  form: any,
  style: any,
  fatherProjectCode: string,
  initialData: any,
};

class CreateProject extends Component {
  props: Props;
  state = {
    loading: false,
  };

  submit = () => {
    this.setState({ loading: true });
    this.props.form.validateFieldsAndScroll(async (err, values) => {
      if (!err) {
        const parentCode = _.get(this.props, 'initialData.projectCode');
        await editProject({ ...formatValueToSubmit(values), parentCode })
          .then(({ data: { statusCode } }) => {
            if (statusCode === 200) {
              this.props.history.push(`/cooperate/projects/${encodeURIComponent(values.projectCode)}/detail`);
            }
          })
          .catch((err) => console.log(err));
      }
      this.setState({ loading: false });
    });
  };

  renderFooterButtons = () => {
    const { loading } = this.state;
    const baseButtonStyle = { width: 114 };

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
          <Button
            style={baseButtonStyle}
            onClick={this.submit}
          >
            保存
          </Button>
        </Spin>
      </div>
    );
  };

  getDisableList = () => {
    const code = _.get(this.props, 'initialData.status.code');

    // 未开始的项目才可以编辑的字段：订单编号，生产 BOM 版本号/工艺路线编号，数量，计划开始时间，计划结束时间，成品批次
    if (code === 'created') {
      return {
        projectCode: true,
        product: true,
        projectType: true,
        amount: true,
        parentProcess: true,
      };
    }

    // 暂停中的项目才可以编辑的字段：数量，计划结束时间。
    if (code === 'paused' || code === 'running') {
      return {
        projectCode: true,
        product: true,
        startTimePlanned: true,
        endTimePlanned: true,
        processRouting: true,
        mBom: true,
        ebom: true,
        projectType: true,
        amount: true,
        parentProcess: true,
        productBatchType: true,
        productBatch: true,
        productBatchNumberRuleId: true,
      };
    }

    // 所有状态都可以编辑的字段：项目负责人，附件，编辑保存后更新到所有任务中。
    return {
      projectCode: true,
      product: true,
      amount: true,
      startTimePlanned: true,
      endTimePlanned: true,
      processRouting: true,
      mBom: true,
      ebom: true,
      projectType: true,
      parentProcess: true,
    };
  };

  render() {
    const { fatherProjectCode, initialData, form, fatherProjectDetail } = this.props;

    return (
      <div style={{ padding: '20px' }}>
        <div style={{ fontSize: 16, color: black, marginBottom: '30px' }}>编辑项目</div>
        <ProjectForm
          form={form}
          fatherProjectCode={fatherProjectCode}
          fatherProjectDetail={fatherProjectDetail}
          initialData={initialData}
          disabledList={this.getDisableList()}
          isEdit
        />
        {this.renderFooterButtons()}
      </div>
    );
  }
}

export default withRouter(withForm({}, CreateProject));
