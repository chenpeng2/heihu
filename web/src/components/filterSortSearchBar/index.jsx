import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import RowLayout from 'src/layouts/rowLayout';
import PropTypes from 'prop-types';
import { Select } from 'antd';
import { getQuery } from 'src/routes/getRouteParams';

import Item from './item';
import ItemList from './itemList';
import ItemForFormItem from './itemForFormItem';
import SearchButtons from './searchButtons';
import ItemListWithFoldButton from './itemListWithFoldButton';

/**
 * @api {FilterSortSearchBar} 筛选框.
 * @APIGroup FilterSortSearchBar.
 * @apiParam {Array} filterGroups filterGroups的基本格式
  [{
    display: 'name',//这一行数据显示的名字
    variable:var,//var是relay的参数名
    defaultValue: value // value是label中的一个value
    labels: [{
      name:a,//name是button的name
      value:v,//value是relay的参数值
    }]//这一行数据的具体值和setVariables使用的时候的值。
  },{}].
 * @apiParam {Function} onFiltersConfirm 默认情况下不需要，如果需要在更新数据时有额外操作才需要onFiltersConfirm.
 * @apiParam {Function} onSearchConfirm 传给Search组件,不传默认有一个onDefaultConfirm.
 * @apiParam {Obj} style -
 * @apiParam {Obj} buttonStyle filterGroups.legnth = 1时筛选按钮的按钮样式.
 * @apiParam {Obj} containerStyle 筛选框左面的一块div的样式,默认paddingRight: 10.
 * @apiParam {React.node} children 筛选框左面的一块div里的组件,可不传.
 * @apiParam {any} search 筛选框右侧的搜索框,不传有默认的.
 * @apiParam {any} defaultValue 搜索框里的默认值,通过...rest传给了antd的Input.Search.
 * @apiParam {any} context 使用redux,给getPathname和getQuery的参数.
 * @apiParam {Boolean} searchDisabled 是否有筛选框右侧的搜索框,值为false有搜索框.
 * @apiExample {js} Example usage:
 * const filterGroups = [{
      display: '计划类型',
      variable: 'category',
      defaultValue: 0,
      labels: [
        {
          name: '全部计划',
          value: null,
        },
        {
          name: '生产计划',
          value: 'prod',
        },
        {
          name: '库存计划',
          value: 'stock',
        },
        {
          name: '采购计划',
          value: 'purchase',
        },
      ],
    }];
 * <FilterSortSearchBar
    filterGroups={filterGroups}
    search={
      <SearchSelect width={400} types={['ProductOrder', 'Account', 'Plan', 'Material']} />
    }
   />
 */

type Props = {
  filterGroups: [{}],
  onFiltersConfirm: () => {},
  onSearchConfirm: () => {},
  push: () => {},
  relay: any,
  buttonStyle: {},
  searchDisabled: boolean,
  children: any,
  searchPlaceholder: string,
  search: any,
  style: any,
  containerStyle: any,
  context: any,
  defaultValue: any,
  match: {},
  innerStyle: {},
};

class FilterSortSearchBar extends Component {
  props: Props;
  state = {};

  render() {
    const { searchFn, children, innerStyle, style, ...rest } = this.props;
    return (
      <div
        onKeyDown={e => {
          // 按enter自动查询
          if (e.keyCode === 13 && typeof searchFn === 'function') {
            searchFn();
          }
        }}
        style={style}
        {...rest}
      >
        <RowLayout style={{ padding: 20, ...innerStyle }}>{children}</RowLayout>
      </div>
    );
  }
}

FilterSortSearchBar.contextTypes = {
  router: PropTypes.object,
};

FilterSortSearchBar.propTypes = {
  searchFn: PropTypes.func,
};

FilterSortSearchBar.ItemList = ItemList;
FilterSortSearchBar.Item = Item;
FilterSortSearchBar.ItemForFormItem = ItemForFormItem;
FilterSortSearchBar.SearchButtons = SearchButtons;
FilterSortSearchBar.ItemListWithFoldButton = ItemListWithFoldButton;

export default FilterSortSearchBar;
