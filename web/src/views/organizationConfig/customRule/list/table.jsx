import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { replaceSign } from 'src/constants';
import moment from 'src/utils/time';

import { Badge, Popover, Icon, Table } from 'src/components';
import { primary, content } from 'src/styles/color';

import { findManage, findStatus } from '../utils';
import LinkToEdit from '../baseComponent/linkToEdit';
import UpdateStatus from '../baseComponent/updateStatus';

const MyBadge = Badge.MyBadge;

class RuleTable extends Component {
  state = {};

  renderToolTipForCTL = () => {
    return (
      <span>
        <span style={{ marginRight: 5 }}>管控等级</span>
        <Popover
          content={
            <div style={{ color: content }}>
              <p>老黑友情提示：</p>
              <p>强管控限制：</p>
              <p>APP执行时按规则进行限制性校验，即只有满足要求的操作才能继续执行</p>
              <p>弱管控限制：</p>
              <p>APP执行时按规则进行非限制性校验，即系统只会进行友善提示，由执行人进行最终的决定</p>
            </div>
          }
          overlayStyle={{ width: 406 }}
        >
          <Icon type="exclamation-circle-o" color={primary} style={{ marginRight: 5 }} />
        </Popover>
      </span>
    );
  };

  getColumns = () => {
    const { refetch } = this.props;
    return [
      {
        title: '功能名称',
        dataIndex: 'actionName',
        render: data => {
          return <span>{data || replaceSign}</span>;
        },
      },
      {
        title: '规则类型',
        dataIndex: 'ruleType',
        render: (data, record) => {
          const { rulesEnum } = record || {};
          const name = (rulesEnum && rulesEnum[data]) || replaceSign;
          return <span>{name}</span>;
        },
      },
      {
        title: '功能模块',
        dataIndex: 'module',
        render: data => data || replaceSign,
      },
      {
        title: '业务类型',
        dataIndex: 'businessType',
        render: data => data || replaceSign,
      },
      {
        title: <span>{this.renderToolTipForCTL()}</span>,
        dataIndex: 'ctlLevel',
        render: data => {
          const { name } = findManage(data) || {};
          return <span>{name || replaceSign}</span>;
        },
      },
      {
        title: '状态',
        dataIndex: 'status',
        render: data => {
          const { name, color } = findStatus(data) || {};
          if (!name) return <span>{replaceSign}</span>;

          return <MyBadge color={color} text={`${name}中`} />;
        },
      },
      {
        title: '最近更新时间',
        dataIndex: 'updateAt',
        render: data => {
          const text = data ? moment(data).format('YYYY/MM/DD HH:mm') : '暂无记录';
          return <span>{text}</span>;
        },
      },
      {
        title: '最近更新人',
        dataIndex: 'updatorName',
        render: data => {
          return <span>{data || '暂无记录'}</span>;
        },
      },
      {
        title: '操作',
        key: 'operation',
        render: (__, record) => {
          const { action } = record;
          return (
            <div>
              <LinkToEdit id={action} />
              <UpdateStatus
                cbForUpdate={() => {
                  if (typeof refetch === 'function') refetch();
                }}
                style={{ marginLeft: 5 }}
                detailData={record}
              />
            </div>
          );
        },
      },
    ];
  };

  render() {
    const { tableData } = this.props;

    return <Table columns={this.getColumns()} dataSource={tableData} pagination={false} />;
  }
}

RuleTable.propTypes = {
  style: PropTypes.object,
  tableData: PropTypes.any,
  refetch: PropTypes.func,
};

export default RuleTable;
