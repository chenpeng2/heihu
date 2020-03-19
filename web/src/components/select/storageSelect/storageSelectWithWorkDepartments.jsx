/**
 * @description: 自带工作部门提示的storageSelect
 *
 * @date: 2019/5/21 上午10:50
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import HintForUserDepartmentSet from 'src/containers/user/baseComponent/hintForUserDeaprtmentSet';
import { getUserInfo } from 'src/services/auth/user';

import openModal from '../../modal';
import StorageSelect from './storageSelect';

class StorageSelectWithWorkDepartments extends Component {
  state = {
    userWareHouseCodes: null,
  };

  componentWillMount() {
    this.setUserWareHouseIds();
  }

  setUserWareHouseIds = async cb => {
    const res = await getUserInfo();
    const workDepartments = _.get(res, 'data.data.workDepartments');
    // 只使用启用中的工作部门
    const wareHouses = Array.isArray(workDepartments)
      ? workDepartments
          .filter(i => i && i.warehouse && i.warehouse.status === 1)
          .map(i => i && i.warehouse)
          .filter(i => i)
      : [];
    if (!Array.isArray(wareHouses) || !wareHouses.length) {
      openModal({
        title: '提示',
        width: 420,
        style: { height: 260 },
        onCloseCb: () => {
          if (typeof cb === 'function') cb();
        },
        children: <HintForUserDepartmentSet />,
        footer: null,
      });
    } else {
      const data = wareHouses
        .map(i => {
          const { code } = i || {};
          return code;
        })
        .filter(i => i);

      this.setState(
        {
          userWareHouseCodes: data,
        },
        () => {
          if (typeof cb === 'function') cb();
        },
      );
    }
  };

  render() {
    const { userWareHouseCodes } = this.state;
    return (
      <StorageSelect
        params={{
          warehouseCodes: Array.isArray(userWareHouseCodes) ? decodeURIComponent(userWareHouseCodes.join(',')) : null,
        }}
        {...this.props}
      />
    );
  }
}

StorageSelectWithWorkDepartments.propTypes = {
  style: PropTypes.object,
};

export default StorageSelectWithWorkDepartments;
