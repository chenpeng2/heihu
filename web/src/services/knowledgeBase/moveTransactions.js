/**
 * @description:
 *
 * @swagger_url: http://manufacture-dev.test.blacklake.tech/swagger-ui.html#!/move45transactions45controller/pageListUsingGET
 *
 * @date: 2019/5/5 下午12:08
 */
import request from 'utils/request';

const base = 'manufacture/v1/transTransaction';

// 列表接口的移动事务的模块枚举值
export const TRANS_TYPE = {
  transferApply: { name: '转移申请', value: 1 },
};

// 转移申请的事务获取接口
export const getMoveTransactionsForWeb = () => request.get(`${base}/webTransSelectList`);

export const getMoveTransactions = params => request.post(`${base}/page`, params);

export const getMoveTransactionDetail = params => request.get(`${base}/getInfo`, { params });

export const createmoveTransaction = data => request.post(`${base}/insert`, data);

export const editmoveTransaction = data => request.put(`${base}/update`, data);

export const updatemoveTransactionStatus = data => request.put(`${base}/updateStatus`, data);
