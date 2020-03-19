import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import { Spin, Table, Tooltip, DetailPageItemContainer } from 'src/components';
import { getQuery } from 'src/routes/getRouteParams';
import { arrayIsEmpty } from 'utils/array';
import { formatUnixMoment } from 'utils/time';
import { replaceSign } from 'constants';
import styles from './styles.scss';

type Props = {
  code: String,
  match: any,
  data: any,
  loading: Boolean,
  fetchData: () => {},
};

const ToolingLog = (props: Props) => {
  const { match, loading, data, fetchData } = props;

  const getLogColumns = () => [
    {
      title: '时间',
      dataIndex: 'createdAt',
      width: 200,
      render: time => formatUnixMoment(time).format('YYYY-MM-DD HH:mm:ss'),
    },
    { title: '日志类型', width: 200, dataIndex: 'logTypeDisplay' },
    { title: '操作人', width: 200, dataIndex: 'operatorName' },
    {
      title: '描述',
      dataIndex: 'description',
      render: data => <Tooltip text={data || replaceSign} length={40} />,
    },
  ];

  const columns = getLogColumns();
  const query = getQuery(match);
  const itemHeaderTitle = '模具日志';
  return (
    <Spin spinning={loading}>
      <div className={styles.itemContainerStyle}>
        <DetailPageItemContainer itemHeaderTitle={itemHeaderTitle}>
          <div style={{ marginBottom: 60, width: '100%' }}>
            <Table
              columns={columns}
              dataSource={data && !arrayIsEmpty(data.data) ? data.data : []}
              total={data && data.total}
              refetch={fetchData}
              pagination={{ current: (query && query.page) || 1, pageSize: (query && query.size) || 10 }}
            />
          </div>
        </DetailPageItemContainer>
      </div>
    </Spin>
  );
};

export default withRouter(ToolingLog);
