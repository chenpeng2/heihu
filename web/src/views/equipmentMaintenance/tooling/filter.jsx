import React from 'react';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';
import { Link, FilterSortSearchBar, Input, Select, Button, withForm, DatePicker, Searchselect } from 'src/components';
import { getCustomLanguage } from 'src/utils/customLanguage';
import { borderGrey, middleGrey } from 'src/styles/color';
import { TOOLING_STATUS } from './constants';

const customLanguage = getCustomLanguage();
const { ItemList, Item } = FilterSortSearchBar;
const Option = Select.Option;
const { RangePicker } = DatePicker;

type Props = {
  form: any,
  intl: any,
  handleSearch: () => {},
  handleReset: () => {},
};

const Filter = (props: Props) => {
  const { form, handleSearch, handleReset, intl } = props;
  const { getFieldDecorator } = form;

  return (
    <FilterSortSearchBar style={{ width: '100%', borderBottom: `1px solid ${borderGrey}` }}>
      <ItemList>
        <Item label="模具编号">{getFieldDecorator('searchCode')(<Input placeholder={'请输入编号'} />)}</Item>
        <Item label="模具名称">{getFieldDecorator('searchName')(<Input placeholder={'请输入名称'} />)}</Item>
        <Item label="模具型号">{getFieldDecorator('searchModel')(<Input placeholder={'请输入型号'} />)}</Item>
        <Item label={customLanguage.equipment_machining_material}>
          {getFieldDecorator('searchExactDefCode')(
            <Searchselect labelInValue={false} type="machiningMaterial" params={{ searchType: 2 }} />,
          )}
        </Item>
        {/* 本次迭代后端没做工装类型为一般工装，暂时隐藏工装类型筛选 */}
        {/* <Item label="工装类型">
          {getFieldDecorator('searchToolingType')(
            <Select>
              {Object.keys(TOOLING_TYPE).map((n, index) => (
                <Option key={`key-${index}`} value={n}>
                  {TOOLING_TYPE[n]}
                </Option>
              ))}
            </Select>,
          )}
        </Item> */}
        <Item label="制造商">
          {getFieldDecorator('searchManufacturerId')(<Searchselect type="manufacturer" labelInValue={false} />)}
        </Item>
        <Item label="序列号">{getFieldDecorator('searchSerialNumber')(<Input placeholder={'请输入序列号'} />)}</Item>
        <Item label="启用状态">
          {getFieldDecorator('enable', { initialValue: TOOLING_STATUS.all })(
            <Select labelInValue>
              {Object.values(TOOLING_STATUS).map(({ key, label }) => (
                <Option key={`key-${key}`} value={key} title={label}>
                  {changeChineseToLocale(label, intl)}
                </Option>
              ))}
            </Select>,
          )}
        </Item>
        <Item label="首次启用日期">{getFieldDecorator('firstEnabledTime')(<RangePicker allowClear />)}</Item>
      </ItemList>
      <Button icon="search" onClick={handleSearch}>
        查询
      </Button>
      <Link
        style={{ color: middleGrey, marginLeft: 10, lineHeight: '28px', height: 28, cursor: 'pointer' }}
        onClick={handleReset}
      >
        重置
      </Link>
    </FilterSortSearchBar>
  );
};

export default withForm({}, injectIntl(Filter));
