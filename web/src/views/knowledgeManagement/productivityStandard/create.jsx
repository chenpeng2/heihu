import React, { Component } from 'react';
import _ from 'lodash';

import { message, Icon, Button, Modal } from 'src/components';
import { black } from 'src/styles/color';
import BaseForm from 'src/containers/productivityStandard/base/baseForm';
import { createProductivityStandard } from 'src/services/knowledgeBase/productivityStandard';
import { queryWorkstation } from 'src/services/workstation';
import { formatFormValue } from 'src/containers/productivityStandard/base/util';
import { REPEATE_ERROR_CODE } from 'src/containers/productivityStandard/base/constant';
import SaveConfirmModal from './saveConfirmModal';

const AntModal = Modal.AntModal;

const BUTTON_WIDTH = 114;

type Props = {
  form: {},
};

class CreateProductivityStandard extends Component {
  props: Props;
  state = {
    showModal: false,
    visible: false,
    productivityStandardCode: null,
  };

  // 参数是是否直接覆盖
  createProductivityStandard = cover => {
    const { router } = this.context;

    this.baseForm.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const value = formatFormValue(values);

        // 直接覆盖
        if (cover) {
          value.cover = true;
        }

        // 当发生重复创建错误的时候，不需要message.error。需要额外的处理
        const errorHandle = e => {
          const statusCode = _.get(e, ['response', 'data', 'code']);
          const errorMessage = _.get(e, 'response.data.description');

          if (statusCode === REPEATE_ERROR_CODE) {
            return null;
          }
          message.error(errorMessage);
        };

        createProductivityStandard(value, errorHandle)
          .then(async res => {
            const { data: resData } = res || {};
            const { data: realData } = resData || {};

            const { code: productivityStandardCode, task: workstationIds } = realData || {};

            // 创建成功去详情页
            if (!productivityStandardCode) return;
            if (workstationIds && workstationIds.length) {
              const { data: { data: workstations } } = await queryWorkstation({ ids: workstationIds.join(',') });
              this.setState({
                workstations,
                productivityStandardCode,
                visible: true,
              });
            } else {
              router.history.push(`/knowledgeManagement/productivityStandards/${productivityStandardCode}/detail`);
            }
          })
          .catch(e => {
            // 如果发现重复创建
            const statusCode = _.get(e, ['response', 'data', 'code']);

            if (statusCode === REPEATE_ERROR_CODE) {
              this.setState({ showModal: true });
            }
          });
      }
    });
  };


  renderFooterButtons = () => {
    const { router } = this.context;

    return (
      <div style={{ margin: '30px 0px 30px 20px' }}>
        <Button
          style={{ marginLeft: 100, marginRight: 60, width: BUTTON_WIDTH }}
          type={'default'}
          onClick={() => {
            router.history.push('/knowledgeManagement/productivityStandards');
          }}
        >
          取消
        </Button>
        <Button
          type={'primary'}
          style={{ width: BUTTON_WIDTH }}
          onClick={() => {
            this.createProductivityStandard();
          }}
        >
          确定
        </Button>
      </div>
    );
  };

  renderForm = () => {
    return <BaseForm ref={inst => (this.baseForm = inst)} />;
  };

  renderModal = () => {
    const { showModal } = this.state;

    const buttonStyle = { width: BUTTON_WIDTH, marginRight: 40 };

    const closeModal = () => {
      this.setState({ showModal: false });
    };

    return (
      <AntModal width={420} visible={showModal} footer={null} onCancel={closeModal}>
        <div>
          <Icon type={'close-circle'} size={26} style={{ verticalAlign: 'top', marginRight: 10 }} />
          <div style={{ display: 'inline-block' }}>
            <div style={{ color: black, size: 18 }}>创建失败</div>
            <div>该工序，物料，工位的组合已创建过标准产能，请重新填写</div>
            <div style={{ margin: '10px 0' }}>
              <Button type={'default'} style={buttonStyle} onClick={closeModal}>
                重新填写
              </Button>
              <Button
                style={buttonStyle}
                onClick={() => {
                  this.createProductivityStandard(true);
                  closeModal();
                }}
              >
                直接覆盖
              </Button>
            </div>
          </div>
        </div>
      </AntModal>
    );
  };

  render() {
    const { visible, productivityStandardCode, workstations } = this.state;
    return (
      <div style={{ padding: 20 }}>
        <div style={{ margin: '0 0 20px 0', color: black, fontSize: 16 }}>创建标准产能</div>
        {this.renderForm()}
        {this.renderFooterButtons()}
        {this.renderModal()}
        <SaveConfirmModal
          onVisibleChange={value => {
            this.setState({ visible: value });
          }}
          action={'创建'}
          visible={visible}
          workstations={workstations}
          productivityStandardCode={productivityStandardCode}
        />
      </div>
    );
  }
}

CreateProductivityStandard.contextTypes = {
  router: {},
};

export default CreateProductivityStandard;
