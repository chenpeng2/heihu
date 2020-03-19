import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { primary } from 'src/styles/color';
import { openModal } from 'src/components';
import { queryMaterialDetail } from 'src/services/bom/material';
import { getProjectCreatedType, PROJECT_CREATE_TYPE } from 'src/containers/project/utils';

import ReplaceMaterial from './replaceMaterial';

class ReplaceContainer extends Component {
  state = {
    canReplace: false,
    replaceMaterials: [],
  };

  componentDidMount() {
    const { materialCode, projectCode } = this.props;
    this.getAndSetData(materialCode, projectCode);
  }

  componentWillReceiveProps(nextProps) {
    const { materialCode, projectCode } = nextProps;
    if (materialCode !== this.props.materialCode || projectCode !== this.props.projectCode) {
      this.getAndSetData(materialCode, projectCode);
    }
  }

  getAndSetData = (materialCode, projectCode) => {
    if (!materialCode || !projectCode) return;

    // 判断是否可以替代
    this.canMaterialBeReplaced(projectCode, materialCode).then(res => {
      this.setState({ canReplace: res });
    });

    // 获取替代物料
    this.getMaterialReplaceMaterials(materialCode).then(res => {
      this.setState({ replaceMaterials: res });
    });
  }

  // 判断这个物料是否可以被替代
  canMaterialBeReplaced = async (projectCode, materialCode) => {
    // 获取项目的创建类型
    const projectCreatedType = await getProjectCreatedType(projectCode);
    const replaceMaterials = await this.getMaterialReplaceMaterials(materialCode);

    // 项目是生产 BOM + 物料清单，或生产 BOM + 物料，或工艺路线 + 物料清单创建的
    // 物料有替代料
    // 那么可以替代
    if (
      projectCreatedType !== PROJECT_CREATE_TYPE.processRouting &&
      (Array.isArray(replaceMaterials) && replaceMaterials.length)
    ) {
      return true;
    }
    return false;
  };

  // 获取对应物料的替代物料
  getMaterialReplaceMaterials = async materialCode => {
    if (!materialCode) return null;

    const res = await queryMaterialDetail(materialCode);
    return _.get(res, 'data.data.replaceMaterialList');
  };

  render() {
    const { changeMaterial } = this.props;
    const { canReplace, replaceMaterials } = this.state;

    // 不可替代返回空
    if (!canReplace) return null;

    return (
      <div>
        <span
          style={{ color: primary, cursor: 'pointer' }}
          onClick={() => {
            openModal({
              title: '替换',
              children: <ReplaceMaterial replaceMaterials={replaceMaterials} changeMaterial={changeMaterial} />,
              footer: null,
            });
          }}
        >
          替换
        </span>
      </div>
    );
  }
}

ReplaceContainer.propTypes = {
  style: PropTypes.object,
  changeMaterial: PropTypes.func,
  materialCode: PropTypes.string,
  projectCode: PropTypes.string,
};

export default ReplaceContainer;
