import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';

import { Button, Spin, Modal, Icon, message } from 'src/components';
import { black } from 'src/styles/color';
import { replaceSign } from 'src/constants';
import BaseForm from 'src/containers/productivityStandard/base/baseForm';
import { queryWorkstation } from 'src/services/workstation';
import { formatFormValue } from 'src/containers/productivityStandard/base/util';
import { editProductivityStandard, getProductivityStandardDetail } from 'src/services/knowledgeBase/productivityStandard';
import { REPEATE_ERROR_CODE, statusDisplay } from 'src/containers/productivityStandard/base/constant';
import SaveConfirmModal from './saveConfirmModal';

const AntModal = Modal.AntModal;

const BUTTON_WIDTH = 114;

type Props = {
  form: {},
  match: {},
};

class EditProductivityStandard extends Component {
  props: Props;
  state = {
    loading: true,
    code: null,
    initialValue: null,
    showModal: false,
  };

  componentDidMount() {
    const { match } = this.props;
    const { params } = match || {};
    const { code } = params || {};

    this.setState({ loading: true });
    getProductivityStandardDetail(code)
      .then(res => {
        const { data } = res || {};
        const { data: detailData } = data || {};

        this.setState({
          initialValue: detailData,
          code,
        });
      })
      .finally(() => {
        this.setState({
          loading: false,
        });
      });
  }

  editProductivityStandard = cover => {
    const { code } = this.state;
    const { router } = this.context;

    this.baseForm.validateFieldsAndScroll((error, values) => {
      if (!error) {
        const res = formatFormValue(values);

        if (cover) {
          res.cover = true;
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

        editProductivityStandard(code, res, errorHandle)
          .then(async res => {
            const { data: resData } = res || {};
            console.log(res);
            const { data: realData } = resData || {};

            const { task: workstationIds } = realData || {};

            // 创建成功去详情页
            if (workstationIds && workstationIds.length) {
              const { data: { data: workstations } } = await queryWorkstation({ ids: workstationIds.join(',') });
              this.setState({
                workstations,
                visible: true,
              });
            } else {
              router.history.push(`/knowledgeManagement/productivityStandards/${code}/detail`);
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
            this.editProductivityStandard();
          }}
        >
          确定
        </Button>
      </div>
    );
  };

  renderForm = () => {
    const { initialValue } = this.state;

    return <BaseForm ref={inst => (this.baseForm = inst)} initialValue={initialValue} />;
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
            <div style={{ color: black, size: 18 }}>编辑失败</div>
            <div>该工序，物料，工位的组合已创建过标准产能，请重新填写</div>
            <div style={{ margin: '10px 0' }}>
              <Button type={'default'} style={buttonStyle} onClick={closeModal}>
                重新填写
              </Button>
              <Button
                style={buttonStyle}
                onClick={() => {
                  this.editProductivityStandard(true);
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

  renderStatusAndCode = () => {
    const { initialValue } = this.state;
    const { code, status } = initialValue || {};

    const renderItem = (label, value) => {
      return (
        <div>
          <div
            style={{
              display: 'inline-block',
              width: 100,
              height: 40,
              marginRight: 20,
              textAlign: 'right',
              fontSize: 12,
            }}
          >
            {label}
          </div>
          <span>{value || replaceSign}</span>
        </div>
      );
    };

    return (
      <div>
        {renderItem('编码', code)}
        {renderItem('状态', statusDisplay[status])}
      </div>
    );
  };

  render() {
    const { loading, visible, workstations, code } = this.state;

    return (
      <Spin spinning={loading}>
        <div style={{ padding: 20 }}>
          <div style={{ margin: '0 0 20px 0', color: black, fontSize: 16 }}>编辑标准产能</div>
          {this.renderStatusAndCode()}
          {this.renderForm()}
          {this.renderFooterButtons()}
          {this.renderModal()}
          <SaveConfirmModal
            onVisibleChange={value => {
              this.setState({ visible: value });
            }}
            action={'编辑'}
            visible={visible}
            workstations={workstations}
            productivityStandardCode={code}
          />
        </div>
      </Spin>
    );
  }
}

EditProductivityStandard.contextTypes = {
  router: {},
};

export default withRouter(EditProductivityStandard);
