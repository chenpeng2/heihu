import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { RestPagingTable, Tooltip, FormattedMessage } from 'src/components';
import { findProductBatchCodeRuleType } from 'src/containers/productBatchCodeRule/util';
import { replaceSign } from 'src/constants';
import LinkToEdit from 'src/containers/productBatchCodeRule/base/linkToEditProductBatchCodeRule';
import LinkToDetail from 'src/containers/productBatchCodeRule/base/linkToProductBatchCodeRuleDetail';
import ChangeStatus from 'src/containers/productBatchCodeRule/base/changeStatus';

import StatusBadge from '../base/statusBadge';

class ProductBatchCodeRuleTable extends Component {
  state = {};

  getColumns = () => {
    return [
      {
        title: '成品批号规则',
        dataIndex: 'ruleName',
        render: data => {
          return <Tooltip text={data || replaceSign} length={20} />;
        },
      },
      {
        title: '规则类型',
        dataIndex: 'ruleType',
        render: data => {
          const { name } = findProductBatchCodeRuleType(data) || {};
          if (!name) return replaceSign;

          return <FormattedMessage defaultMessage={name} />;
        },
      },
      {
        title: '状态',
        dataIndex: 'status',
        render: data => {
          if (typeof data !== 'number') return replaceSign;
          return <StatusBadge statusValue={data} />;
        },
      },
      {
        title: '规则描述',
        dataIndex: 'description',
        render: data => {
          return <Tooltip text={data || replaceSign} length={20} />;
        },
      },
      {
        title: '操作',
        key: 'operation',
        render: (__, record) => {
          const { status, ruleId } = record || {};
          const { fetchData } = this.props;

          return (
            <div>
              <LinkToDetail code={ruleId} />
              <LinkToEdit code={ruleId} statusNow={status} />
              <ChangeStatus code={ruleId} statusNow={status} cbForChangeStatus={fetchData} />
            </div>
          );
        },
      },
    ];
  };

  render() {
    const { style, data, totalAmount, fetchData } = this.props;
    const columns = this.getColumns();

    return (
      <div style={style}>
        <RestPagingTable
          columns={columns}
          dataSource={Array.isArray(data) ? data : []}
          total={totalAmount}
          refetch={fetchData}
        />
      </div>
    );
  }
}

ProductBatchCodeRuleTable.propTypes = {
  style: PropTypes.object,
  data: PropTypes.array,
  totalAmount: PropTypes.number,
  fetchData: PropTypes.func,
};

export default ProductBatchCodeRuleTable;
