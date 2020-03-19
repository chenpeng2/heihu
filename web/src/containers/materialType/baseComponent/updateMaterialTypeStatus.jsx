import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Link } from 'components';
import { primary } from 'src/styles/color';
import { updateMaterialTypeStatus } from 'src/services/bom/materialType';
import { message } from 'src/components';
import log from 'src/utils/log';

import { MATERIAL_TYPE_STATUS } from '../utils';

class UpdateMaterialTypeStatus extends Component {
  state = {};

  render() {
    const { id, statusNow, style, cbForUpdate } = this.props;

    const baseStyle = { color: primary, cursor: 'pointer' };
    const updateStatus = async (id, status) => {
      try {
        return await updateMaterialTypeStatus(id, status);
      } catch (e) {
        log.error(e);
      }
    };

    if (!id) return null;

    if (statusNow === MATERIAL_TYPE_STATUS.inStop.value) {
      return (
        <Link
          style={{ ...baseStyle, ...style }}
          onClick={async () => {
            const res = await updateStatus(id, MATERIAL_TYPE_STATUS.inUse.value);
            if (res && res.status === 200) {
              message.success('启用物料类型成功');
              if (typeof cbForUpdate === 'function') {
                await cbForUpdate();
              }
            }
          }}
        >
          {MATERIAL_TYPE_STATUS.inUse.name}
        </Link>
      );
    }

    if (statusNow === MATERIAL_TYPE_STATUS.inUse.value) {
      return (
        <Link
          style={{ ...baseStyle, ...style }}
          onClick={async () => {
            const res = await updateStatus(id, MATERIAL_TYPE_STATUS.inStop.value);
            if (res && res.status === 200) {
              message.success('停用物料类型成功');
              if (typeof cbForUpdate === 'function') {
                await cbForUpdate();
              }
            }
          }}
        >
          {MATERIAL_TYPE_STATUS.inStop.name}
        </Link>
      );
    }
  }
}

UpdateMaterialTypeStatus.propTypes = {
  style: PropTypes.object,
  id: PropTypes.string,
  statusNow: PropTypes.any, // 物料类型的当前状态
  cbForUpdate: PropTypes.any,
};

export default UpdateMaterialTypeStatus;
