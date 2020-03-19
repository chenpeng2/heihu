/**
 * @description: 移动事务的searchSelect
 *
 * @date: 2019/5/5 上午11:42
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Searchselect } from 'src/components';
import { getMoveTransactionsForWeb } from 'src/services/knowledgeBase/moveTransactions';
import { arrayIsEmpty } from 'src/utils/array';
import log from 'src/utils/log';

const extraSearch = async (params, type) => {
  // 目前接口是没有搜索的。但是用searchSelect实现是因为移动事务的创建是没有数量限制，所以觉得以后会需要搜索
  const res = await getMoveTransactionsForWeb({ ...params, transType: type }).catch(e => {
    log.error(e);
  });
  const data = _.get(res, 'data.data');

  return arrayIsEmpty(data)
    ? []
    : data
        .map(i => {
          if (!i) return null;
          const { code, name } = i;
          if (!code || !name) return null;

          return {
            key: code,
            label: `${code}/${name}`,
          };
        })
        .filter(i => i);
};

class SearchSelectForMoveTransactions extends Component {
  state = {};

  render() {
    const { type, ...rest } = this.props;
    return <Searchselect extraSearch={async params => await extraSearch(params, type)} {...rest} />;
  }
}

SearchSelectForMoveTransactions.propTypes = {
  style: PropTypes.object,
  type: PropTypes.any, // 移动事务服务的模块type枚举值。在service文件中定义了常量
  params: PropTypes.any,
};

export default SearchSelectForMoveTransactions;
