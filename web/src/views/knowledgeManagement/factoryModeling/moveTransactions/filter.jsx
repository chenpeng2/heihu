import React from 'react';
import { FilterSortSearchBar, Input, Select, Button, withForm } from 'src/components';
import { borderGrey, middleGrey } from 'src/styles/color';
import { MOVE_TRANSACTIONS_STATUS } from './constants';

const { ItemList, Item } = FilterSortSearchBar;
const Option = Select.Option;

type Props = {
  form: any,
  handleSearch: () => {},
  handleReset: () => {},
};

const Filter = (props: Props) => {
  const { form, handleSearch, handleReset } = props;
  const { getFieldDecorator } = form;

  return (
    <FilterSortSearchBar style={{ width: '100%', borderBottom: `1px solid ${borderGrey}` }}>
      <ItemList>
        <Item label="状态">
          {getFieldDecorator('enable', { initialValue: MOVE_TRANSACTIONS_STATUS.all })(
            <Select labelInValue>
              {Object.values(MOVE_TRANSACTIONS_STATUS).map(({ key, label }) => (
                <Option key={`key-${key}`} value={key} title={label}>
                  {label}
                </Option>
              ))}
            </Select>,
          )}
        </Item>
        <Item label="移动事务">{getFieldDecorator('name')(<Input placeholder={'请输入名称'} />)}</Item>
      </ItemList>
      <Button icon="search" onClick={handleSearch}>
        查询
      </Button>
      <div
        style={{ color: middleGrey, marginLeft: 10, lineHeight: '28px', height: 28, cursor: 'pointer' }}
        onClick={handleReset}
      >
        重置
      </div>
    </FilterSortSearchBar>
  );
};

export default withForm({}, Filter);
