import React, { Component } from 'react';
import { Select } from 'components';
import _ from 'lodash';

import { getWorkstation } from 'src/services/knowledgeBase/workstation';

const { Option } = Select;

type Props = {
  params: any,
  loadOnFocus: boolean,
};

class WeigherSelect extends Component {
  props: Props;
  constructor(props) {
    super(props);
    this.firstFocus = false; // 第一次focus不应该拉取数据
    this.state = {
      data: [],
    };
  }

  componentDidMount = () => {
    if (!this.props.loadOnFocus) {
      this.fetchData(this.props.params);
    }
  };

  shouldComponentUpdate = (nextPorps, nextState) => {
    if (!_.isEqual(nextPorps.params, this.props.params)) {
      this.fetchData(nextPorps.params);
    }
    return true;
  };

  fetchData = async params => {
    const { id } = params || {};

    if (id) {
      await getWorkstation(id)
        .then(res => {
          const data = _.get(res, 'data.data');
          const { equipments } = data || {};
          this.setState({ data: equipments || [] });
        })
        .catch(err => console.log(err));
    }
  };

  render() {
    const { data } = this.state;
    const { params, ...rest } = this.props;

    return (
      <Select
        allowClear
        onFocus={() => {
          // 默认第一次focus是不拉数据的，若需要loadOnFocus则单独再拉一次
          if (this.firstFocus || this.props.loadOnFocus) {
            this.fetchData();
          } else {
            this.firstFocus = true;
          }
        }}
        showSearch
        filterOption={false}
        {...rest}
      >
        {data &&
          data.map(({ entity: { id, code, name } }) => <Option key={id} value={id}>{`${name}(编号${code})`}</Option>)}
      </Select>
    );
  }
}

export default WeigherSelect;
