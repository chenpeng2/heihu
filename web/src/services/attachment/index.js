import request from '../../utils/request';

export const getAttachment = async (params: { id: string }): any => {
  const { id } = params;
  return request.get(`filebase/v1/files/${id}/_get`);
};

export const getAttachments = async (ids: []): any => {
  if (Array.isArray(ids) && ids.length > 0) {
    return request.get('filebase/v1/files/_list', { params: { fileIds: ids.join(',') } });
  }
  return [];
};

export const uploadAttachment = async file => {
  const formData = new FormData();
  formData.append('file', file);

  return request.post('filebase/v1/files/_upload', formData);
};

export default 'dummy';
