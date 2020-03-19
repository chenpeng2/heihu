import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Select, Icon, Popover } from 'src/components';
import { getProductBatchCodes, generateProductBatchCode } from 'src/services/productBatchCode';
import { primary } from 'src/styles/color';

import ManualCreateProductBatchCode from './manualCreateProductBatchCode';

const Option = Select.Option;

class ProductBatchCodeSelect extends Component {
  state = {
    data: [],
    visible: false,
  };

  componentDidMount() {
    this.handleSearch();
  }

  componentWillReceiveProps() {
    this.handleSearch();
  }

  handleSearch = searchValue => {
    const { projectCode, searchParams } = this.props;
    if (!projectCode) return;

    getProductBatchCodes({ projectCode, searchBatchNumber: searchValue, ...searchParams, size: 20, page: 1 }).then(
      res => {
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
      },
    );
  };

  renderAutoCreateButton = () => {
    const { projectCode, cbForAddNewCode } = this.props;

    return (
      <Option key={'autoCreate'} disabled>
        <div
          onClick={() => {
            if (!projectCode) return;

            generateProductBatchCode({ projectCode, count: 1 }).then(res => {
              const newCode = _.get(res, 'data.data.0');
              this.handleSearch();
              if (typeof cbForAddNewCode === 'function') cbForAddNewCode(newCode);
            });
          }}
          style={{ color: primary, cursor: 'pointer' }}
        >
          <Icon type={'plus'} />
          <span>自动生成新的批次号</span>
        </div>
      </Option>
    );
  };

  renderManualCreate = () => {
    return (
      <Option key={'manualCreate'} disabled>
        <div
          onClick={() => {
            this.setState(({ visible }) => {
              return {
                visible: !visible,
              };
            });
          }}
        >
          <div style={{ color: primary, cursor: 'pointer' }}>
            <Icon type={'plus'} />
            <span>手工输入批次号</span>
          </div>
        </div>
      </Option>
    );
  };

  render() {
    const { style, projectCode, cbForAddNewCode, ...rest } = this.props;
    const { data } = this.state;

    return (
      <Popover
        trigger={'click'}
        placement={'left'}
        overlayStyle={{ width: 400 }}
        content={
          <ManualCreateProductBatchCode
            projectCode={projectCode}
            close={() => this.setState({ visible: false })}
            cbForSuccess={newValue => {
              this.handleSearch();
              if (typeof cbForAddNewCode === 'function') cbForAddNewCode(newValue);
            }}
          />
        }
        title={'手工输入批次号'}
        visible={this.state.visible}
      >
        <Select
          allowClear
          labelInValue
          placeholder="请选择"
          onSearch={this.handleSearch}
          style={{ width: 120, ...style }}
          filterOption
          {...rest}
        >
          {this.renderAutoCreateButton()}
          {this.renderManualCreate()}
          {data.map(({ key, label, ...rest }) => (
            <Option key={`key-${key}`} value={key} {...rest}>
              {label}
            </Option>
          ))}
        </Select>
      </Popover>
    );
  }
}

ProductBatchCodeSelect.propTypes = {
  style: PropTypes.object,
  projectCode: PropTypes.string,
  cbForAddNewCode: PropTypes.any,
  searchParams: PropTypes.object,
};

export default ProductBatchCodeSelect;
