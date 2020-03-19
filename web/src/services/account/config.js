import request from 'utils/request';

const columnConfigBase = 'def/v1/user_config_column';

export const setColumnConfig = data => request.post(columnConfigBase, data);

export const getAllColumnConfig = () => request.get(`${columnConfigBase}/_list_by_user`);
