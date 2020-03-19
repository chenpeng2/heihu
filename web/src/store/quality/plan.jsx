import { combineReducers } from 'redux';
import store from 'store';
import _ from 'lodash';
import { queryQcPlanDetail, editQcPlan } from 'services/qualityManagement/qcPlan';

import { uniqueType } from '../utils';

const namespace = 'quality/plan';

const types = {
  UPDATE_PLAN_DETAIL: uniqueType(namespace, 'UPDATE_PLAN_DETAIL'),
};

const actions = {
  updatePlanDetail: payload => store.dispatch({ type: types.UPDATE_PLAN_DETAIL, payload }),
};

const reducer = combineReducers({
  /** 质检计划详情 */
  planDetail: (state = null, action) => (action.type === types.UPDATE_PLAN_DETAIL ? action.payload : state),
});

const effects = {
  getDetailInfo: async code => {
    try {
      const response = await queryQcPlanDetail(code);
      const planDetail = _.get(response, 'data.data');
      return planDetail;
    } catch (error) {
      console.log(error);
    }
  },
  editQcPlan: async dto => {
    try {
      const response = await editQcPlan(dto);
      const data = _.get(response, 'data');
      return data;
    } catch (error) {
      console.log(error);
    }
  },
};

export { actions, reducer, effects };
