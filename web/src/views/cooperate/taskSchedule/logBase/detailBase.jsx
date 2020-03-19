import React from 'react';
import { SimpleTable } from 'components';
import { getScheduleLogDetail } from 'services/schedule';
import { formatUnix } from 'utils/time';
import _ from 'lodash';
import { replaceSign } from 'constants';

class DetailBase extends React.PureComponent {
  state = {
    data: null,
  };

  componentWillMount() {
    this.title = this.props.title || '日志详情';
    this.actionName = this.props.actionName || '操作';
  }

  componentDidMount() {
    this.setDataSource();
  }

  setDataSource = async () => {
    const { fetchData } = this.props;
    const id = _.get(this.props, 'match.params.id');
    if (fetchData) {
      const {
        data: { data },
      } = await fetchData(id);
      this.setState({ data });
    }
  };

  render() {
    const { getColumns } = this.props;
    const { data } = this.state;
    if (!data) {
      return null;
    }
    const _columns = [
      // status ＝ 1成功  0失败
      { title: '操作结果', dataIndex: 'status', render: data => (data === 1 ? '成功' : '失败') },
      { title: '订单编号', dataIndex: 'purchaseOrderCode', render: data => data || replaceSign },
      { title: '工单编号', dataIndex: 'workOrderCode', render: data => data || replaceSign },
      { title: '任务编号', dataIndex: 'taskCode', render: data => data || replaceSign },
      { title: '失败原因', dataIndex: 'reason', render: data => data || replaceSign },
      { title: '失败详情', dataIndex: 'detail', render: data => data || replaceSign },
    ].map(node => ({ key: node.title, ...node }));
    const columns = typeof getColumns === 'function' ? getColumns(_columns) : _columns;
    const { createdAt, userName, status, content, detail } = data;
    const rows = [
      { title: `${this.actionName}时间`, content: formatUnix(createdAt) },
      { title: `${this.actionName}用户`, content: userName },
      { title: `${this.actionName}结果`, content: status },
      { title: `${this.actionName}详情`, content },
    ];
    return (
      <div style={{ margin: 20 }}>
        <h2>{this.title}</h2>
        <div style={{ marginLeft: 20 }}>
          {rows.map(({ title, content }) => (
            <div key={title} style={{ marginBottom: 10 }}>
              <span>{title}</span>：<span>{content}</span>
            </div>
          ))}
        </div>
        <SimpleTable pagination={false} columns={columns} dataSource={detail} rowKey="id" />
      </div>
    );
  }
}

export default DetailBase;
