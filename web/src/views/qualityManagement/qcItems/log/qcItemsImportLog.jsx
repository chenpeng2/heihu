import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { formatUnix, daysAgo, setDayStart, setDayEnd } from 'utils/time';
import { arrayIsEmpty } from 'utils/array';
import { Table, Link, Button, Badge, DatePicker, withForm, FormItem, Spin, Text } from 'components';
import { getQuery } from 'src/routes/getRouteParams';
import { queryQcItemsImportLogs } from 'src/services/knowledgeBase/qcItems';
import { setLocation } from 'utils/url';
import { getQcCheckItemImportLogDetailUrl } from '../utils';
import styles from './styles.scss';

const { RangePicker } = DatePicker;
const initialDate = [setDayStart(daysAgo(30)), setDayEnd(daysAgo(0))];

type Props = {
  form: any,
  match: any,
  history: any,
};

const ImportLog = (props: Props) => {
  const {
    form: { getFieldDecorator, getFieldValue },
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
        width: 210,
        render: text => formatUnix(text),
      },
      {
        title: '导入用户',
        dataIndex: 'operatorName',
        width: 210,
      },
      {
        title: '导入结果',
        dataIndex: 'mystatusDisplay',
        width: 160,
        render: (data, record) => {
          const { mystatus } = record;
          if (mystatus === 2) {
            return <Badge status="error" text={data} />;
          } else if (mystatus === 0) {
            return <Badge status="success" text={data} />;
          }
          return <Badge status="warning" text={data} />;
        },
      },
      {
        title: '导入详情',
        dataIndex: 'detail',
        render: (text, record) => (
          <Text
            templateParams={{
              name: '质检项',
              amountSuccess: record.successAmount,
              amountFailed: record.failureAmount,
            }}
          >
            {'质检项导入完成！成功数：{amountSuccess}，失败数：{amountFailed}'}
          </Text>
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
                history.push(getQcCheckItemImportLogDetailUrl(record.importId));
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
    setLocation(props, p => ({ ...p, ...values }));
    const { dateRange } = values;
    if (!arrayIsEmpty(dateRange)) {
      values.fromAt = Date.parse(dateRange[0]);
      values.toAt = Date.parse(dateRange[1]);
      delete values.dateRange;
    }
    queryQcItemsImportLogs(values)
      .then(res => {
        setData(_.get(res, 'data'));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    const query = getQuery(match) || {};
    if (!query.dateRange) {
      query.dateRange = initialDate;
    }
    fetchData(query);
  }, []);

  const columns = getColumns();
  const query = getQuery(match);

  return (
    <div id="device_importhistory">
      <div className={styles.searchHeader}>
        <FormItem label="导入时间">
          {getFieldDecorator('dateRange', {
            initialValue: initialDate,
          })(<RangePicker />)}
        </FormItem>
        <Button
          icon="search"
          style={{ width: 86 }}
          onClick={() => {
            const dateRange = getFieldValue('dateRange');
            const params = { page: 1, size: 10, dateRange };
            fetchData(params);
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

export default withForm({}, ImportLog);
