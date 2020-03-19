import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { black, middleGrey } from 'src/styles/color/index';
import { Spin, message, Button } from 'src/components/index';
import { editTransferApply, getTransferApplyDetail } from 'src/services/cooperate/materialRequest';
import log from 'src/utils/log';

import BaseForm, { formatBaseFormValueForSubmit } from './baseComponent/baseForm';
import { getTransferApplyListPageUrl, formatDetailDataToBaseFormData } from './util';

class Edit extends Component {
  state = {
    detailData: null,
    loading: false,
  };

  componentDidMount() {
    this.getAndSetDetailData();
  }

  getAndSetDetailData = async () => {
    const id = _.get(this.props, 'match.params.id');
    const res = await getTransferApplyDetail(id);
    const data = _.get(res, 'data.data');
    this.setState({ detailData: data });
  };

  renderTitle = () => {
    const { changeChineseToLocale } = this.context;
    return (
      <div style={{ color: black, fontSize: 20, margin: '20px 0px' }}>{changeChineseToLocale('编辑转移申请')} </div>
    );
  };

  renderButtons = () => {
    const { router } = this.context;
    const { detailData } = this.state;
    const { changeChineseToLocale } = this.context;
    const baseStyle = { width: 120 };

    return (
      <div style={{ marginLeft: 140 }}>
        <Button
          style={{ ...baseStyle }}
          type={'default'}
          onClick={() => {
            router.history.push(getTransferApplyListPageUrl());
          }}
        >
          取消
        </Button>
        <Button
          type={'primary'}
          style={{ ...baseStyle, marginLeft: 10 }}
          onClick={async () => {
            if (!this.formRef) return null;
            const getFormValue = _.get(this.formRef, 'wrappedInstance.getPayload');

            if (typeof getFormValue !== 'function') return;
            const formValue = getFormValue();
            const formValueAfterFormat = formatBaseFormValueForSubmit(formValue);

            if (detailData && formValueAfterFormat) {
              formValueAfterFormat.header.id = _.get(detailData, 'header.id');
            }

            this.setState({ loading: true });

            try {
              const res = await editTransferApply(formValueAfterFormat);
              if (res && res.status >= 200 && res.status < 300) {
                message.success(changeChineseToLocale('编辑转移申请成功'));
              }
              router.history.push('cooperate/transferApply');
            } catch (e) {
              log.error(e);
            } finally {
              this.setState({ loading: false });
            }
          }}
        >
          保存
        </Button>
      </div>
    );
  };

  render() {
    const { detailData, loading } = this.state;
    return (
      <Spin spinning={loading}>
        <div style={{ marginLeft: 20 }}>
          {this.renderTitle()}
          <BaseForm
            type={'edit'}
            initialData={formatDetailDataToBaseFormData(detailData)}
            wrappedComponentRef={inst => (this.formRef = inst)}
          />
          {this.renderButtons()}
        </div>
      </Spin>
    );
  }
}

Edit.propTypes = {
  style: PropTypes.object,
};

Edit.contextTypes = {
  router: PropTypes.any,
  changeChineseToLocale: PropTypes.any,
};

export default Edit;
