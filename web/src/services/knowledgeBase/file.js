import request from 'utils/request';

const base = 'def/v1';

export const getFileList = params => request.get(`${base}/file`, { params });

export const getFileDetail = params => request.get(`${base}/file/${params.id}`);

export const updateFile = params => request.put(`${base}/file/${params.id}`, params);

export const changeFileVersion = params => request.put(`${base}/file/change_type/${params.id}`, params);

export const createFile = params => request.post(`${base}/file`, params);

export const getFolderList = params => request.get(`${base}/folder`, { params });

export const getFolderDetail = params => request.get(`${base}/folder/${params.id}`);

export const updateFolder = params => request.put(`${base}/folder/${params.id}`, params);

export const updateFolderStatus = ({ id, ...rest }) => request.put(`${base}/folder/${id}/status`, undefined, { params: rest });

export const createFolder = params => request.post(`${base}/folder`, params);

export default 'dummy';
