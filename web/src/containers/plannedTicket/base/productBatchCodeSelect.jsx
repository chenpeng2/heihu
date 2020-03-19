// 成品批号规则的选择框
import React, { Component } from 'react';
import _ from 'lodash';

import { Select, Link, message } from 'src/components';
import { primary, error } from 'src/styles/color';
import { getProductBatchCodes, manualGenerateProductBatchCode } from 'src/services/productBatchCode';

const Option = Select.Option;

// 成品批次号状态
const PRODUCT_BATCH_CODE_RULE_STATUS = {
  all: { name: '全部', value: null },
  inUse: { name: '启用中', value: 1, color: primary },
  inStop: { name: '停用中', value: 0, color: error },
};

type Props = {
  params: {},
  style: {},
};
class ProductBatchCodeSelect extends Component {
  props: Props;
  state = {
    data: [],
    searchValue: null,
  };

  componentDidMount() {
    this.fetchData();
  }

  shouldComponentUpdate = (nextProps, nextState) => {
    if (!_.isEqual(nextProps.params, this.props.params)) {
      this.fetchData(nextProps.params);
    }
    return true;
  };

  fetchData = async p => {
    const { params } = this.props;
    await getProductBatchCodes({
      size: 20,
      page: 1,
      searchStatuses: PRODUCT_BATCH_CODE_RULE_STATUS.inUse.value,
      ...params,
      ...p,
    }).then(res => {
      const data = _.get(res, 'data.data');
      this.setState({
        data:
          Array.isArray(data) && data.length
            ? data.map(i => {
                const { batchNumber } = i || {};
                return { key: batchNumber, label: batchNumber };
              })
            : [],
      });
    });
  };

  handleSearch = async searchValue => {
    this.fetchData({ searchRuleName: searchValue });
    this.setState({ searchValue });
  };

  createNewBatchCode = async () => {
    const { params } = this.props;
    const { materialCode, projectCode } = params || {};
    const { searchValue } = this.state;
    await manualGenerateProductBatchCode({
      materialCode,
      projectCode,
      batchNumbers: [searchValue],
    })
      .then(res => {
        const statusCode = _.get(res, 'data.statusCode');
        if (statusCode === 200) {
          message.success('批次号创建成功！');
        } else {
          message.error('批次号创建失败！');
        }
      })
      .catch();
  };

  render() {
    // const { style, ...rest } = this.props;
    const { data, searchValue } = this.state;
    console.log(data);
    const options = data && data.map(({ key, label }) => (
      <Option key={`key-${key}`} value={key}>{label}</Option>
    ));
    options.unshift(<Option value="create" key="create" disabled>
      <Link
        disabled={!searchValue}
        icon="plus-circle-o"
        onClick={this.createNewBatchCode}
      >添加新批次号</Link>
    </Option>);

    return (
      <Select
        allowClear
        placeholder="请选择"
        onSearch={this.handleSearch}
        filterOption={false}
        {...this.props}
      >
      {options}
      </Select>
    );
  }
}

export default ProductBatchCodeSelect;
