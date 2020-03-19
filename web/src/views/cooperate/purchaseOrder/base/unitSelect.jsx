import React, { Component } from 'react';
import _ from 'lodash';

import { Select } from 'components';
import { queryMaterialDetail } from 'src/services/bom/material';

const Option = Select.Option;

type Props = {
  params: any,
};

class UnitSelect extends Component {
  props: Props;
  state = {
    data: [],
  };

  componentDidMount = () => {
    this.fetchData();
  }

  shouldComponentUpdate = (nextProps, nextState) => {
    const { data } = this.state;
    if (!_.isEqual(nextProps.params, this.props.params) || data && data.length === 0) {
      this.fetchData(nextProps.params);
    }
    return true;
  };

  fetchData = async params => {
    const { materialCode } = params || {};

    if (materialCode) {
      await queryMaterialDetail(materialCode)
        .then(res => {
          const materialInfo = _.get(res, 'data.data');
          const { unitId, unitName, unitConversions } = materialInfo || {};
          const _unitConversions = _.get(unitConversions, 'length') > 0 ?
            unitConversions.map(({ slaveUnitName, slaveUnitId }) =>
              ({ key: slaveUnitId, label: slaveUnitName, master: false })) : [];
          const data = [{ key: unitId, label: unitName, master: true }].concat(_unitConversions);
          this.setState({ data });
        })
        .catch(err => console.log(err));
    }
  };

  render() {
    const { params, ...rest } = this.props;
    const { data } = this.state;

    return (
      <Select
        showSearch
        filterOption={false}
        {...rest}
      >
        {data && data.map(({ key, label, master }) =>
          (<Option key={key} value={label} master={master}>{label}</Option>))}
      </Select>
    );
  }
}

export default UnitSelect;
