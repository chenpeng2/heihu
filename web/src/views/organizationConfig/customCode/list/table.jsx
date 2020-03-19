import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Link, Badge, Table, Tooltip } from 'src/components';
import { replaceSign } from 'src/constants';
import moment from 'src/utils/time';
import { primary, error } from 'src/styles/color';

import LinkToEdit from '../baseComponent/linkToEditPage';
import { getCustomCodeDetailPageUrl, getValidDateText, DEFAULT_USE_RANGE, CODE_TYPE } from '../utils';

class RuleTable extends Component {
  state = {};

  getColumns = () => {
    return [
      {
        title: '编码类型',
        dataIndex: 'type',
        render: () => {
          return <span>{CODE_TYPE.name}</span>;
        },
      },
      {
        title: '编码名称',
        dataIndex: 'name',
        render: data => {
          return <span>{data || replaceSign}</span>;
        },
      },
      {
        title: '适用范围',
        key: 'useRange',
        render: () => <span>{DEFAULT_USE_RANGE.name}</span>,
      },
      {
        title: '编码规则描述',
        dataIndex: 'des',
        render: text => {
          return <Tooltip text={text || replaceSign} length={15} />;
        },
      },
      {
        title: '状态',
        key: 'status',
        render: (__, record) => {
          const { validDateFrom, validDateTo } = record || {};
          // 因为存储到天。但是判断的时候节点为那一天的24点
          const isBetween = moment().isBetween(moment(validDateFrom), moment(validDateTo).add(1, 'day'), null, '[]');
          if (isBetween) {
            return <Badge.MyBadge text={'启用中'} color={primary} />;
          }
          return <Badge.MyBadge text={'停用中'} color={error} />;
        },
      },
      {
        title: '有效期',
        key: 'validDate',
        render: (__, record) => {
          const { validDateFrom, validDateTo } = record || {};

          return <Tooltip text={getValidDateText(validDateFrom, validDateTo)} length={25} />;
        },
      },
      {
        title: '操作',
        key: 'operation',
        render: (__, record) => {
          const { id } = record || {};

          return (
            <div>
              <Link style={{ marginRight: 20 }} to={getCustomCodeDetailPageUrl(id)}>
                查看
              </Link>
              <LinkToEdit id={id} />
            </div>
          );
        },
      },
    ];
  };

  render() {
    const { tableData } = this.props;
    const columns = this.getColumns();

    return <Table dataSource={tableData || []} columns={columns} pagination={false} />;
  }
}

RuleTable.propTypes = {
  style: PropTypes.object,
  tableData: PropTypes.any,
};

RuleTable.contextTypes = {
  router: PropTypes.any,
};

export default RuleTable;
