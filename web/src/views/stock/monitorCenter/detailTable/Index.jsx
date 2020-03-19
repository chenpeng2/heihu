import React, { useState } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Spin, FormattedMessage } from 'src/components';
import { getMonitorConditionDetail } from 'src/services/monitorCenter';
import { useFetch } from 'src/utils/hookUtils/fetchHooks';
import { black, fontSub } from 'src/styles/color';
import { arrayIsEmpty } from 'src/utils/array';
import { replaceSign } from 'src/constants';

import Table from './Table';
import { getMonitionConditionInChinese } from '../utils';

const Detail = props => {
  const { match } = props;

  // 从url中获得监控条件id,监控仓库来拉取数据
  const conditionId = _.get(match, 'params.id');
  const warehouseCode = _.get(match, 'params.warehouseCode')
    ? decodeURIComponent(_.get(match, 'params.warehouseCode'))
    : null;
  if (!conditionId || !warehouseCode) return null;

  // 拉取监控条件
  const [{ data: detailData, isLoading: detailLoading }] = useFetch(getMonitorConditionDetail, {
    initialParams: conditionId,
  });
  const conditionData = _.get(detailData, 'data.data') || {};
  const { rules, warehouseInfo } = conditionData || {};

  let warehouseName = replaceSign;
  if (!arrayIsEmpty(warehouseInfo)) {
    warehouseInfo.forEach(i => {
      if (i && i.code === warehouseCode) {
        warehouseName = i.name;
      }
    });
  }

  return (
    <div style={{ padding: 20 }}>
      <Spin spinning={detailLoading}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <FormattedMessage style={{ fontSize: 16, color: black }} defaultMessage={'监控详情'} />
          <div style={{ color: fontSub, whiteSpace: 'nowrap' }}>
            <FormattedMessage defaultMessage={'监控位置'} />
            <span>:</span>
            <span>{warehouseName}</span>
            <FormattedMessage style={{ marginLeft: 10 }} defaultMessage={'监控条件'} />
            <span>:</span>
            <span>{arrayIsEmpty(rules) ? replaceSign : getMonitionConditionInChinese(rules[0])}</span>
          </div>
        </div>
      </Spin>
      <Table warehouseCode={warehouseCode} conditionId={conditionId} conditionData={conditionData} />
    </div>
  );
};

Detail.propTypes = {
  style: PropTypes.any,
  match: PropTypes.any,
};

export default Detail;
