import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'src/components';
import { arrayIsEmpty } from 'src/utils/array';
import _ from 'lodash';

import { findTransferApplySourceType } from '../util';

const baseStyle = { width: 120 };
class MergePopConfirm extends Component {
  state = {};

  render() {
    const { onOk, onClose, mergedData, targetData } = this.props;
    const { code } = _.get(targetData, 'header') || {};

    const sourceTexts = [];
    if (!arrayIsEmpty(mergedData)) {
      mergedData.forEach(i => {
        const { sourceId, sourceType } = i || {};
        const { name } = findTransferApplySourceType(sourceType) || {};
        if (name && sourceId) sourceTexts.push(`${name} ${sourceId}`);
      });
    }

    return (
      <div style={{ padding: 20 }}>
        <div>
          {arrayIsEmpty(mergedData)
            ? null
            : mergedData
                .map(i => {
                  const { sourceType, sourceId, code } = i || {};
                  if (code && !sourceId) {
                    return <div>{`${code}将被取消`}</div>;
                  }
                  if (code && sourceId) {
                    const { name } = findTransferApplySourceType(sourceType) || {};
                    return <div>{`${code}将被取消并取消与${name} ${sourceId}之间的关联关系`}</div>;
                  }
                  return null;
                })
                .filter(i => i)}
          {arrayIsEmpty(sourceTexts)
            ? `${code}将被创建`
            : `${code}将被创建${arrayIsEmpty(sourceTexts) ? null : `并生成与${sourceTexts.join('，')}之间的关系`}`}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            style={baseStyle}
            type={'default'}
            onClick={() => {
              onClose();
            }}
          >
            再想想
          </Button>
          <Button
            style={{ marginLeft: 10, ...baseStyle }}
            type={'primary'}
            onClick={() => {
              onOk();
            }}
          >
            确认合并
          </Button>
        </div>
      </div>
    );
  }
}

MergePopConfirm.propTypes = {
  style: PropTypes.object,
  mergedData: PropTypes.any, // 被合并的数据
  targetData: PropTypes.any, // 合并后的数据
};

export default MergePopConfirm;
