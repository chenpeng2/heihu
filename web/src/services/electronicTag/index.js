import request from 'src/utils/request';

const baseUrl = 'def/v1';
const defaultSize = 10;
const defaultPage = 1;

// 查询标签默认模板
export const getPrintTemplate = async variables => {
  return request.get(`${baseUrl}/print_template/item`, {
    params: variables,
  });
};

export default 'dummy';
