import React, { Component } from 'react';
import { Input, Select, FilterSortSearchBar } from 'components';
import { AllIncomingMap, ALL_INCOMING_DEFAULT } from '../../constants';

const { ItemList, Item, SearchButtons } = FilterSortSearchBar;
const { Option } = Select;

type FilterProps = {
  fetchData: () => void,
  form: any,
};

class FilterForList extends Component<FilterProps, {}> {
  state = {};

  render() {
    const { form, fetchData } = this.props;
    const { getFieldDecorator } = form || {};
    return (
      <FilterSortSearchBar searchFn={this.fetchData}>
        <ItemList>
          <Item label="物料编号">{getFieldDecorator('materialCode')(<Input placeholder="请输入物料编号" trim />)}</Item>
          <Item label="物料名称">{getFieldDecorator('materialName')(<Input placeholder="请输入物料名称" trim />)}</Item>
          <Item label="全部入厂" toolTip="需求数 <= 入厂数 - 退料数 时为全部入厂">
            {getFieldDecorator('isAllInFactory', {
              initialValue: ALL_INCOMING_DEFAULT,
            })(
              <Select>
                {Object.keys(AllIncomingMap).map(key => (
                  <Option value={Number(key)} key={Number(key)}>
                    {AllIncomingMap[key]}
                  </Option>
                ))}
              </Select>,
            )}
          </Item>
        </ItemList>
        <SearchButtons form={form} refetch={fetchData} />
      </FilterSortSearchBar>
    );
  }
}

export default FilterForList;
