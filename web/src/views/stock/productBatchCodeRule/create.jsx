import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { black } from 'src/styles/color';
import BaseForm from 'src/containers/productBatchCodeRule/base/baseForm';
import { Button, message } from 'src/components';
import { createProductBathCodeRule } from 'src/services/productBatchCodeRule';

// 提交和取消按钮的样式
const buttonStyle = { width: 114, height: 32, marginRight: 40 };

class CreateProductBatchCode extends Component {
  state = {};

  renderHeader = () => {
    return (
      <div>
        <div style={{ display: 'inline-block', color: black, fontSize: '16px' }}>{'创建成品批号规则'}</div>
      </div>
    );
  };

  renderForm = () => {
    return (
      <div>
        <BaseForm wrappedComponentRef={inst => (this.formRef = inst)} />
      </div>
    );
  };

  onSubmit = async () => {
    if (!this.formRef) return null;

    const value = this.formRef.wrappedInstance.getFormValue();
    if (!value) return;

    // 过滤items中的null
    const _value = { ...value, items: value && Array.isArray(value.items) ? value.items.filter(i => i) : null };

    await createProductBathCodeRule(_value).then((res) => {
      message.success('创建条码标签成功');

      // 创建成功去详情页面
      const id = _.get(res, 'data.data.ruleId');
      if (!id) return;
      this.context.router.history.push(`/stock/productBatchCodeRule/${encodeURIComponent(id)}/detail`);
    });
  };

  renderFooter = () => {
    return (
      <div>
        <Button
          type="default"
          style={buttonStyle}
          onClick={() => {
            const { router } = this.context;
            if (router) {
              router.history.go(-1);
            }
          }}
        >
          取消
        </Button>
        <Button type="primary" style={buttonStyle} onClick={this.onSubmit}>
          保存
        </Button>
      </div>
    );
  };

  render() {
    return (
      <div style={{ padding: 20 }}>
        <div style={{ marginBottom: 10 }}>{this.renderHeader()}</div>
        {this.renderForm()}
        <div style={{ paddingLeft: 120, marginTop: 30 }}>{this.renderFooter()}</div>
      </div>
    );
  }
}

CreateProductBatchCode.propTypes = {
  style: PropTypes.object,
};

CreateProductBatchCode.contextTypes = {
  router: PropTypes.object,
};

export default CreateProductBatchCode;
