import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { RestPagingTable, FormattedMessage } from 'src/components';
import { replaceSign } from 'src/constants';

import {
  findProductBatchCodeRuleDetailSequenceType,
  findProductBatchCodeRuleDetailType,
  findProductBatchCodeRuleDetailOriginal,
  findProductBatchCodeRuleDetailVariableFormat,
  PRODUCT_BATCH_CODE_RULE_DETAIL_TYPE,
  findProductBatchCodeRuleDetailDate,
} from '../util';
import Tooltip from '../../../components/tooltip';

class RuleDetailTable extends Component {
  state = {};

  getColumns = () => {
    return [
      {
        title: '序号',
        key: 'seq',
        render: (__, ___, index) => {
          return <span>{index}</span>;
        },
      },
      {
        title: '类型',
        dataIndex: 'itemType',
        render: data => {
          const { name } = findProductBatchCodeRuleDetailType(data) || {};

          return <FormattedMessage defaultMessage={name} />;
        },
      },
      {
        title: '元素来源',
        dataIndex: 'valueSource',
        render: data => {
          const { name } = findProductBatchCodeRuleDetailOriginal(data) || {};

          return <span>{name || replaceSign}</span>;
        },
      },
      {
        title: '长度',
        dataIndex: 'valueLength',
        render: data => {
          return <span>{typeof data === 'number' ? data : replaceSign}</span>;
        },
      },
      {
        title: '格式',
        dataIndex: 'valueFormat',
        render: (data, record) => {
          const { itemType } = record;
          let name = null;
          if (itemType === PRODUCT_BATCH_CODE_RULE_DETAIL_TYPE.date.value) {
            const format = findProductBatchCodeRuleDetailDate(data);
            name = format ? format.name : null;
          }
          if (itemType === PRODUCT_BATCH_CODE_RULE_DETAIL_TYPE.variable.value) {
            const format = findProductBatchCodeRuleDetailVariableFormat(data);
            name = format ? format.name : null;
          }

          return <FormattedMessage defaultMessage={name} />;
        },
      },
      {
        title: '设置值（分段用）',
        dataIndex: 'valueConst',
        render: data => {
          if (!data) return replaceSign;

          return <Tooltip text={data} length={20} />;
        },
      },
      {
        title: '流水起始值',
        dataIndex: 'valueStart',
        render: data => {
          return <span>{data || replaceSign}</span>;
        },
      },
      {
        title: '流水步长',
        dataIndex: 'valueStep',
        render: data => {
          return <span>{data || replaceSign}</span>;
        },
      },
      {
        title: '流水码制',
        dataIndex: 'valueSeqType',
        render: data => {
          const { name } = findProductBatchCodeRuleDetailSequenceType(data) || {};

          return <FormattedMessage defaultMessage={name} />;
        },
      },
    ];
  };

  render() {
    const { tableData } = this.props;
    const columns = this.getColumns();

    return (
      <div>
        <RestPagingTable
          style={{ margin: 0 }}
          columns={columns}
          dataSource={Array.isArray(tableData) ? tableData : []}
          pagination={false}
          width={1000}
        />
      </div>
    );
  }
}

RuleDetailTable.propTypes = {
  style: PropTypes.object,
  tableData: PropTypes.array,
};

export default RuleDetailTable;
