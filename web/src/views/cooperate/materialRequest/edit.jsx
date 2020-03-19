import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import moment from 'src/utils/time';
import { black } from 'src/styles/color';
import { Button, message, Spin } from 'src/components';
import BaseForm from 'src/containers/materialRequest/base/form';
import { editMaterialRequest, getMaterialRequestDetail } from 'src/services/cooperate/materialRequest';

type Props = {
  location: any,
  match: any,
};

class Edit extends Component {
  props: Props;
  state = {
    loading: false,
    formData: {},
  };

  componentDidMount() {
    this.setMaterialsValue();
  }

  renderTitle = () => {
    return <div style={{ fontSize: 16, color: black, marginBottom: 10 }}>编辑物料请求</div>;
  };

  setMaterialsValue = () => {
    const code = _.get(this.props, 'match.params.id');

    this.setState({ loading: true });
    getMaterialRequestDetail(code)
      .then(res => {
        const data = _.get(res, 'data.data');
        const { request, requestCompactItems } = data || {};

        const { requireTime, sourceStorage, transitStorage, remark, requestCode } = request || {};

        const _data = Array.isArray(requestCompactItems)
          ? requestCompactItems.map(a => {
              const {
                unit,
                materialCode,
                materialInfo,
                projectCode,
                purchaseOrderCode,
                amount,
                qualityAmounts,
                targetStorage,
                definedMaterial,
              } =
                a || {};
              const item = {};
              item.material = { materialName: materialInfo ? materialInfo.name : null, materialCode };
              item.projectCode = projectCode;
              item.purchaseOrderCode = purchaseOrderCode;
              item.amount = amount;
              item.unit = unit;
              item.useLogics = Array.isArray(qualityAmounts) ? qualityAmounts.map(a => a.qcStatus) : [];
              item.occupyInfo = qualityAmounts;
              item.destination = {
                value: targetStorage ? `3-${targetStorage.id}` : null,
                label: targetStorage ? targetStorage.name : null,
              };
              item.createdByProcessRouting = !definedMaterial; // 没有定义物料就是工艺路线创建的

              return item;
            })
          : [];

        const formData = {
          requireTime: requireTime ? moment(requireTime) : null,
          sourceStorage: {
            value: sourceStorage ? `2-${sourceStorage.id}` : null,
            label: sourceStorage ? sourceStorage.name : null,
          },
          transitStorage: {
            value: transitStorage ? `3-${transitStorage.id}` : null,
            label: transitStorage ? transitStorage.name : null,
          },
          materials: _data,
          remark,
          code: requestCode,
        };

        this.setState({ formData });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  renderBaseForm = () => {
    const { formData } = this.state;
    return <BaseForm isEdit initialValue={formData} wrappedComponentRef={inst => (this.BaseFormRef = inst)} />;
  };

  renderOperations = () => {
    const { router } = this.context;
    const baseButtonStyle = { width: 114 };
    const code = _.get(this.props, 'match.params.id');

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
          onClick={async () => {
            const formValue = this.BaseFormRef.wrappedInstance.getFormValue();
            if (formValue) {
              editMaterialRequest(code, formValue).then(() => {
                message.success('编辑请求创建成功');
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

Edit.contextTypes = {
  router: PropTypes.any,
};

export default Edit;
