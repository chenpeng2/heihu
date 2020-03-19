import React from 'react';
import { getWorkOrderTree } from 'services/schedule';
import { OpenModal, SimpleTable, Spin, Link, Badge, Tooltip } from 'components';
import { thousandBitSeparator } from 'utils/number';
import { formatDate, formatDateTime } from 'utils/time';
import { replaceSign } from 'src/constants';
import { error } from 'styles/color';

import { planStatus, executeStatus } from './utils';

const { AntModal } = OpenModal;
const MyBadge = Badge.MyBadge;

class WorkOrderTree extends React.PureComponent {
  state = {
    loading: true,
    dataSource: [],
    visible: false,
  };

  setTree = async () => {
    const { code } = this.props;
    const {
      data: { data },
    } = await getWorkOrderTree(code);
    this.setState({ loading: false, dataSource: [data] });
  };

  render() {
    const { loading, dataSource, visible } = this.state;
    const { level, status, code, category } = this.props;
    const columns = [
      {
        title: '工单编号',
        dataIndex: 'code',
        width: 300,
        render: thisCode => {
          return (
            <Link.NewTagLink
              style={{ wordBreak: 'break-all', display: 'inline' }}
              href={`/cooperate/plannedTicket/detail/${encodeURIComponent(thisCode)}`}
            >
              {thisCode}
              {thisCode === code && <span style={{ color: error }}>(当前工单)</span>}
            </Link.NewTagLink>
          );
        },
      },
      {
        title: '订单编号',
        dataIndex: 'purchaseOrderCode',
        width: 150,
        render: data => {
          if (!data) return replaceSign;
          return <Tooltip text={data} length={14} />;
        },
      },
      {
        title: '产出物料',
        dataIndex: 'materialCode',
        width: 200,
        render: (materialCode, { materialName }) => `${materialCode}/${materialName}`,
      },
      {
        title: '数量',
        dataIndex: 'amount',
        width: 130,
        render: (amount, record) => {
          const { materialUnit } = record;
          return `${thousandBitSeparator(amount)}${materialUnit || replaceSign}`;
        },
      },
      {
        title: '已生产数量',
        dataIndex: 'amountCompleted',
        key: 'amountCompleted',
        width: 100,
        align: 'right',
        render: (text, record) => {
          const amount = Number(text);
          return typeof amount === 'number' ? thousandBitSeparator(amount) : replaceSign;
        },
      },
      {
        title: '成品批次',
        dataIndex: 'productBatch',
        width: 130,
        render: (text, record) => {
          const { productBatchType } = record;
          if (productBatchType === 2 || !text) return replaceSign;
          return <Tooltip text={text} length={13} />;
        },
      },
      {
        title: '生产主管',
        dataIndex: 'managers',
        width: 170,
        render: data => (Array.isArray(data) ? <Tooltip text={data.join(',')} length={10} /> : replaceSign),
      },
      {
        title: '计划状态',
        dataIndex: 'status',
        width: 120,
        render: text => planStatus[text],
      },
      {
        title: '创建时间',
        dataIndex: 'createdAt',
        width: 160,
        render: text => (text ? formatDateTime(text) : replaceSign),
      },
      {
        title: '执行状态',
        dataIndex: 'executeStatus',
        width: 120,
        render: status =>
          executeStatus[status] ? (
            <MyBadge text={executeStatus[status].text} color={executeStatus[status].color} />
          ) : (
            replaceSign
          ),
      },
      {
        title: '计划开始时间',
        dataIndex: 'planBeginTime',
        width: 150,
        render: text => (text ? formatDate(text) : replaceSign),
      },
      {
        title: '计划结束时间',
        dataIndex: 'planEndTime',
        width: 150,
        render: text => (text ? formatDate(text) : replaceSign),
      },
      {
        title: '订单备注',
        dataIndex: 'purchaseOrderRemark',
        width: 200,
        render: text => (text ? <Tooltip text={text} length={20} /> : replaceSign),
      },
      {
        title: '备注',
        dataIndex: 'remark',
        width: 200,
        render: text => (text ? <Tooltip text={text} length={20} /> : replaceSign),
      },
    ].map(node => ({
      ...node,
      key: node.title,
    }));

    if (Number(category) !== 1) {
      return level;
    }

    return (
      <React.Fragment>
        <AntModal
          width={1000}
          footer={null}
          title={null}
          visible={visible}
          centered
          onCancel={() => this.setState({ visible: false })}
        >
          <Spin spinning={loading}>
            <SimpleTable
              key={JSON.stringify(dataSource)}
              style={{ margin: '20px 20px 0 0' }}
              columns={columns}
              dataSource={dataSource}
              scroll={{ x: 2000 }}
              expandIcon={() => <span />}
              indentSize={20}
              defaultExpandAllRows
              rowKey="code"
              pagination={false}
            />
          </Spin>
        </AntModal>
        <Link
          onClick={() => {
            this.setState({ visible: true });
            this.setTree();
          }}
        >
          {level}
        </Link>
      </React.Fragment>
    );
  }
}

export default WorkOrderTree;
