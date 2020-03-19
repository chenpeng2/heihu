import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

import { Button, withForm, Input, Select, FilterSortSearchBar } from 'src/components';
import { getQuery } from 'src/routes/getRouteParams';
import SearchSelect from 'src/components/select/searchSelect';
import { PROJECT_STATUS } from 'src/constants';
import { fontSub, middleGrey } from 'src/styles/color';

const Item = FilterSortSearchBar.Item;

const Option = Select.Option;
const INPUT_WIDTH = 180;
export const PROJECT_DEFAULT_STATUS = '2';

type Props = {
  form: any,
  fetchData: () => {},
  match: {},
};

class Filter extends Component {
  props: Props;
  state = {};

  componentDidMount() {
    const { match, form } = this.props;
    const query = getQuery(match);
    const { projectCode, productCode, status, searchProduct } = query || {};

    form.setFieldsValue({
      projectCode,
      product: productCode ? searchProduct : undefined,
      status,
    });
  }

  renderStatusElement = () => {
    const { changeChineseToLocale } = this.context;
    const statusElement = Object.entries(PROJECT_STATUS).map(([key, value]) => {
      return (
        <Option key={key} value={key}>
          {changeChineseToLocale(value)}
        </Option>
      );
    });
    statusElement.unshift(
      <Option key={'all'} value={null}>
        {changeChineseToLocale('全部')}
      </Option>,
    );
    return statusElement;
  };

  onSearch = () => {
    const { fetchData, form, match } = this.props;
    const value = form.getFieldsValue();

    const { projectCode, product, status } = value || {};
    const params = {
      projectCode,
      status,
      searchProduct: product,
      productCode: product ? product.key : undefined,
      projectPage: 1,
    };

    if (typeof fetchData === 'function') {
      fetchData(params);
    }
  };

  render() {
    const { form } = this.props;
    const { getFieldDecorator, resetFields } = form;

    const itemStyle = {
      color: fontSub,
      margin: '0px 10px',
      verticalAlign: 'middle',
    };
    const inputStyle = {
      width: INPUT_WIDTH,
      verticalAlign: 'middle',
    };

    return (
      <FilterSortSearchBar searchFn={this.onSearch}>
        <Item label={'项目编号'}>{getFieldDecorator('projectCode')(<Input style={inputStyle} />)}</Item>
        <Item label={'成品物料'}>
          {getFieldDecorator('product')(
            <SearchSelect placeholder={'请选择'} style={inputStyle} type={'materialBySearch'} />,
          )}
        </Item>
        <Item label={'项目状态'}>
          {getFieldDecorator('status', {
            initialValue: PROJECT_DEFAULT_STATUS,
          })(
            <Select placeholder="关键字" allowClear style={inputStyle}>
              {this.renderStatusElement()}
            </Select>,
          )}
        </Item>
        <Button icon="search" onClick={this.onSearch} style={{ marginLeft: 10 }}>
          查询
        </Button>
        <div
          style={{
            display: 'inline-block',
            color: middleGrey,
            margin: '0 10px',
            cursor: 'pointer',
            verticalAlign: 'middle',
            whiteSpace: 'nowrap',
          }}
          onClick={() => {
            resetFields();
            form.setFieldsValue({ status: PROJECT_DEFAULT_STATUS });
            this.onSearch();
          }}
        >
          重置
        </div>
      </FilterSortSearchBar>
    );
  }
}

Filter.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default withForm({}, withRouter(Filter));
