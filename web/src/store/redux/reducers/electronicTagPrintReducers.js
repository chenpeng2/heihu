// 条码标签打印的reducers
import { handleActions } from 'redux-actions';
import {
  electronicTagSelectProject,
  changeSelectAllTags,
  saveQueryParamsForTagList,
  saveSelectedTagIds,
  fetchElectronicTagProjectList,
  fetchElectronicTagTagList,
} from '../actions/electronicTagPrintActions';

export const reducer = handleActions(
  {
    [electronicTagSelectProject]: (state, action) => {
      return { ...state, selectedProjectInfo: action.payload };
    },
    [changeSelectAllTags]: (state, action) => {
      return { ...state, selectAllTags: action.payload };
    },
    [saveQueryParamsForTagList]: (state, action) => {
      return { ...state, queryParamsForTagList: action.payload };
    },
    [saveSelectedTagIds]: (state, action) => {
      return { ...state, selectedTagIds: action.payload };
    },
    [fetchElectronicTagProjectList.fulfilled]: (state, action) => {
      return { ...state, projectList: action.payload };
    },
    [fetchElectronicTagProjectList.pending]: state => {
      return { ...state, projectList: { loading: true } };
    },
    [fetchElectronicTagProjectList.rejected]: state => {
      return { ...state, projectList: { loading: false } };
    },
    [fetchElectronicTagTagList.fulfilled]: (state, action) => {
      return { ...state, tagList: action.payload };
    },
    [fetchElectronicTagTagList.pending]: state => {
      return { ...state, tagList: { loading: true } };
    },
    [fetchElectronicTagTagList.rejected]: state => {
      return { ...state, tagList: { loading: false } };
    },
  },
  {},
);

export default 'dummy';
