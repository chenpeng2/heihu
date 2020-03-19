import React from 'react';
import { FilterSortSearchBar, Searchselect, Input, DatePicker, Icon, Select, withForm, Button } from 'components';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'src/utils/locale/utils';
import { white, borderGrey } from 'src/styles/color/index';
import { taskStatus } from '../../constants';

const { RangePicker } = DatePicker;
const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;

type Props = {
  form: {
    getFieldDecorator: () => {},
    getFieldsValue: () => {},
  },
  handleSearch: () => {},
  intl: any,
  match: {
    location: {},
  },
};

const FilterForDeviceRepairTask = (props: Props) => {
  const renderButton = () => {
    const { handleSearch } = props;
    return (
      <div>
        <Button style={{ width: 130 }} onClick={handleSearch} icon="search">
          查询
        </Button>
      </div>
    );
  };

  const { form, intl } = props;
  const { getFieldDecorator } = form;

  return (
    <div className="search-select-input">
      <FilterSortSearchBar
        style={{ backgroundColor: white, width: '100%', borderBottom: `1px solid ${borderGrey}` }}
        searchDisabled
      >
        <ItemList>
          <Item label="车间">{getFieldDecorator('searchWorkshopId')(<Searchselect type="workshop" />)}</Item>
          <Item label="目标类型">
            {getFieldDecorator('searchCategory')(
              <Searchselect
                placeholder="请搜索并选择"
                type={'targetType'}
                params={{ searchType: 'equipment' }}
                key="targetType"
              />,
            )}
          </Item>
          <Item label="目标名称">
            {getFieldDecorator('searchTargetId')(
              <Searchselect type={'target'} placeholder="请搜索并选择" key="targetName" />,
            )}
          </Item>
          <Item label="任务号">
            {getFieldDecorator('searchTaskCode')(<Input placeholder="请输入" key="taskCode" />)}
          </Item>
          <Item label="任务状态">
            {getFieldDecorator('searchStatus')(
              <Select allowClear placeholder={changeChineseToLocale('请选择', intl)} key="taskStatus" labelInValue>
                {taskStatus.map(({ key, label }) => (
                  <Select.Option key={key} value={key}>
                    {changeChineseToLocale(label, intl)}
                  </Select.Option>
                ))}
              </Select>,
            )}
          </Item>
          <Item label="创建人">
            {getFieldDecorator('searchCreatorId')(
              <Searchselect placeholder="请搜索并选择" type={'account'} key="creator" />,
            )}
          </Item>
          <Item label="执行人">
            {getFieldDecorator('searchOperatorId')(
              <Searchselect placeholder="请搜索并选择" type={'account'} key="operator" />,
            )}
          </Item>
          <Item label="截止时间">{getFieldDecorator('deadline')(<RangePicker />)}</Item>
        </ItemList>
        {renderButton()}
      </FilterSortSearchBar>
    </div>
  );
};

export default withForm({}, injectIntl(FilterForDeviceRepairTask));
