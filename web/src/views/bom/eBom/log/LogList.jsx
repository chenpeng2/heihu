import * as React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { RestPagingTable, DatePicker, Button, Link, Badge, withForm, FormattedMessage } from 'components';
import { formatUnix, formatToUnix, formatRangeUnix, daysAgo } from 'utils/time';
import getParams from 'utils/url';
import moment from 'moment';
import { queryEbomLogs } from 'src/services/bom/ebom';
import styles from '../index.scss';

const RangePicker = DatePicker.RangePicker;

const STATUS_MAP = {
  SUCCESS: 1,
  FAILURE: 0,
};

type LogListType = {
  children: ?React.Node,
  loading: boolean,
  form: any,
  router: any,
  match: any,
};

type stateType = {
  dataSource: Array<any>,
  loading: boolean,
};

type recordType = {
  createdAt: string,
  user: string,
  failureAmount: number,
  successAmount: number,
  key: string,
};

class LogList extends React.Component<LogListType, stateType> {
  state = {
    dataSource: [],
    loading: false,
    count: 0,
  };

  componentDidMount(): any {
    const query = this.props.match.location.query.queryAfterJsonStringify;
    let params = {};
    if (query) {
      params = JSON.parse(query);
    }
    const {
      form: { setFieldsValue },
    } = this.props;
    if (!params.startTime && !params.endTime) {
      setFieldsValue({ time: [daysAgo(30), moment()] });
    } else {
      setFieldsValue({ time: [formatUnix(params.startTime), formatUnix(params.endTime)] });
    }
    this.fetchData({ page: 1, size: 10 });
  }

  fetchData = async params => {
    const { getFieldValue } = this.props.form;
    let fromAt;
    let toAt;
    if (getFieldValue('time') && getFieldValue('time').length > 0) {
      fromAt = formatRangeUnix(getFieldValue('time'))[0];
      toAt = formatRangeUnix(getFieldValue('time'))[1];
    }
    const res = await queryEbomLogs({ fromAt, toAt, size: 10, ...params });
    const data = _.get(res, 'data.data');
    const count = _.get(res, 'data.count');
    this.setState({
      loading: false,
      count,
      dataSource: data.map(
        (node: any): any => ({
          ...node,
          key: node.id,
          importId: node.importId,
          createdAt: formatUnix(node.createdAt),
          user: node.userName,
        }),
      ),
    });
  };

  renderTable(): React.Node {
    const { dataSource, count } = this.state;
    const { loading } = this.props;
    const columns = [
      {
        title: '导入时间',
        dataIndex: 'createdAt',
        key: 'createdAt',
        type: 'startTime',
      },
      {
        title: '导入用户',
        dataIndex: 'user',
        key: 'user',
      },
      {
        title: '导入结果',
        dataIndex: 'status',
        key: 'status',
        render: (status, { statusDisplay }) => {
          if (status === STATUS_MAP.SUCCESS) {
            return <Badge status="success" text={statusDisplay} />;
          } else if (status === STATUS_MAP.FAILURE) {
            return <Badge status="error" text={statusDisplay} />;
          }
          return <Badge status="warning" text={statusDisplay} />;
        },
      },
      {
        title: '导入详情',
        dataIndex: 'detail',
        key: 'detail',
        render: (
          text: string,
          { failureAmount, successAmount, updateFailureAmount, updateSuccessAmount }: recordType,
        ): React.Node => (
          <FormattedMessage
            defaultMessage={
              '物料清单导入完成！创建成功数：{successAmount}，创建失败数：{failureAmount}；更新成功数：{updateSuccessAmount}，更新失败数：{updateFailureAmount}'
            }
            values={{ successAmount, failureAmount, updateSuccessAmount, updateFailureAmount }}
          />
        ),
      },
      {
        title: '操作',
        key: 'operation',
        render: (text: string, record: recordType): React.Node => (
          <Link
            onClick={() => {
              this.context.router.history.push(`/bom/eBom/loglist/logdetail/${record.importId}`);
            }}
          >
            查看
          </Link>
        ),
      },
    ];
    return (
      <RestPagingTable
        refetch={this.fetchData}
        total={count}
        columns={columns}
        dataSource={dataSource}
        loading={loading}
      />
    );
  }

  render(): React.Node {
    const {
      children,
      form: { getFieldDecorator },
    } = this.props;
    return (
      children || (
        <div>
          <div className={styles.logsHeader}>
            <FormattedMessage defaultMessage={'导入时间'} />
            {getFieldDecorator('time', {
              // initialValue: [daysAgo(30), moment()],
            })(<RangePicker showTime format="YYYY-MM-DD" />)}
            <Button
              icon="search"
              onClick={() => {
                this.fetchData({
                  page: 1,
                  size: 10,
                });
              }}
            >
              查询
            </Button>
          </div>
          {this.renderTable()}
        </div>
      )
    );
  }
}

LogList.contextTypes = {
  router: PropTypes.Object,
};

export default withForm({}, LogList);
