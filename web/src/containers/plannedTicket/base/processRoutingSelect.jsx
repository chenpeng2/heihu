import React, { Component } from 'react';
import _ from 'lodash';

import { Select } from 'src/components';
import { getProcessRoutes } from 'src/services/bom/processRouting';

const Option = Select.Option;

type Props = {};

class ProcessRoutingSelect extends Component {
  props: Props;
  constructor(props) {
    super(props);
    this.handleSearch = _.debounce(this.handleSearch, 800);
    this.state = {
      data: [],
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async params => {
    await getProcessRoutes({ status: 1, ...params })
      .then(res => {
        const data = _.get(res, 'data.data');
        this.setState({ data });
      })
      .catch(err => console.log(err));
  };

  handleSearch = search => {
    this.fetchData({ search });
  };

  render() {
    const { data } = this.state;

    return (
      <Select
        onSearch={this.handleSearch}
        onBlur={() => this.setState({ data: [] })}
        placeholder={'请选择工艺路线'}
        onFocus={() => this.fetchData()}
        allowClear
        {...this.props}
      >
        {data && data.map(({ name, code }) => (
          <Option key={code} value={code}>{`${code}/${name}`}</Option>
        ))}
      </Select>
    );
  }
}

export default ProcessRoutingSelect;
