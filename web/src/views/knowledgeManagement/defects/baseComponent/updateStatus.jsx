import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { UNIT_STATUS } from 'src/containers/unit/util';
import { primary, black, warning } from 'src/styles/color';
import { updateDefectStatus } from 'src/services/knowledgeBase/defect';
import { haveAuthority, message, Popconfirm, FormattedMessage } from 'src/components';
import auth from 'src/utils/auth';

import { knowledgeItem } from '../constants';
import { changeChineseToLocaleWithoutIntl } from '../../../../utils/locale/utils';

class UpdateUnitStatus extends Component {
  state = {};

  render() {
    const { style, statusNow, data, id, cbForUpdate } = this.props;
    const { code } = data || {};
    if (!id) return null;

    // 获取下一个text和status
    let nextText;
    let nextStatusValue;

    if (statusNow === UNIT_STATUS.inUse.value) {
      nextText = UNIT_STATUS.stop.name ? UNIT_STATUS.stop.name.slice(0, -1) : null;
      nextStatusValue = UNIT_STATUS.stop.value;
    } else {
      nextText = UNIT_STATUS.inUse.name ? UNIT_STATUS.inUse.name.slice(0, -1) : null;
      nextStatusValue = UNIT_STATUS.inUse.value;
    }

    const changeStatus = async () => {
      const res = await updateDefectStatus(id, nextStatusValue);
      const statusCode = _.get(res, 'data.statusCode');
      if (statusCode === 200) {
        message.success(
          changeChineseToLocaleWithoutIntl('{action}{item}成功', {
            action: nextText,
            item: knowledgeItem.display,
          }),
        );
        if (typeof cbForUpdate === 'function') cbForUpdate();
      }
    };

    // 是否有编辑次品项权限
    const canEdit = haveAuthority(auth.WEB_DEFECT_EDIT);
    const disableEditStyle = { cursor: 'not-allowed', opacity: 0.3 };

    if (!canEdit) {
      return (
        <div style={{ ...disableEditStyle, ...style, color: primary }}>
          <FormattedMessage defaultMessage={nextText} />
        </div>
      );
    }

    return (
      <div style={style}>
        {nextStatusValue === UNIT_STATUS.stop.value ? (
          <Popconfirm.PopConfirmWithCustomButton
            text={
              <div>
                <div style={{ color: black, marginBottom: 10 }}>
                  <FormattedMessage defaultMessage={'确定停用次品项{itemCode}吗？'} values={{ itemCode: code }} />
                </div>
                <FormattedMessage defaultMessage={'停用后，引用该次品项的工序中，此次品项将被删除，请确定是否停用？'} />
              </div>
            }
            iconType={'exclamation-circle'}
            iconStyle={{ fontSize: '26px', color: warning }}
            textStyle={{ paddingLeft: 40 }}
            onConfirm={changeStatus}
            arrowPointAtCenter
            placement={'left'}
            cancelText={'取消'}
            okText={'确定'}
          >
            <FormattedMessage style={{ color: primary, cursor: 'pointer' }} defaultMessage={nextText} />
          </Popconfirm.PopConfirmWithCustomButton>
        ) : (
          <FormattedMessage
            onClick={changeStatus}
            style={{ color: primary, cursor: 'pointer' }}
            defaultMessage={nextText}
          />
        )}
      </div>
    );
  }
}

UpdateUnitStatus.propTypes = {
  style: PropTypes.object,
  statusNow: PropTypes.any,
  id: PropTypes.string,
  cbForUpdate: PropTypes.func,
  data: PropTypes.any,
};

export default UpdateUnitStatus;
