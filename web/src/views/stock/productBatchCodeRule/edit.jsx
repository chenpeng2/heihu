import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { black } from 'src/styles/color';
import BaseForm from 'src/containers/productBatchCodeRule/base/baseForm';
import { Button, message, Spin } from 'src/components';
import { editProductBatchCodeRule, getProductBatchCodeDetail } from 'src/services/productBatchCodeRule';
import LinkHistory from 'src/containers/productBatchCodeRule/base/linkToProductBatchCodeRuleOperationHistory';

// 提交和取消按钮的样式
const buttonStyle = { width: 114, height: 32, marginRight: 40 };

class EditProductBatchCode extends Component {
  state = {
    ruleId: null,
    detailData: [],
    loading: false,
  };

  componentDidMount() {
    this.getAndSetDetailData();
  }

  getAndSetDetailData = async () => {
    const ruleId = _.get(this.props, 'match.params.code');

    this.setState({ loading: true });

    const detailRes = await getProductBatchCodeDetail(ruleId).finally(() => {
      this.setState({ loading: false });
    });

    const detailData = _.get(detailRes, 'data.data');

    this.setState({
      detailData,
      ruleId,
    });
  };

  renderHeader = () => {
    return (
      <div>
        <div style={{ display: 'inline-block', color: black, fontSize: '16px' }}>{'编辑成品批号规则'}</div>
        <div style={{ display: 'inline-bloc', float: 'right' }}>
          <LinkHistory iconType={'bars'} code={this.state.ruleId} />
        </div>
      </div>
    );
  };

  renderForm = () => {
    return (
      <div>
        <BaseForm initialData={this.state.detailData} wrappedComponentRef={inst => (this.formRef = inst)} />
      </div>
    );
  };

  onSubmit = async () => {
    if (!this.formRef) return null;

    const { ruleId } = this.state;
    if (!ruleId) return;

    const value = this.formRef.wrappedInstance.getFormValue();
    if (!value) return;

    // 过滤items中的null
    const _value = { ...value, items: value && Array.isArray(value.items) ? value.items.filter(i => i) : null };

    await editProductBatchCodeRule(ruleId, _value).then(() => {
      message.success('编辑条码标签成功');

      // 创建成功去详情页面
      this.context.router.history.push(`/stock/productBatchCodeRule/${encodeURIComponent(ruleId)}/detail`);
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
      <Spin spinning={this.state.loading}>
        <div style={{ padding: 20 }}>
          <div style={{ marginBottom: 10 }}>{this.renderHeader()}</div>
          {this.renderForm()}
          <div style={{ paddingLeft: 120, marginTop: 30 }}>{this.renderFooter()}</div>
        </div>
      </Spin>
    );
  }
}

EditProductBatchCode.PropTypes = {
  style: PropTypes.object,
  match: PropTypes.object,
};
EditProductBatchCode.contextTypes = {
  router: PropTypes.object,
};

export default EditProductBatchCode;
