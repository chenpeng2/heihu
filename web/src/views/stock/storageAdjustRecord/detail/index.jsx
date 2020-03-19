import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { injectIntl } from 'react-intl';

import { Spin, Link, FormattedMessage, Attachment } from 'src/components';
import { arrayIsEmpty } from 'src/utils/array';
import { replaceSign } from 'src/constants';
import DetailItemLayout from 'src/layouts/detailItemLayout';
import { black } from 'src/styles/color';
import { getTransactionLogs } from 'src/services/inventory';
import moment from 'src/utils/time';

import useFetch from 'src/utils/hookUtils/fetchHooks';
import AdjustDetailTable from './adjustDetailTable';
import { getQrCodeDetailUrl } from '../utils';

const Detail = (props, context) => {
  const { match } = props;
  const { changeChineseToLocale } = context;
  const id = _.get(match, 'params.id');

  const [{ data, isLoading }] = useFetch(getTransactionLogs, {
    initialParams: { recordCode: id },
  });

  const detailData = _.get(data, 'data.data[0]', {});
  const {
    storageCode,
    storageName,
    remark,
    recordCode,
    transactionName,
    transactionCode,
    module,
    qrcode,
    materialCode,
    materialName,
    createdAt,
    digitalSignatureUserName,
    operatorName,
    details,
    materialLotId,
    unit,
    materialDesc,
    attachments,
  } = detailData || {};

  return (
    <Spin spinning={isLoading}>
      <div style={{ padding: 20 }}>
        <div>
          <FormattedMessage defaultMessage={'事务记录详情'} style={{ color: black, fontSize: 20 }} />
        </div>
        <DetailItemLayout label={'记录编码'}>{recordCode || replaceSign}</DetailItemLayout>
        <DetailItemLayout label={'事务'}>
          {transactionCode && transactionName ? `${transactionCode}/${transactionName}` : replaceSign}
        </DetailItemLayout>
        <DetailItemLayout label={'功能模块'}>{module || replaceSign}</DetailItemLayout>
        <DetailItemLayout label={'二维码'}>
          {qrcode ? <Link to={getQrCodeDetailUrl(materialLotId)}>{qrcode}</Link> : replaceSign}
        </DetailItemLayout>
        <DetailItemLayout label={'物料'}>
          {materialCode && materialName ? `${materialCode}/${materialName}` : replaceSign}
        </DetailItemLayout>
        <DetailItemLayout label={'规格描述'}>{materialDesc || replaceSign}</DetailItemLayout>
        <DetailItemLayout label={'备注'}>{remark || replaceSign}</DetailItemLayout>
        <DetailItemLayout label={'操作位置'}>
          {storageName && storageCode ? `${storageCode}/${storageName}` : replaceSign}
        </DetailItemLayout>
        <DetailItemLayout label={'操作时间'}>
          {createdAt ? moment(createdAt).format('YYYY/MM/DD HH:mm:ss') : replaceSign}
        </DetailItemLayout>
        <DetailItemLayout label={'电子签名人'}>{digitalSignatureUserName || replaceSign}</DetailItemLayout>
        <DetailItemLayout label={'操作人'}>{operatorName || replaceSign}</DetailItemLayout>
        <DetailItemLayout label={'调整明细'}>
          <AdjustDetailTable unitName={unit} detailData={details} />
        </DetailItemLayout>
        <DetailItemLayout label={'附件'}>
          {arrayIsEmpty(attachments) ? (
            replaceSign
          ) : (
            <Attachment.InlineView contentStyle={{ margin: 0 }} hideTitle files={attachments} />
          )}
        </DetailItemLayout>
      </div>
    </Spin>
  );
};

Detail.propTypes = {
  style: PropTypes.any,
};

Detail.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default Detail;
