import * as React from 'react';
import PropTypes from 'prop-types';
import { SimpleTable, DatePicker, Button, Link, Badge, withForm } from 'components';
import { formatUnix, formatToUnix, formatRangeUnix, daysAgo } from 'utils/time';
import _ from 'lodash';
import { setLocation, getParams } from 'utils/url';
import moment from 'moment';
import { importProjectList } from 'src/services/cooperate/project';
import styles from '../index.scss';

const RangePicker = DatePicker.RangePicker;

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
    if (this.props.children) {
      return;
    }
    const params = _.get(getParams(), 'queryObj', {});
    const { form: { setFieldsValue } } = this.props;
    if (!params.startTime && !params.endTime) {
      setFieldsValue({ time: [daysAgo(30), moment()] });
    } else {
      setFieldsValue({ time: [formatUnix(params.startTime), formatUnix(params.endTime)] });
    }
    this.fetchData({ page: 1 });
  }

  fetchData = async params => {
    const { getFieldValue } = this.props.form;
    let createdAtFrom;
    let createdAtTill;
    if (getFieldValue('time') && getFieldValue('time').length > 0) {
      createdAtFrom = formatToUnix(getFieldValue('time')[0]);
      createdAtTill = formatToUnix(getFieldValue('time')[1]);
    }
    const _params = {
      createdAtFrom,
      createdAtTill,
      size: 10,
      ...params,
    };
    setLocation(this.props, _params);
    const { data: { data, total } } = await importProjectList(_params);
    this.setState({
      total,
      dataSource: data.map((node: any): any => ({
        key: node.importId,
        importAt: formatUnix(node.importAt),
        user: node.operatorName,
        status: node.status,
        failureAmount: node.amountFailed,
        successAmount: node.amountSuccess,
      })),
    });
  };

  renderTable(): React.Node {
    const { dataSource, total } = this.state;
    const { loading } = this.props;
    const columns = [
      {
        title: '导入时间',
        dataIndex: 'importAt',
        key: 'importAt',
        type: 'startTime',
      },
      {
        title: '导入用户',
        dataIndex: 'user',
        key: 'user',
        maxWidth: { C: 8 },
      },
      {
        title: '导入结果',
        dataIndex: 'status',
        key: 'status',
        render: ({ statusCode, display }: { value: String, display: String }, record: recordType): React.Node => {
          if (statusCode === 1) {
            return <Badge status="success" text={display} />;
          } else if (statusCode === 3) {
            return <Badge status="error" text={display} />;
          }
          return <Badge status="warning" text={display} />;
        },
        maxWidth: { C: 8 },
      },
      {
        title: '导入详情',
        dataIndex: 'detail',
        key: 'detail',
        render: (text: string, { failureAmount, successAmount }: recordType): React.Node =>
          `项目导入完成！成功数：${successAmount}，失败数：${failureAmount}`,
      },
      {
        title: '操作',
        key: 'operation',
        maxWidth: { C: 4 },
        render: (text: string, record: recordType): React.Node => (
          <Link
            onClick={() => {
              this.context.router.history.push(`/cooperate/projects/loglist/logdetail/${record.key}`);
            }}
          >
            查看
          </Link>
        ),
      },
    ];
    return (
      <SimpleTable
        pagination={{
          total,
          onChange: page => this.fetchData({ page }),
        }}
        columns={columns}
        dataSource={dataSource}
      />
    );
  }

  render(): React.Node {
    const { children, form: { getFieldDecorator, getFieldValue } } = this.props;
    return (
      children || (
        <div>
          <div className={styles.logsHeader}>
            <span>导入时间</span>
            {getFieldDecorator('time', {
              // initialValue: [daysAgo(30), moment()],
            })(<RangePicker showTime format="YYYY-MM-DD HH:mm:ss" />)}
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
