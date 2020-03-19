import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { formatUnix, daysAgo, setDayStart, setDayEnd } from 'utils/time';
import { arrayIsEmpty } from 'utils/array';
import { Table, Link, Button, Badge, DatePicker, withForm, FormItem, Spin } from 'components';
import { getQuery } from 'src/routes/getRouteParams';
import { getToolingImportLogList } from 'src/services/equipmentMaintenance/base';
import { getToolingImportLogDetailUrl } from '../utils';
import styles from './styles.scss';

const { RangePicker } = DatePicker;

type Props = {
  form: any,
  match: any,
  history: any,
};

const ToolingImportLog = (props: Props) => {
  const {
    form: { getFieldDecorator },
    match,
    history,
  } = props;
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  const getColumns = () => {
    const columns = [
      {
        title: '导入时间',
        dataIndex: 'createdAt',
        render: text => formatUnix(text),
      },
      {
        title: '导入用户',
        dataIndex: 'userName',
      },
      {
        title: '导入结果',
        dataIndex: 'status',
        render: status => {
          if (status === 0) {
            return <Badge status="error" text={'导入失败'} />;
          } else if (status === 1) {
            return <Badge status="success" text={'导入成功'} />;
          }
          return <Badge status="warning" text={'部分导入成功'} />;
        },
      },
      {
        title: '导入详情',
        key: 'detail',
        render: (data, record) => (
          <div>
            模具导入完成！成功数：{record.successAmount}，失败数：{record.failureAmount}。
          </div>
        ),
      },
      {
        title: '操作',
        key: 'operation',
        render: (data, record) => (
          <div key={`code-${record.id}`}>
            <Link
              style={{ marginRight: 20 }}
              onClick={() => {
                history.push(getToolingImportLogDetailUrl(record.importId));
              }}
            >
              查看
            </Link>
          </div>
        ),
      },
    ];
    return columns;
  };

  const fetchData = async values => {
    setLoading(true);
    const { dateRange } = values;
    const params = {};
    if (!arrayIsEmpty(dateRange)) {
      params.createdAtFrom = Date.parse(dateRange[0]);
      params.createdAtTill = Date.parse(dateRange[1]);
    }
    getToolingImportLogList(params)
      .then(res => {
        setData(_.get(res, 'data'));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    const query = getQuery(match);
    fetchData(query);
  }, []);

  const columns = getColumns();
  const query = getQuery(match);

  return (
    <div id="device_importhistory">
      <div className={styles.searchHeader}>
        <FormItem label="导入时间">
          {getFieldDecorator('dateRange', {
            initialValue: [setDayStart(daysAgo(30)), setDayEnd(daysAgo(0))],
          })(<RangePicker />)}
        </FormItem>
        <Button
          icon="search"
          style={{ width: 86 }}
          onClick={() => {
            const { dateRange } = this.state;
            const params = { page: 1, size: 10, fromAt: dateRange[0], toAt: dateRange[1] };
            this.fetchData(params);
          }}
        >
          查询
        </Button>
      </div>
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={!arrayIsEmpty(data.data) ? data.data : []}
          total={data && data.total}
          refetch={fetchData}
          pagination={{ current: (query && query.page) || 1, pageSize: (query && query.size) || 10 }}
        />
      </Spin>
    </div>
  );
};

export default withForm({}, ToolingImportLog);
