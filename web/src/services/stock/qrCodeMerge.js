/**
* @description: 二维码合并
*
* @date: 2019/8/5 下午6:22
*/
import request from '../../utils/request';

const baseUrl = 'manufacture/v1';

// 获取二维码合并记录
export const getQrCodeMergeRecords = async (params) => {
  return request.get(`${baseUrl}/combine`, { params });
};

// 获取二维码合并的明细
export const getQrCodeMergeDetail = async (params) => {
    return request.get(`${baseUrl}/combine/getInfo`, { params });
};
