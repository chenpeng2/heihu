import React, { Component } from 'react';
import moment from 'utils/time';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

import { getQuery } from 'src/routes/getRouteParams';
import { FilterSortSearchBar, Input, Select, Button, Searchselect, DatePicker } from 'src/components';
import { borderGrey } from 'src/styles/color';
import { INBOUND_ORDER_STATUS } from './constants';

const { ItemList, Item } = FilterSortSearchBar;
const Option = Select.Option;
const { RangePicker } = DatePicker;

type Props = {
  form: any,
  match: any,
  handleSearch: () => {},
}

class Filter extends Component {
  props: Props
  state = {};

  render() {
    const { form, handleSearch } = this.props;
    const { changeChineseToLocale } = this.context;
    const { getFieldDecorator } = form;

    return (
      <FilterSortSearchBar style={{ width: '100%', borderBottom: `1px solid ${borderGrey}` }}>
        <ItemList>
          <Item label="入库单号">
            {getFieldDecorator('inboundOrderCode')(<Input placeholder={changeChineseToLocale('请输入编号')} />)}
          </Item>
          <Item label="状态">
            {getFieldDecorator('status',
              { initialValue: INBOUND_ORDER_STATUS.all },
            )(
              <Select labelInValue>
                {Object.values(INBOUND_ORDER_STATUS).map(({ key, label }) => (
                  <Option key={`key-${key}`} value={key} title={label}>
                    {changeChineseToLocale(label)}
                  </Option>
                ))}
              </Select>,
            )}
          </Item>
          <Item label="创建人">
            {getFieldDecorator('creator')(<Searchselect type="user" placeholder={changeChineseToLocale('请选择')} />)}
          </Item>
          <Item label="创建时间">
            {getFieldDecorator('createdAt', {
              initialValue: [moment().subtract(7, 'days'), moment()],
            })(<RangePicker />)}
          </Item>
        </ItemList>
        <Button
          icon="search"
          onClick={handleSearch}
        >
          查询
        </Button>
      </FilterSortSearchBar>
    );
  }
}

Filter.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default withRouter(Filter);
