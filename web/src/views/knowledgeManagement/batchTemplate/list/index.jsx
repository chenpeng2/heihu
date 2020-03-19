import React, { useState, useEffect } from 'react';
import { Table, Button, Link } from 'components';
import { getBatchTemplateList } from 'services/process';
import { getTablePageSizeFromLocalStorage } from 'utils/localStorage';

const tableUniqueKey = 'batchTemplateList';
const List = props => {
  const [dataSource, setDataSource] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const columns = [
    { title: '批记录模板名称', dataIndex: 'templateName', width: 200 },
    { title: '批记录模板链接', dataIndex: 'templateUrl', width: 400 },
    {
      title: '操作',
      dataIndex: 'id',
      width: 100,
      render: id => <Link to={`${location.pathname}/edit/${id}`}>编辑</Link>,
    },
  ].map(({ title, ...rest }) => ({
    title,
    key: title,
    ...rest,
  }));
  const handleSearch = async params => {
    const pageSize = getTablePageSizeFromLocalStorage(tableUniqueKey);
    setLoading(true);
    const { page, size } = params || {};
    const {
      data: { data, count },
    } = await getBatchTemplateList({ page: page || 1, size: size || pageSize }).finally(() => {
      setLoading(false);
    });
    setDataSource(data);
    setPagination({
      current: page || 1,
      total: count,
      pageSize: size || pageSize,
    });
  };
  useEffect(() => {
    handleSearch({});
  }, []);
  return (
    <div>
      <Button style={{ margin: 20 }}>
        <Link to={`${location.pathname}/create`}>创建电子批记录</Link>
      </Button>
      <Table
        loading={loading}
        dragable
        columns={columns}
        dataSource={dataSource}
        pagination={pagination}
        refetch={handleSearch}
        tableUniqueKey={tableUniqueKey}
        scroll={{ x: true }}
      />
    </div>
  );
};

export default List;
