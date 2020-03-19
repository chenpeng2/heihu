import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import auth from 'src/utils/auth';
import { getUserInfo } from 'src/services/auth/user';
import { Link, Button, Icon } from 'src/components';
import { orange, black } from 'src/styles/color';

class HintForUserDepartmentSet extends Component {
  state = {
    userId: null,
  };
  componentDidMount() {
    this.setUserInfo();
  }

  setUserInfo = async () => {
    const res = await getUserInfo();
    const { id } = _.get(res, 'data.data') || {};
    this.setState({ userId: id });
  };

  render() {
    const { onClose, onCloseCb } = this.props;
    const { userId } = this.state;
    return (
      <div>
        <div style={{ display: 'flex', padding: 20 }}>
          <div style={{ marginRight: 10 }}>
            <Icon type={'info-circle'} style={{ color: orange }} size={39} />
          </div>
          <div>
            <div style={{ fontSize: '18px', color: black }}>提示</div>
            <div>
              请找维护用户的工作部门以获取用户数据查询权限！点击前往用户编辑：
              <Link auth={auth.WEB_EDIT_USER} to={`/authority/users/user-edit/${userId}`}>用户管理模块-用户编辑页面-工作部门名称</Link>
            </div>
          </div>
        </div>
        <Button
          onClick={() => {
            if (typeof onClose === 'function') onClose();
            if (typeof onCloseCb === 'function') onCloseCb();
          }}
          style={{ margin: 'auto', display: 'block', marginBottom: 20 }}
          type={'default'}
        >
          知道了
        </Button>
      </div>
    );
  }
}

HintForUserDepartmentSet.propTypes = {
  style: PropTypes.object,
  onClose: PropTypes.func,
  onCloseCb: PropTypes.func,
};

export default HintForUserDepartmentSet;
