import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Icon } from 'src/components';
import { getEditProjectPath } from 'src/containers/project/utils';
import { primary } from 'src/styles/color';

// 内置基本的样式
const baseStyle = {
  color: primary,
  cursor: 'pointer',
  verticalAlign: 'top',
  display: 'inline-block',
};

type Props = {
  style: {},
  isSubProject: boolean, // 是否是子项目
  projectCode: string,
  iconType: string, // icon的类型
  isGcIcon: boolean, // 是否是gcIcon
};

class LinkToEditProject extends Component {
  props: Props;
  state = {};

  render() {
    const { router } = this.context;
    const { isSubProject, projectCode, iconType, style, isGcIcon } = this.props;
    const editPath = getEditProjectPath(isSubProject, projectCode);

    return (
      <div onClick={() => router.history.push(editPath)} style={{ ...style, ...baseStyle }}>
        <span>{iconType ? <Icon type={iconType} iconType={isGcIcon ? 'gc' : null} /> : null}</span>
        <span>编辑</span>
      </div>
    );
  }
}

LinkToEditProject.contextTypes = {
  router: PropTypes.object,
};

export default LinkToEditProject;
