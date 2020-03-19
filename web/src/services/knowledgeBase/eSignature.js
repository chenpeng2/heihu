import request from 'utils/request';

const base = 'user/v1/sign';

export const queryESignatureList = params => request.get(`${base}/list`, { params });

export const updateESignatureStatus = ({ status, configKey, ...params }) =>
  request.put(`${base}/status/${status}?configKey=${configKey}`, params);

/**
 * @description: queryESignatureStatus的type枚举值。
 *
 * @date: 2019/6/4 下午3:05
 *
 * @wiki: http://wiki.blacklake.tech/pages/viewpage.action?pageId=12886433
 *
 */
export const E_SIGN_SERVICE_TYPE = {
  MATERIAL_LOT_ADJUST: 'material_lot_adjust',
  MATERIAL_LOT_COMBINE: 'material_lot_combine',
};

// 根据type来查询当前业务是否开启电子签名
export const queryESignatureStatus = configKey => request.get(`${base}/item/status?configKey=${configKey}`);

export default queryESignatureList;
