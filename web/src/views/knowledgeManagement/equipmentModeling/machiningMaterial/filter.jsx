import React, { Component } from 'react';
import { FilterSortSearchBar, Button, Select, Link, Input } from 'components';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';
import { white, borderGrey, fontSub } from 'src/styles/color/index';

const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;
const status = [
  {
    label: '全部',
    key: '',
  },
  {
    label: '启用中',
    key: '1',
  },
  {
    label: '停用中',
    key: '0',
  },
];

type Props = {
  form: any,
  intl: any,
  onSearch: () => {},
  onReset: () => {},
};

class MachiningMaterialFilter extends Component {
  props: Props;
  state = {};

  renderButton = () => {
    const { onSearch, onReset } = this.props;
    return (
      <div>
        <Button onClick={onSearch} icon={'search'}>
          查询
        </Button>
        <Link style={{ color: fontSub, marginLeft: 20, cursor: 'pointer' }} onClick={onReset}>
          重置
        </Link>
      </div>
    );
  };

  render() {
    const { form, intl } = this.props;
    const { getFieldDecorator } = form;

    return (
      <div style={{ borderBottom: `1px solid ${borderGrey}` }}>
        <FilterSortSearchBar style={{ backgroundColor: white, width: '100%' }} searchDisabled>
          <ItemList>
            {/* 现版本暂时不需要搜索类型 */}
            {/* <Item label="类型">
              {getFieldDecorator('searchType')(
                <Select allowClear placeholder="请选择" key="type" labelInValue>
                  {type.map(({ key, label }) => (
                    <Select.Option key={key} value={key}>
                      {label}
                    </Select.Option>
                  ))}
                </Select>,
              )}
            </Item> */}
            <Item label="编号">{getFieldDecorator('searchCode')(<Input placeholder={'请输入'} />)}</Item>
            <Item label="名称">{getFieldDecorator('searchName')(<Input placeholder={'请输入'} />)}</Item>
            <Item label="状态">
              {getFieldDecorator('searchStatus', { initialValue: { key: '', label: '全部' } })(
                <Select placeholder="请选择" key="status" labelInValue>
                  {status.map(({ key, label }) => (
                    <Select.Option key={key} value={key}>
                      {changeChineseToLocale(label, intl)}
                    </Select.Option>
                  ))}
                </Select>,
              )}
            </Item>
          </ItemList>
          {this.renderButton()}
        </FilterSortSearchBar>
      </div>
    );
  }
}

export default injectIntl(MachiningMaterialFilter);
