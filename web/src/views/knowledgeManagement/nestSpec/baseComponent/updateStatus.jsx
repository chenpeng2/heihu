import React from 'react';
import PropTypes from 'prop-types';

import { message } from 'src/components';
import { primary } from 'src/styles/color';
import { replaceSign } from 'src/constants';
import { updateNestSpecStatus } from 'src/services/nestSpec';

import { NEST_SPEC_STATUS } from '../utils';

// 获取下一个状态
const getNextState = stateNow => {
  if (stateNow === NEST_SPEC_STATUS.stop.value) return NEST_SPEC_STATUS.use;
  return NEST_SPEC_STATUS.stop;
};

/**
 * @description: 更新嵌套规格状态
 *
 * @date: 2019/6/10 上午11:03
 */
const UpdateState = props => {
  const { stateNow, style, cbForUpdateSuccess, id } = props;
  const { name, value } = getNextState(stateNow) || {};

  if (!name) return;
  const _name = typeof name === 'string' ? name.slice(0, 2) : replaceSign;

  return (
    <span
      onClick={() => {
        if (!id) return null;
        updateNestSpecStatus({ packCode: id, state: value }).then(res => {
          message.success('更新嵌套规格状态成功');
          if (typeof cbForUpdateSuccess === 'function') cbForUpdateSuccess(res);
        });
      }}
      style={{ color: primary, cursor: 'pointer', ...style }}
    >
      {_name}
    </span>
  );
};

UpdateState.propTypes = {
  style: PropTypes.any,
  stateNow: PropTypes.any.isRequired, // 当前状态
  cbForUpdateSuccess: PropTypes.any,
  id: PropTypes.any.isRequired, // id
};

export default UpdateState;
