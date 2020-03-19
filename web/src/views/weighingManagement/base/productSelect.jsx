import React, { Component } from 'react';
import { Select } from 'components';
import _ from 'lodash';

import { queryMaterial } from 'src/services/bom/material';

const { Option } = Select;

type Props = {
  params: {},
  loadOnFocus: boolean,
};

class ProductSelect extends Component {
  props: Props;
  constructor(props) {
    super(props);
    this.handleSearch = _.debounce(this.handleSearch, 800);
    this.state = {
      data: [],
    };
  }

  fetchData = async _params => {
    const { params } = this.props;

    await queryMaterial({ size: 20, ...params, ..._params })
      .then(({ data: { data } }) => {
        this.setState({ data });
      })
      .catch(err => console.log(err));

    return [];
  };

  handleSearch = search => {
    this.fetchData({ search });
  };

  render() {
    const { data } = this.state;

    return (
      <Select
        labelInValue
        onFocus={this.handleSearch}
        allowClear
        onSearch={this.handleSearch}
        filterOption={false}
        {...this.props}
      >
        {data && data.map(({ code, name }) => <Option key={code}>{`${code}/${name}`}</Option>)}
      </Select>
    );
  }
}

export default ProductSelect;
