import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Spin, Link } from 'src/components';
import { replaceSign } from 'src/constants';
import DetailItem from 'src/layouts/detailItemLayout';
import { getQrCodeMergeDetail } from 'src/services/stock/qrCodeMerge';
import useFetch from 'src/utils/hookUtils/fetchHooks';
import { Big, isNumber } from 'src/utils/number';
import moment from 'src/utils/time';

import MergeDetailTable from './MergeDetailTable';
import { isQrCodeMergeUseESign, getQrCodeDetailPageUrl } from '../utils';

const { DetailPageTitleLayout } = DetailItem;

const Detail = props => {
  const [useESign, setUseESign] = useState(false);
  const { match } = props;
  const id = _.get(match, 'params.id');

  // 是否使用电子签名
  useEffect(() => {
    isQrCodeMergeUseESign().then(res => setUseESign(res));
  }, []);

  const [{ data, isLoading }] = useFetch(getQrCodeMergeDetail, { initialParams: { id } });
  const {
    amountRemain,
    amountChanged,
    opeUnitName,
    materialName,
    targetMaterialLotCode,
    targetMaterialLotId,
    materialCode,
    materialDesc,
    warehouseName,
    firstStorageName,
    storageName,
    operatorName,
    signatureUserName,
    createAt,
  } = _.get(data, 'data.data', {});

  const oldAmount = isNumber(amountRemain) && isNumber(amountChanged) ? Big(amountRemain).minus(amountChanged) : null;

  return (
    <Spin spinning={isLoading}>
      <div style={{ padding: 20 }}>
        <DetailPageTitleLayout title={'查看合并记录'} />
        <DetailItem label={'合并位置'}>
          <div>{`${warehouseName || replaceSign}/${firstStorageName || replaceSign}/${storageName ||
            replaceSign}`}</div>
        </DetailItem>
        <DetailItem label={'物料'}>{`${materialName || replaceSign}/${materialCode || replaceSign}`}</DetailItem>
        <DetailItem label={'规格描述'}>{materialDesc || replaceSign}</DetailItem>
        <DetailItem label={'合并二维码'}>
          {targetMaterialLotCode ? (
            <Link to={getQrCodeDetailPageUrl(targetMaterialLotId)}>{targetMaterialLotCode}</Link>
          ) : (
            replaceSign
          )}
        </DetailItem>
        <DetailItem label={'原数量'}>{isNumber(oldAmount) ? `${oldAmount} ${opeUnitName}` : replaceSign}</DetailItem>
        <DetailItem label={'合并后数量'}>
          {isNumber(amountRemain) ? `${amountRemain} ${opeUnitName}` : replaceSign}
        </DetailItem>
        <DetailItem label={'操作人'}>{operatorName || replaceSign}</DetailItem>
        {useESign ? <DetailItem label={'电子签名人'}>{signatureUserName || replaceSign}</DetailItem> : null}
        <DetailItem label={'操作时间'}>
          {createAt ? moment(createAt).format('YYYY/MM/DD HH:mm:ss') : replaceSign}
        </DetailItem>
        <DetailItem label={'合并明细'}>
          <MergeDetailTable detailData={_.get(data, 'data.data') || {}} />
        </DetailItem>
      </div>
    </Spin>
  );
};

Detail.propTypes = {
  style: PropTypes.any,
  match: PropTypes.any,
};

export default Detail;
