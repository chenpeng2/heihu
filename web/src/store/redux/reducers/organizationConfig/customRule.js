import { SET_CUSTOM_RULE_LIST } from '../../types/organizationConfig/customRule';

/** 自定义规则 */
const reducers = {
  customRuleList: (state = false, { type, payload }) => {
    if (type === SET_CUSTOM_RULE_LIST) {
      return payload;
    }
    return state;
  },
};

export default reducers;
