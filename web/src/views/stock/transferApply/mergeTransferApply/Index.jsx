import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import log from 'src/utils/log';
import { message, Button, Spin, FormattedMessage, openModal } from 'src/components';
import { black, middleGrey } from 'src/styles/color';
import { mergeTransferApply } from 'src/services/cooperate/materialRequest';

import MergePopConfirm from './MergePopConfirm';
import BaseForm, { formatBaseFormValueForSubmit } from './BaseForm';
import { getMergedTransferApplyListByIds } from '../util';

class MergeTransferApply extends Component {
  state = {
    transferApplyCodes: null,
    loading: false,
    transferApplyListData: null,
    originalIds: null,
    transferApplyIds: null,
  };

  componentDidMount() {
    this.getAndSetTransferApply();
  }

  getAndSetTransferApply = () => {
    // 需要有转移申请code在location的state中
    const { location } = this.props;
    const ids = _.get(location, 'state.transferApplyIds');
    this.setState({ originalIds: ids }, () => {
      this.setTransferApplyListData(ids);
    });
  };

  setTransferApplyListData = ids => {
    getMergedTransferApplyListByIds(ids, data => {
      this.setState({ transferApplyListData: data });
    });
  };

  renderButtons = () => {
    const { transferApplyListData } = this.state;
    const baseStyle = { width: 120 };
    const { router } = this.context;

    return (
      <div style={{ marginLeft: 140 }}>
        <Button
          style={{ ...baseStyle }}
          type={'default'}
          onClick={() => {
            router.history.push('cooperate/transferApply');
          }}
        >
          取消
        </Button>
        <Button
          type={'primary'}
          style={{ ...baseStyle, marginLeft: 10 }}
          onClick={() => {
            if (!this.formRef) return null;
            const getFormValue = _.get(this.formRef, 'wrappedInstance.getPayload');

            if (typeof getFormValue !== 'function') return;
            const formValue = getFormValue();

            if (!formValue) return;

            const formValueAfterFormat = formatBaseFormValueForSubmit(formValue);

            openModal({
              title: '合并后以下内容将发生更改',
              children: <MergePopConfirm mergedData={transferApplyListData} targetData={formValueAfterFormat} />,
              footer: null,
              onOk: async () => {
                this.setState({ loading: true });

                try {
                  const res = await mergeTransferApply(formValueAfterFormat);
                  if (res && res.status === 200) {
                    message.success('合并转移申请成功');
                    router.history.push('cooperate/transferApply');
                  }
                } catch (e) {
                  log.error(e);
                } finally {
                  this.setState({ loading: false });
                }
              },
            });
          }}
        >
          保存
        </Button>
      </div>
    );
  };

  render() {
    const { loading, transferApplyListData, originalIds } = this.state;
    if (!originalIds) {
      log.error('location的state中没有transferApplyIds');
      return null;
    }

    return (
      <Spin spinning={loading}>
        <div style={{ marginLeft: 20 }}>
          <div style={{ color: black, fontSize: 20, margin: '20px 0px' }}>
            <FormattedMessage defaultMessage={'合并转移申请'} />
          </div>
          <BaseForm
            mergedTransferApplyIds={originalIds}
            type={'merge'}
            wrappedComponentRef={inst => (this.formRef = inst)}
            listData={transferApplyListData}
            getMergedTransferApplyList={this.setTransferApplyListData}
          />
          {this.renderButtons()}
        </div>
      </Spin>
    );
  }
}

MergeTransferApply.propTypes = {
  style: PropTypes.object,
  location: PropTypes.any,
};
MergeTransferApply.contextTypes = {
  router: PropTypes.any,
};

export default MergeTransferApply;
