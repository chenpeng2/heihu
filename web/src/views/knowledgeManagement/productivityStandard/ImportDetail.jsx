import * as React from 'react';
import { RestPagingTable, Badge, Tooltip } from 'components';
import { formatUnix } from 'utils/time';
import { replaceSign, EBOM_STATUS } from 'constants';
import color from 'styles/color';
import { importDetail } from 'src/services/knowledgeBase/productivityStandard';
import styles from './index.scss';

type propTypes = {
  match: {
    params: {
      id: string,
    },
  },
};

const statusDisplay = {
  SUCCESS: color.primary,
  FAILURE: color.error,
  PART_SUCCESS: color.khaki,
};

const statusText = {
  SUCCESS: '导入成功',
  FAILURE: '导入失败',
  PART_SUCCESS: '部分导入成功',
};

class ImportDetail extends React.Component<propTypes> {
  state = {
    data: null,
  };

  componentDidMount() {
    this.fetchData();
  }
  async fetchData(params) {
    const {
      data: { data },
    } = await importDetail(this.props.match.params.id);
    this.setState({
      data,
    });
  }
  render() {
    // todo 需要给导入详情显示状态
    const { data } = this.state;
    if (data === null) {
      return <div />;
    }
    console.log(data);
    const {
      import: { createdAt, userName, successAmount, failureAmount, status },
      details,
    } = data;
    const { loading } = this.props;
    const columns = [
      { title: '失败原因', dataIndex: 'reason' },
      {
        title: '生产BOM成品物料编号',
        dataIndex: 'mbomMaterialCode',
      },
      {
        title: '生产BOM版本号',
        dataIndex: 'mbomVersion',
      },
      {
        title: '工序序号',
        dataIndex: 'processSeq',
      },
      {
        title: '工序名称',
        dataIndex: 'processName',
      },
      {
        title: '工位编号',
        dataIndex: 'workstationCode',
      },
      {
        title: '类型',
        dataIndex: 'timeType',
      },
      {
        title: '生产节拍时间',
        dataIndex: 'beatTime',
      },
      {
        title: '生产节拍时间单位',
        dataIndex: 'beatUnit',
      },
      {
        title: '产能时间',
        dataIndex: 'capacityTime',
      },
      {
        title: '产能数量',
        dataIndex: 'capacityNum',
      },
    ].map(node => ({
      render: text => (text ? <Tooltip length={15} text={text} /> : replaceSign),
      key: node.title,
      width: 130,
      ...node,
    }));
    return (
      <div>
        <div className={styles.detailHeader}>
          <div className={styles.title}>导入日志详情</div>
          <div className={styles.detail}>
            <div className={styles.row}>
              <span>导入时间</span>
              <span>{formatUnix(createdAt)}</span>
            </div>
            <div className={styles.row}>
              <span>导入用户</span>
              <span>{userName}</span>
            </div>
            <div className={styles.row}>
              <span>导入结果</span>
              <span style={{ color: statusDisplay[status] }}>{statusText[status]}</span>
            </div>
            <div className={styles.row}>
              <span>导入详情</span>
              <span>
                导入完成！标准产能导入成功数：{successAmount}，失败数{failureAmount}
              </span>
            </div>
          </div>
        </div>
        <div>
          <RestPagingTable loading={loading} columns={columns} dataSource={details} scroll={{ x: columns.length * 130 }} />
        </div>
      </div>
    );
  }
}

export default ImportDetail;
