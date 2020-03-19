import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Input } from 'antd';
import { setLocation } from 'utils/url';
import { getPathname, getQuery } from 'src/routes/getRouteParams';
import styles from './styles.scss';

/**
 * @api {Search} Search.
 * @APIGroup Search.
 * @apiParam {any} relay -
 * @apiParam {Function} onSearchConfirm 查询处理函数.
 * @apiParam {StringNumber} width 搜索框长度,不传默认200.
 * @apiParam {StringNumber} height 搜索框高度.
 * @apiParam {Obj} style -
 * @apiExample {js} Example usage:
 * <Search
    width="100%"
    height={35}
    onSearchConfirm={(search) => onSearch({ search })}
   />
   search组件，默认有两种搜索方式
   1. 使用relay，是通过改变relay的参数来重新拉取数据的方式
   2. 使用redux，redux将会把参数先填入url中，然后relay从url中得到参数。
   推荐使用第二种方式，第一种方式是为了兼容过去的代码
 */

const SearchInput = Input.Search;

type Props = {
  onSearchConfirm: () => void,
  push: () => {},
  width: ?(string | number),
  height: ?(string | number),
  style: ?any,
  history: {},
  match: {},
  location: {},
  filterName: string,
};

class Search extends Component {
  props: Props;
  state = {};

  onDefaultConfirm = value => {
    const { match, location, filterName } = this.props;
    const pathname = getPathname(match);
    const query = getQuery(match);
    const search = filterName || 'search';
    const variables = {
      ...query,
      [search]: value,
      first: 10,
      from: 0,
    };
    if (location) {
      setLocation(this.props, () => variables);
      return;
    }
    global.log.error('search组件默认搜索确认函数出现错误');
  };

  render() {
    const { onSearchConfirm, width, style, height, ...rest } = this.props;
    const defaultContainerStyle = { width: width || 200, ouline: 'none', height };
    return (
      <div className={styles.searchContainer} style={Object.assign({}, defaultContainerStyle, style)}>
        <SearchInput
          placeholder="请输入搜索内容"
          onSearch={value => {
            if (onSearchConfirm) {
              return onSearchConfirm(value);
            }
            return this.onDefaultConfirm(value);
          }}
          {...rest}
        />
      </div>
    );
  }
}

export default withRouter(Search);
