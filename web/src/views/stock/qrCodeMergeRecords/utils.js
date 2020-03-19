import _ from 'lodash';
import { E_SIGN_SERVICE_TYPE, queryESignatureStatus } from 'src/services/knowledgeBase/eSignature';

export const getQrCodeMergeRecordDetailPageUrl = id => (id ? `/stock/qrCodeMergeRecords/${id}/detail` : null);

export const getQrCodeDetailPageUrl = id => id ? `/stock/qrCodeMergeRecords/qrCodeDetail/${id}` : null;

// 二维码合并是否使用电子签名
export const isQrCodeMergeUseESign = () => queryESignatureStatus(E_SIGN_SERVICE_TYPE.MATERIAL_LOT_COMBINE).then(res => {
  return !!_.get(res, 'data.data', false);
});

export default 'dummy';
