// 电子标签打印的actions
import _ from 'lodash';
import { createAction } from 'redux-actions';
import { createAsyncAction } from 'redux-promise-middleware-actions';

import { getProjectList } from 'src/services/cooperate/project';
import { getBarcodeLabelList } from 'src/services/barCodeLabel';

// 选中项目action
export const electronicTagSelectProject = createAction('SELECT_PROJECT');

// 全选所有条码标签
export const changeSelectAllTags = createAction('SELECT_ALL_TAGS');

// 保存查询参数
export const saveQueryParamsForTagList = createAction('SAVE_QUERY_PARAMS_FOR_TAG_LIST');

// 保存选中的条码标签id
export const saveSelectedTagIds = createAction('SAVE_SELECTED_TAG_IDS');

// 拉取电子标签打印页面项目列表数据的action
export const fetchElectronicTagProjectList = createAsyncAction('FETCH_ELECTRONIC_TAG_PROJECT_LIST_DATA', async params => {
  const projectsRes = await getProjectList(params);
  const { data, total } = _.get(projectsRes, 'data') || {};

  return {
    projectListData: data,
    projectListDataTotalAmount: total,
    loading: false,
    params, // params的保存是为了让其他地方dispatch这个action的时候可以使用上一次的参数
  };
});

// 拉取条码标签列表的数据的action
export const fetchElectronicTagTagList = createAsyncAction('FETCH_ELECTRONIC_TAG_TAG_LIST_DATA', async params => {
  const barCodeLabelListDataRes = await getBarcodeLabelList(params);
  const { data, total } = _.get(barCodeLabelListDataRes, 'data');

  return {
    tagListData: data,
    tagListDataTotalAmount: total,
    loading: false,
    params,
  };
});

export default 'dummy';
