import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { black, middleGrey } from 'src/styles/color/index';
import { Spin, message, Button, Checkbox } from 'src/components/index';
import { createTransferApply } from 'src/services/cooperate/materialRequest';
import log from 'src/utils/log';

import {
  getTransferApplyListPageUrl,
  setKeepCreateTransferApplyInLocalStorage,
  getKeepCreateTransferApplyFromLocalStorage,
} from './util';
import BaseForm, { formatBaseFormValueForSubmit } from './baseComponent/baseForm';

class Create extends Component {
  state = {
    loading: false,
  };

  renderTitle = () => {
    const { changeChineseToLocale } = this.context;
    return (
      <div style={{ color: black, fontSize: 20, margin: '20px 0px' }}>{changeChineseToLocale('创建转移申请')}</div>
    );
  };

  renderButtons = () => {
    const { router, changeChineseToLocale } = this.context;
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

            if (!formValue) return;

            const formValueAfterFormat = formatBaseFormValueForSubmit(formValue);

            this.setState({ loading: true });

            try {
              const res = await createTransferApply(formValueAfterFormat);
              if (res && res.status === 200) {
                message.success('创建转移申请成功');
              }
              // 如果配置了持续创建那么清空表单。如果没有那么去列表页
              if (getKeepCreateTransferApplyFromLocalStorage()) {
                const clearFormValue = _.get(this.formRef, 'wrappedInstance.clearForm');
                if (typeof clearFormValue === 'function') clearFormValue();
              } else {
                router.history.push('cooperate/transferApply');
              }
            } catch (e) {
              log.error(e);
            } finally {
              this.setState({ loading: false });
            }
          }}
        >
          确定
        </Button>
        <Checkbox
          style={{ display: 'inline-block', marginLeft: 30 }}
          onChange={e => {
            const value = _.get(e, 'target.checked');
            setKeepCreateTransferApplyInLocalStorage(value);
          }}
          defaultChecked={getKeepCreateTransferApplyFromLocalStorage()}
        >
          <span style={{ color: black, fontSize: 13, marginRight: 5 }}>{changeChineseToLocale('持续创建')} </span>
          <span style={{ color: middleGrey, fontSize: 12 }}>
            {changeChineseToLocale('保存后可直接创建新的转移申请')}{' '}
          </span>
        </Checkbox>
      </div>
    );
  };

  render() {
    return (
      <Spin spinning={this.state.loading}>
        <div style={{ marginLeft: 20 }}>
          {this.renderTitle()}
          <BaseForm type={'create'} wrappedComponentRef={inst => (this.formRef = inst)} />
          {this.renderButtons()}
        </div>
      </Spin>
    );
  }
}

Create.propTypes = {
  style: PropTypes.object,
};

Create.contextTypes = {
  router: PropTypes.any,
  changeChineseToLocale: PropTypes.any,
};

export default Create;
