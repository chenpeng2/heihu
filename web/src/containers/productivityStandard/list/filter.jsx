import React, { Component } from 'react';

import { withForm, FilterSortSearchBar, Input, Select, Button, DatePicker } from 'components';
import SearchSelect from 'src/components/select/searchSelect';
import { middleGrey } from 'src/styles/color';

const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;
const Option = Select.Option;

const STATUS = {
  全部: null,
  启用中: 1,
  停用中: 0,
};

type Props = {
  style: {},
  fetchData: () => {},
  form: {},
};

class ProductivityStandardListFilter extends Component {
  props: Props;
  state = {};

  render() {
    const { form, fetchData } = this.props;

    const { getFieldDecorator, getFieldsValue, resetFields } = form;

    return (
      <FilterSortSearchBar searchDisabled>
        <ItemList>
          <Item label={'编号'}>{getFieldDecorator('code')(<Input placeholder={null} />)}</Item>
          <Item label={'状态'}>
            {getFieldDecorator('status', {
              initialValue: null,
            })(
              <Select allowClear>
                {Object.entries(STATUS).map(([name, value]) => {
                  return (
                    <Option value={value} key={value}>
                      {name}
                    </Option>
                  );
                })}
              </Select>,
            )}
          </Item>
          <Item label={'工序'}>{getFieldDecorator('process')(<SearchSelect type={'processName'} placeholder={null} />)}</Item>
          <Item label={'物料'}>{getFieldDecorator('material')(<SearchSelect type={'materialBySearch'} placeholder={'物料编号／名称'} />)}</Item>
          <Item label={'工位'}>{getFieldDecorator('workstation')(<SearchSelect type={'workstation'} placeholder={'请选择'} />)}</Item>
        </ItemList>
        <Button
          icon="search"
          onClick={() => {
            const value = getFieldsValue();
            const { code, process, status, material, workstation } = value || {};

            if (!fetchData) return;

            fetchData({
              page: 1,
              status,
              code,
              process_code: process ? process.key : null,
              material_code: material ? material.key : null,
              workstation_id: workstation ? workstation.key : null,
            });
          }}
        >
          查询
        </Button>
        <span
          style={{ color: middleGrey, margin: '0px 10px', lineHeight: '28px', cursor: 'pointer' }}
          onClick={() => {
            resetFields();

            if (!fetchData) return;

            fetchData({
              code: null,
              page: 1,
              status: null,
              process_code: null,
              material_code: null,
              workstation_id: null,
            });
          }}
        >
          重置
        </span>
      </FilterSortSearchBar>
    );
  }
}

export default withForm({}, ProductivityStandardListFilter);
