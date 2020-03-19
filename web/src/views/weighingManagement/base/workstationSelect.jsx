import React, { Component } from 'react';
import { Select } from 'components';
import _ from 'lodash';

import { queryWorkstation } from 'src/services/workstation';

const { Option } = Select;

type Props = {
  params: any,
  loadOnFocus: boolean,
};

class WorkstationSelect extends Component {
  props: Props;
  constructor(props) {
    super(props);
    this.handleSearch = _.debounce(this.handleSearch, 800);
    this.firstFocus = false; // 第一次focus不应该拉取数据
    this.state = {
      data: [],
    };
  }

  componentDidMount = () => {
    if (!this.props.loadOnFocus) {
      this.handleSearch(this.props.params);
    }
  };

  fetchData = async _params => {
    const { params } = this.props;

    await queryWorkstation({ size: 200, status: 1, ...params, ..._params })
      .then(({ data: { data } }) => {
        this.setState({ data });
      })
      .catch(err => console.log(err));

    return [];
  };

  handleSearch = search => {
    this.fetchData({ name: search });
  };

  render() {
    const { data } = this.state;

    return (
      <Select
        onFocus={() => {
          // 默认第一次focus是不拉数据的，若需要loadOnFocus则单独再拉一次
          if (this.firstFocus || this.props.loadOnFocus) {
            this.handleSearch();
          } else {
            this.firstFocus = true;
          }
        }}
        onSearch={this.handleSearch}
        allowClear
        filterOption={false}
        {...this.props}
      >
        {data &&
          data.map(({ id, name, code }) => (
            <Option key={id} value={id}>
              {name}
            </Option>
          ))}
      </Select>
    );
  }
}

export default WorkstationSelect;
