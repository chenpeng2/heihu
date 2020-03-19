import * as React from 'react';
import { RestPagingTable, Badge, Tooltip, FormattedMessage } from 'components';
import { formatUnix } from 'utils/time';
import { replaceSign, EBOM_STATUS } from 'constants';
import color from 'styles/color';
import { queryEbomLog } from 'src/services/bom/ebom';
import styles from '../index.scss';

type propTypes = {
  match: {
    params: {
      id: string,
    },
  },
};

const statusDisplay = {
  success: color.primary,
  failure: color.error,
  part_success: color.khaki,
};

class LogDetail extends React.Component<propTypes> {
  state = {
    dataSource: [],
    userName: '',
    content: '',
    createdAt: '',
    status: {
      display: '',
    },
  };

  componentDidMount() {
    this.fetchData({ id: this.props.match.params.id });
  }
  async fetchData(params) {
    const {
      data: {
        data,
        data: { userName, content, createdAt, status },
      },
    } = await queryEbomLog(params);
    this.setState({
      dataSource: data.detailList.map(node => ({
        ...node,
        reason: node.reason,
        productMaterialCode: node.productMaterialCode,
        version: node.version,
        rawMaterialList: node.rawMaterialList,
      })),
      userName,
      content,
      createdAt,
      status,
    });
  }
  render() {
    // todo 需要给导入详情显示状态
    const { dataSource, userName, content, createdAt, status } = this.state;
    const { loading } = this.props;
    const columns = [
      { title: '失败原因', dataIndex: 'reason', key: 'reason' },
      {
        title: '成品物料编号',
        dataIndex: 'productMaterialCode',
        key: 'productMaterialCode',
        render: text => text || replaceSign,
      },
      {
        title: '版本号',
        dataIndex: 'version',
        key: 'version',
        render: text => text || replaceSign,
      },
      {
        title: '成品物料数量',
        dataIndex: 'productMaterialAmount',
        render: (text, record) => text || replaceSign,
      },
      {
        title: '物料编号-数量',
        dataIndex: 'rawMaterialList',
        key: 'rawMaterialList',
        render: list => {
          if (list && list.length > 0) {
            const text = list
              .map(({ materialCode, amount, amountFraction }) => {
                let _amount = amount;
                if (amountFraction && amountFraction.numerator && amountFraction.denominator) {
                  const { numerator, denominator } = amountFraction || {};
                  _amount = `${numerator}/${denominator}`;
                }
                return `${materialCode || replaceSign}-${_amount || replaceSign}`;
              })
              .join('、');
            return <Tooltip text={text} length={60} />;
          }
          return null;
        },
      },
    ];
    return (
      <div>
        <div className={styles.detailHeader}>
          <div className={styles.title}>
            <FormattedMessage defaultMessage={'导入日志详情'} />
          </div>
          <div className={styles.detail}>
            <div className={styles.row}>
              <FormattedMessage defaultMessage={'导入时间'} />
              <span>{formatUnix(createdAt)}</span>
            </div>
            <div className={styles.row}>
              <FormattedMessage defaultMessage={'导入用户'} />
              <span>{userName}</span>
            </div>
            <div className={styles.row}>
              <FormattedMessage defaultMessage={'导入结果'} />
              <span style={{ color: statusDisplay[status.value] }}>{status.display}</span>
            </div>
            <div className={styles.row}>
              <FormattedMessage defaultMessage={'导入详情'} />
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
