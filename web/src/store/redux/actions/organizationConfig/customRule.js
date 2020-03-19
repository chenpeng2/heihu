import { SET_CUSTOM_RULE_LIST } from '../../types/organizationConfig/customRule';

/** 自定义规则 */

export const setCustomRuleList = payload => {
  return {
    type: SET_CUSTOM_RULE_LIST,
    payload,
  };
};
