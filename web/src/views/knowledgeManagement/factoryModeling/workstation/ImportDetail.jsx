import React from 'react';
import { format } from 'utils/time';
import { RestPagingTable } from 'components';
import { importWorkstationLogDetail } from 'services/knowledgeBase/workstation';
import { replaceSign } from 'constants';
import styles from './index.scss';

class ImportDetail extends React.PureComponent<any> {
  state = {
    data: null,
  };

  componentDidMount = async () => {
    const { data: { data } } = await importWorkstationLogDetail(this.props.match.params.id);
    console.log(data);
    this.setState({ data });
  };

  render() {
    const { data } = this.state;
    if (!data) {
      return null;
    }
    const columns = [
      { title: '失败原因', dataIndex: 'reason' },
      { title: '工位编码', dataIndex: 'workstationCode' },
      { title: '工位名称', dataIndex: 'workstationName' },
      { title: '上级区域', dataIndex: 'superiorAreaCode' },
      { title: '上级区域类型', dataIndex: 'superiorAreaType' },
      { title: '工位组', dataIndex: 'workstationGroupName' },
      { title: '二维码', dataIndex: 'qrCode' },
      { title: '备注', dataIndex: 'remark' },
      { title: '多任务工位标识', dataIndex: 'toManyTask' },
    ].map(({ title, ...rest }) => ({
      title,
      key: title,
      render: text => text || replaceSign,
      ...rest,
    }));
    const { title: { createdAt, userName, failureAmount, successAmount }, details } = data;
    let result = '部分导入成功';
    if (failureAmount === 0) {
      result = '导入成功！';
    } else if (successAmount === 0) {
      result = '导入失败！';
    }
    return (
      <div className={styles.logDetail}>
        <div style={{ margin: '20px 20px 20px 40px' }}>
          <h2 style={{ marginBottom: 20 }}>导入日志详情</h2>
          <div style={{ marginLeft: 30 }}>
            <p className={styles.row}>
              <span>导入时间</span>
              {format(createdAt)}
            </p>
            <p className={styles.row}>
              <span>导入用户</span>
              {userName}
            </p>
            <p className={styles.row}>
              <span>导入结果</span>
              {result}
            </p>
            <p className={styles.row}>
              <span>导入详情</span> 导入完成，工位导入成功数：{successAmount}, 工位导入失败数：{
                failureAmount
              }
            </p>
          </div>
        </div>
        <RestPagingTable columns={columns} dataSource={details} rowKey="id" />
      </div>
    );
  }
}

export default ImportDetail;
