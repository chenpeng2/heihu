import React, { Component } from 'react';
import _ from 'lodash';
import { AutoComplete as AntdAutoComplete } from 'antd';

import { queryMaterialList } from 'services/bom/material';

const Option = AntdAutoComplete.Option;

class MaterialAutoComplete extends Component {
  constructor(props) {
    super(props);
    this.firstFocus = false; // 第一次focus不应该拉取数据
    this.handleSearch = _.debounce(this.handleSearch, 800);
    this.state = {
      dataSource: [],
    };
  }

  componentDidMount() {
    this.handleSearch();
  }

  fetchData = async params => {
    // this.setState({ dataSource: [{ key: 'a', label: 'a/a' }, { key: 'b', label: 'b/b' }] });
    await queryMaterialList({ status: 1, size: 50, ...params })
      .then(res => {
        const data = _.get(res, 'data.data');
        let result = null;
        if (Array.isArray(data) && data.length > 0) {
          result = data.map(({ code, name }) => ({ label: `${code}/${name}`, key: code }));
        }
        this.setState({ dataSource: result });
      })
      .catch(err => console.log(err));
  };

  handleSearch = search => {
    this.fetchData({ search });
  };

  render() {
    const { dataSource } = this.state;
    const children = Array.isArray(dataSource)
      ? dataSource.map(({ key, label }) => (
          <Option key={key} value={key}>
            {label}
          </Option>
        ))
      : [];
    return (
      <AntdAutoComplete
        allowClear
        filterOption={false}
        placeholder="请输入"
        onSearch={this.handleSearch}
        defaultActiveFirstOption={false}
        labelInValue
        onSelect={(value, option) => {
          console.log(value, option);
        }}
        onFocus={() => {
          // 默认第一次focus是不拉数据的，若需要loadOnFocus则单独再拉一次
          if (this.firstFocus || this.props.loadOnFocus) {
            this.handleSearch();
          } else {
            this.firstFocus = true;
          }
        }}
        onBlur={() => {
          this.setState({ dataSource: [] });
        }}
        {...this.props}
      >
        {children}
      </AntdAutoComplete>
    );
  }
}

export default MaterialAutoComplete;
