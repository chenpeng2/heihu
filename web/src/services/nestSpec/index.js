/**
 * @swagger: http://def-dev.test.blacklake.tech/swagger-ui.html#/
 *
 * @date: 2019/6/20 上午11:12
 */
import request from '../../utils/request';

const BASE_URL = 'def/v1/package_bom';

// 获取嵌套规格的列表
export const getNestSpecs = async params => {
  return await request.get(`${BASE_URL}/list`, { params });
};

// 创建嵌套规格的时候自动生成code
export const getNestSpecNewCode = async params => {
  return await request.get(`${BASE_URL}/getNewCode`, { params });
};

// 创建嵌套规格
export const createNestSpec = async params => {
  return await request.post(`${BASE_URL}/insert`, params);
};

// 获取嵌套规格详情
export const getNestSpecDetail = async code => {
  return await request.get(`${BASE_URL}/info?packCode=${encodeURIComponent(code)}`);
};

// 更新嵌套规则
export const updateNestSpec = async params => {
  return await request.post(`${BASE_URL}/update`, params);
};

// 更新嵌套规则状态
export const updateNestSpecStatus = async params => {
  return await request.post(`${BASE_URL}/updateStatus`, params);
};

// 获取嵌套任务的code
export const getNestTaskCode = async params => {
  return await request.get('manufacture/v1/package/getCode', { params });
};

// 根据物料获取嵌套规格
export const getNestSpecByMaterials = async params => {
  return await request.post(`${BASE_URL}/getByContainMaterials`, params);
};

// 创建嵌套任务
export const createNestTask = async params => {
  return await request.post('manufacture/v1/package/createTask', params);
};

// 导入嵌套规格
export const importNestSpec = async params => {
  return await request.post(`${BASE_URL}/insertBatch`, params);
};

export default 'dummy';
