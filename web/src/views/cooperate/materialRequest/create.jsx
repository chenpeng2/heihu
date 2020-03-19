import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { black } from 'src/styles/color';
import { Button, message, Spin } from 'src/components';
import BaseForm from 'src/containers/materialRequest/base/form';
import { createMaterialRequest, getProjectMaterialNodes } from 'src/services/cooperate/materialRequest';
import { getProjectsByProjectCodes } from 'src/services/cooperate/project';

type Props = {
  location: any,
};

class Create extends Component {
  props: Props;
  state = {
    loading: false,
    formData: {},
    projects: null,
  };

  componentDidMount() {
    this.setMaterialsValue();
    this.setProjectsValue();
  }

  renderTitle = () => {
    return <div style={{ fontSize: 16, color: black, marginBottom: 10 }}>创建物料请求</div>;
  };

  setMaterialsValue = () => {
    const projectCodes = _.get(this.props, 'location.state.projectCodes');

    this.setState({ loading: true });
    getProjectMaterialNodes(projectCodes)
      .then(res => {
        const data = _.get(res, 'data.data');

        const _data = Array.isArray(data) ? data.map(a => {
          const { unit, materialCode, materialName, projectCode, purchaseOrderCode, amount, definedMaterial } = a || {};
          const item = {};
          item.material = materialCode && materialName ? { materialName, materialCode } : undefined;
          item.projectCode = projectCode;
          item.purchaseOrderCode = purchaseOrderCode;
          item.amount = amount;
          item.unit = unit;
          item.createdByProcessRouting = !definedMaterial; // 没有定义物料就是依据工艺路线创建的
          item.useLogics = [1]; // 默认选择合格
          item.occupyInfo = [{ qcStatus: 1, amount }]; // 合格有所有的数量

          return item;
        }) : [];

        this.setState({
          formData: {
            materials: _data,
          },
        });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  setProjectsValue = () => {
    const projectCodes = _.get(this.props, 'location.state.projectCodes');

    getProjectsByProjectCodes(projectCodes).then(res => {
      const data = _.get(res, 'data.data');
      this.setState({
        projects: data,
      });
    });
  };

  renderBaseForm = () => {
    const { formData, projects } = this.state;
    return (
      <BaseForm projects={projects} initialValue={formData} wrappedComponentRef={inst => (this.BaseFormRef = inst)} />
    );
  };

  renderOperations = () => {
    const { router } = this.context;
    const baseButtonStyle = { width: 114 };

    return (
      <div style={{ marginLeft: 120, paddingTop: 20 }}>
        <Button
          type={'default'}
          style={{ ...baseButtonStyle, marginRight: 60 }}
          onClick={() => {
            router.history.push('/cooperate/projects');
          }}
        >
          取消
        </Button>
        <Button
          style={baseButtonStyle}
          onClick={() => {
            const formValue = this.BaseFormRef.wrappedInstance.getFormValue();
            if (formValue) {
              createMaterialRequest(formValue).then(res => {
                message.success('物料请求创建成功');

                const code = _.get(res, 'data.data.request.requestCode');
                router.history.push(`/cooperate/materialRequest/${code}/detail`);
              });
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
          {this.renderBaseForm()}
          {this.renderOperations()}
        </div>
      </Spin>
    );
  }
}

Create.contextTypes = {
  router: PropTypes.any,
};

export default Create;
