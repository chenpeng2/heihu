import request from '../../utils/request';

const baseUrl = 'def/v1';

export const getOrganizationConfig = async () => {
  return request.get(`/${baseUrl}/config`);
};

export const getCustomLanguage = async () => {
  return request.get(`/${baseUrl}/custom_language/list`);
};

export const getCustomLanguageByType = async type => {
  return request.get(`/${baseUrl}/custom_language/item`, { params: { type } });
};

export const updateCustomLanguage = async params => {
  return request.put(`/${baseUrl}/custom_language/${params.id}/module_name?name=${params.name}`);
};

export default 'dummy';
