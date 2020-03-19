import * as React from 'react';
import { RestPagingTable } from 'components';
import { formatUnix } from 'utils/time';
import { replaceSign } from 'constants';
import { importProjectDetail } from 'src/services/cooperate/project';
import styles from '../index.scss';

type propTypes = {
  match: {
    params: {
      id: string,
    },
  },
  loading: boolean,
};

class LogDetail extends React.Component<propTypes> {
  state = {
    dataSource: [],
    userName: '',
    content: '',
    createdAt: '',
  };

  componentDidMount() {
    this.fetchData({ id: this.props.match.params.id });
  }
  async fetchData(params) {
    const { data: { data: { detail, failedList } } } = await importProjectDetail(params.id);
    this.setState({
      dataSource: failedList.map(node => ({
        ...node,
        managerIds: node.managerIds.join(','),
      })),
      userName: detail.operatorName,
      status: detail.status.display,
      content: `导入完成，项目导入成功数：${detail.amountSuccess}，项目导入失败数：${detail.amountFailed}`,
      createdAt: formatUnix(detail.importAt),
    });
  }
  render() {
    const { dataSource, status, userName, content, createdAt } = this.state;
    const { loading } = this.props;
    const columns = [
      { title: '失败原因', dataIndex: 'errorDetail', key: 'errorDetail' },
      { title: '项目编号', dataIndex: 'projectCode', key: 'projectCode', render: text => text || replaceSign },
      { title: '产出物料编号', dataIndex: 'productCode', key: 'productCode', render: text => text || replaceSign },
      {
        title: '数量',
        dataIndex: 'amountProductPlanned',
        key: 'amountProductPlanned',
        render: text => text || replaceSign,
      },
      {
        title: '订单编号',
        dataIndex: 'purchaseOrderCode',
        key: 'purchaseOrderCode',
        render: text => text || replaceSign,
      },
      { title: '项目负责人', dataIndex: '', render: text => text || replaceSign },
      {
        title: '计划开始时间',
        dataIndex: 'startTimePlanned',
        key: 'startTimePlanned',
        render: text => text || replaceSign,
      },
      {
        title: '计划结束时间',
        dataIndex: 'endTimePlanned',
        key: 'endTimePlanned',
        render: text => text || replaceSign,
      },
      {
        title: '工艺路线编号',
        dataIndex: 'processRoutingCode',
        key: 'processRoutingCode',
        render: text => text || replaceSign,
      },
      { title: '生产BOM版本号', dataIndex: 'mbomVersion', key: 'mbomVersion', render: text => text || replaceSign },
    ];
    return (
      <div>
        <div className={styles.detailHeader}>
          <div className={styles.title}>导入日志详情</div>
          <div className={styles.detail}>
            <div className={styles.row}>
              <span>导入时间</span>
              <span>{createdAt}</span>
            </div>
            <div className={styles.row}>
              <span>导入用户</span>
              <span>{userName}</span>
            </div>
            <div className={styles.row}>
              <span>导入结果</span>
              <span>{status}</span>
            </div>
            <div className={styles.row}>
              <span>导入详情</span>
              <span>{content}</span>
            </div>
          </div>
        </div>
        <div>
          <RestPagingTable loading={loading} columns={columns} dataSource={dataSource} />
        </div>
      </div>
    );
  }
}

export default LogDetail;
