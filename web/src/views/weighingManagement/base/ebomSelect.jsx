import React, { Component } from 'react';
import { Select } from 'components';
import _ from 'lodash';

import { getEbomListWithExactSearch, getEbomList } from 'src/services/bom/ebom';

const { Option } = Select;

type Props = {
  params: {},
  loadOnFocus: boolean,
};

class EbomSelect extends Component {
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
      this.handleSearch();
    }
  };

  shouldComponentUpdate = (nextProps, nextState) => {
    const params = _.get(this.props, 'params');
    const nextParams = _.get(nextProps, 'params');

    if (!_.isEqual(params, nextParams) && _.get(nextParams, 'productMaterialCode')) {
      this.fetchData(nextParams);
    }

    return true;
  };

  fetchData = async params => {
    const { productMaterialCode } = params || {};
    if (productMaterialCode) {
      await getEbomListWithExactSearch({ status: 1, ...params })
        .then(res => {
          const data = _.get(res, 'data.data');
          this.setState({ data });
        })
        .catch(err => console.log(err));
    } else {
      await getEbomList({ status: 1, ...params })
        .then(res => {
          const data = _.get(res, 'data.data');
          this.setState({ data });
        })
        .catch(err => console.log(err));
    }
  };

  handleSearch = search => {
    const { params } = this.props;
    this.fetchData({ search, ...params });
  };

  render() {
    const { data } = this.state;
    const { params, ...rest } = this.props;

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
        allowClear
        {...rest}
      >
        {data &&
          data.map(({ id, version, rawMaterialList }) => (
            <Option id={id} key={version} value={version} rawMaterialList={rawMaterialList}>
              {version}
            </Option>
          ))}
      </Select>
    );
  }
}

export default EbomSelect;
