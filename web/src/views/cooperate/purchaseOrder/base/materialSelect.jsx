import React, { Component } from 'react';
import _ from 'lodash';

import { Select } from 'antd';
import { queryMaterial } from 'src/services/bom/material';

const Option = Select.Option;

type Props = {
  params: {},
};

class MaterialSelect extends Component {
  props: Props;
  constructor(props) {
    super(props);
    this.handleSearch = _.debounce(this.handleSearch, 800);
    this.state = {
      data: [],
    };
  }

  componentDidMount = () => {
    this.fetchData(this.props.params);
  };

  // shouldComponentUpdate(nextProps, nextState, nextContext) {
  //   const params = _.get(this.props, 'params');
  //   const nextParams = _.get(nextProps, 'params');

  //   if (!_.isEqual(nextProps, this.props)) {
  //     this.fetchData(nextParams);
  //   }

  //   return true;
  // }

  handleSearch = search => {
    this.fetchData({ search });
  };

  fetchData = async p => {
    const { params } = this.props;

    queryMaterial({ status: 1, size: 50, ...params, ...p })
      .then(res => {
        const data = _.get(res, 'data.data');
        this.setState({ data });
      })
      .catch(err => console.log(err));
  };

  render() {
    const { data } = this.state;
    const { params, ...rest } = this.props;

    return (
      <Select showSearch filterOption={false} onSearch={this.handleSearch} {...rest}>
        {data &&
          data.map(({ code, name, unitId, unitName, materialCustomFields }) => {
            return (
              <Option
                materialCustomFields={materialCustomFields}
                masterUnit={{ unitId, unitName }}
                key={code}
                value={code}
                title={`${code}/${name}`}
              >
                {code}/{name}
              </Option>
            );
          })}
      </Select>
    );
  }
}

export default MaterialSelect;
