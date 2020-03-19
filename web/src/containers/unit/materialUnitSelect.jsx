/**
 * @description: 用与选择某一个物料的相关单位
 *
 * @date: 2019/3/20 下午4:04
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Select } from 'src/components';
import { queryMaterialDetail } from 'src/services/bom/material';

class MaterialUnitSelect extends Component {
  state = {
    units: [],
  };

  searchAndSetMaterialUnits = async materialCode => {
    if (!materialCode) return;

    const res = await queryMaterialDetail(materialCode);
    const data = _.get(res, 'data.data');
    const { unitConversions, unitId, unitName } = data || {};

    const allUnits = [];
    if (Array.isArray(unitConversions) && unitConversions.length) {
      unitConversions.forEach(i => {
        const { slaveUnitId, slaveUnitName } = i || {};
        allUnits.push({ unitId: slaveUnitId, unitName: slaveUnitName });
      });
    }
    if (unitName && unitId) {
      allUnits.push({ unitId, unitName });
    }

    this.setState({
      units: allUnits,
    });
  };

  componentDidMount() {
    const materialCode = _.get(this.props, 'materialCode');
    this.searchAndSetMaterialUnits(materialCode);
  }

  componentDidUpdate(prevProps) {
    if (_.get(prevProps, 'materialCode') !== this.props.materialCode) {
      this.searchAndSetMaterialUnits(this.props.materialCode);
    }
  }

  render() {
    const { units } = this.state;

    return (
      <Select labelInValue {...this.props}>
        {Array.isArray(units) && units.length
          ? units.map(i => {
              const { unitId, unitName } = i || {};
              return <Select.Option value={unitId}>{unitName}</Select.Option>;
            })
          : null}
      </Select>
    );
  }
}

MaterialUnitSelect.propTypes = {
  style: PropTypes.object,
  materialCode: PropTypes.string,
};

export default MaterialUnitSelect;
