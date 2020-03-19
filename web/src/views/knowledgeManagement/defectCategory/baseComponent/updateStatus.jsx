import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { message, haveAuthority, FormattedMessage } from 'src/components';
import { primary } from 'src/styles/color';
import { updateDefectState } from 'src/services/knowledgeBase/defect';
import { replaceSign } from 'src/constants';
import auth from 'src/utils/auth';

import { DEFECT_CATEGORY_STATUS } from '../util';

// 获取下一个状态
const getNextState = stateNow => {
  if (stateNow === DEFECT_CATEGORY_STATUS.inStop.value) return DEFECT_CATEGORY_STATUS.inUse;
  return DEFECT_CATEGORY_STATUS.inStop;
};

/**
 * @description: 次品分类编辑状态
 *
 * @date: 2019/6/10 上午11:03
 */
const UpdateState = props => {
  const { stateNow, style, cbForUpdateSuccess, id } = props;
  const { name, value } = getNextState(stateNow) || {};

  if (!name) return;
  const _name = typeof name === 'string' ? name.slice(0, 2) : replaceSign;

  // 判断是否有编辑的权限
  const canEdit = haveAuthority(auth.WEB_DEFECT_GROUP_EDIT);

  if (!canEdit) {
    return <FormattedMessage style={{ cursor: 'not-allowed', opacity: 0.3, color: primary }} defaultMessage={_name} />;
  }

  return (
    <FormattedMessage
      onClick={() => {
        if (!id) return;
        updateDefectState(id, value).then(res => {
          message.success('更新次品分类状态成功');
          cbForUpdateSuccess(res);
        });
      }}
      style={{ color: primary, cursor: 'pointer', ...style }}
      defaultMessage={_name}
    />
  );
};

UpdateState.propTypes = {
  style: PropTypes.any,
  stateNow: PropTypes.any.isRequired, // 当前状态
  cbForUpdateSuccess: PropTypes.any,
  id: PropTypes.any.isRequired, // 次品分类id
};

export default UpdateState;
