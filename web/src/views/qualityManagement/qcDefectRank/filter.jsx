import React from 'react';
import { injectIntl } from 'react-intl';
import { FilterSortSearchBar, Input, Select, Button, withForm } from 'src/components';
import { changeChineseToLocale } from 'utils/locale/utils';
import { borderGrey } from 'src/styles/color';
import { QCDEFECT_RANK_STATUS } from './constants';

const { ItemList, Item } = FilterSortSearchBar;
const Option = Select.Option;

type Props = {
  form: any,
  intl: any,
  handleSearch: () => {},
};

const Filter = (props: Props) => {
  const { form, handleSearch, intl } = props;
  const { getFieldDecorator } = form;

  return (
    <FilterSortSearchBar style={{ width: '100%', borderBottom: `1px solid ${borderGrey}` }}>
      <ItemList>
        <Item label="状态">
          {getFieldDecorator('searchStatus', { initialValue: QCDEFECT_RANK_STATUS.all })(
            <Select labelInValue>
              {Object.values(QCDEFECT_RANK_STATUS).map(({ key, label }) => (
                <Option key={`key-${key}`} value={key} title={label}>
                  {changeChineseToLocale(label, intl)}
                </Option>
              ))}
            </Select>,
          )}
        </Item>
        <Item label="编号">{getFieldDecorator('searchCode')(<Input placeholder={'请输入编号'} />)}</Item>
        <Item label="名称">{getFieldDecorator('searchName')(<Input placeholder={'请输入名称'} />)}</Item>
      </ItemList>
      <Button icon="search" onClick={handleSearch}>
        查询
      </Button>
    </FilterSortSearchBar>
  );
};

export default withForm({}, injectIntl(Filter));
