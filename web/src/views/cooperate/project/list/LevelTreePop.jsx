import React from 'react';
import _ from 'lodash';
import { Modal, Spin, SimpleTable, Link, Tooltip, Badge } from 'components';
import { thousandBitSeparator } from 'src/utils/number';
import { replaceSign, PROJECT_STATUS } from 'src/constants';
import moment from 'utils/time';
import { error, blueViolet, warning, border, fontSub } from 'src/styles/color';
import { getProjectLevelTree } from 'services/cooperate/project';

const { AntModal } = Modal;
const { MyBadge } = Badge;
const STATUS_COLOR = {
  1: border,
  2: blueViolet,
  3: warning,
  4: error,
  5: fontSub,
};

class LevelTreePop extends React.PureComponent {
  state = {
    loading: true,
    treeData: [],
    visible: false,
  };

  setTree = async () => {
    const { code } = this.props;
    const {
      data: { data },
    } = await getProjectLevelTree(code);
    this.setState({
      loading: false,
      treeData: [data],
    });
  };

  render() {
    const { loading, visible, treeData } = this.state;
    const { level, status, code, category } = this.props;
    const columns = [
      {
        title: '项目编号',
        dataIndex: 'projectCode',
        width: 300,
        render: thisCode => (
          <Link.NewTagLink
            style={{ wordBreak: 'break-all', display: 'inline' }}
            href={`/cooperate/projects/${thisCode}/detail`}
          >
            {thisCode}
            {thisCode === code && <span style={{ color: error }}>(当前项目)</span>}
          </Link.NewTagLink>
        ),
      },
      {
        title: '订单编号',
        dataIndex: 'purchaseOrderCode',
        width: 150,
        render: data => {
          if (!data) return replaceSign;
          return <Tooltip text={data} length={20} />;
        },
      },
      {
        title: '产出物料',
        dataIndex: 'materialCode',
        width: 200,
        render: (materialCode, { materialName }) => `${materialCode}/${materialName}`,
      },
      {
        title: '数量／单位',
        dataIndex: 'amountAndUnit',
        width: 130,
        render: (data, record) => {
          const { amountProductPlanned, unitName } = record || {};
          if (typeof amountProductPlanned === 'number' && amountProductPlanned >= 0) {
            return `${thousandBitSeparator(amountProductPlanned)} ${unitName || replaceSign}`;
          }
          return replaceSign;
        },
      },
      {
        title: '成品批次',
        dataIndex: 'productBatch',
        width: 130,
        render: (text, record) => {
          const { productBatchType } = record;
          if (productBatchType === 2 || !text) return replaceSign;
          return <Tooltip text={text} length={10} />;
        },
      },
      {
        title: '生产主管',
        width: 170,
        dataIndex: 'managers',
        render: data => {
          const text =
            Array.isArray(data) && data.length ? data.map(i => i.name || replaceSign).join(',') : replaceSign;

          return <Tooltip text={text} length={20} />;
        },
      },
      {
        title: '创建时间',
        width: 160,
        dataIndex: 'createdAt',
        render: data => {
          const text = data ? moment(data).format('YYYY/MM/DD HH:mm') : replaceSign;

          return <span>{text}</span>;
        },
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: 100,
        render: status => {
          if (typeof status === 'number') {
            return <MyBadge text={PROJECT_STATUS[status]} color={STATUS_COLOR[status]} />;
          }
          return replaceSign;
        },
      },
      {
        title: '计划开始时间',
        width: 130,
        dataIndex: 'startTimePlanned',
        render: data => {
          return data ? moment(data).format('YYYY/MM/DD') : replaceSign;
        },
      },
      {
        title: '计划结束时间',
        width: 130,
        dataIndex: 'endTimePlanned',
        render: data => {
          return data ? moment(data).format('YYYY/MM/DD') : replaceSign;
        },
      },
      {
        title: '进度',
        key: 'progress',
        width: 150,
        render: (data, record) => {
          const { amountProductCompleted, amountProductPlanned } = record || {};
          if (amountProductPlanned > 0 && amountProductCompleted >= 0) {
            return `${thousandBitSeparator(amountProductCompleted)}/${thousandBitSeparator(amountProductPlanned)}`;
          }
          return replaceSign;
        },
      },
      {
        title: '订单备注',
        dataIndex: 'purchaseOrder.remark',
        width: 250,
        render: remark => {
          return <Tooltip text={remark || replaceSign} length={20} />;
        },
      },
      {
        title: '项目备注',
        dataIndex: 'description',
        width: 200,
        render: data => {
          return <Tooltip text={data || replaceSign} length={20} />;
        },
      },
    ].map(node => ({ ...node, key: node.title }));
    if (status.code === 'aborted' || Number(category) !== 1) {
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
              key={JSON.stringify(treeData)}
              style={{ margin: '20px 20px 0 0' }}
              columns={columns}
              dataSource={treeData}
              scroll={{ x: 1900 }}
              expandIcon={() => <span />}
              indentSize={20}
              defaultExpandAllRows
              rowKey="projectCode"
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

export default LevelTreePop;
