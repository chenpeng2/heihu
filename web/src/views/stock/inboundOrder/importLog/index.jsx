import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { formatUnix, daysAgo, setDayStart, setDayEnd } from 'utils/time';
import { arrayIsEmpty } from 'utils/array';
import { Table, Link, Button, Badge, DatePicker, withForm, FormItem, Spin } from 'components';
import { getQuery } from 'src/routes/getRouteParams';
import { getInboundOrderImportList } from 'src/services/stock/inboundOrder';
import { setLocation } from 'utils/url';
import { getInboundOrderImportLogDetailUrl } from '../utils';
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
        dataIndex: 'createAt',
        width: 210,
        render: text => formatUnix(text),
      },
      {
        title: '导入用户',
        dataIndex: 'userName',
        width: 210,
      },
      {
        title: '导入结果',
        key: 'result',
        width: 160,
        render: data => {
          const { successAmount, failureAmount } = data || {};
          if (successAmount === 0) {
            return <Badge status="error" text={'导入失败'} />;
          } else if (failureAmount === 0) {
            return <Badge status="success" text={'导入成功'} />;
          }
          return <Badge status="warning" text={'部分成功'} />;
        },
      },
      {
        title: '导入详情',
        dataIndex: 'detail',
        render: (text, record) => (
          <div>
            物料导入完成！成功数：
            {record.successAmount}
            ，失败数：
            {record.failureAmount}。
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
                history.push(getInboundOrderImportLogDetailUrl(record.importId));
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
    const { dateRange } = values || {};
    if (!arrayIsEmpty(dateRange)) {
      values.dateStart = Date.parse(dateRange[0]);
      values.dateEnd = Date.parse(dateRange[1]);
      delete values.dateRange;
    }
    getInboundOrderImportList(values)
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
