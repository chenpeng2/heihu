import React from 'react';
import { Link, Table } from 'components';
import { arrayIsEmpty } from 'utils/array';

const EffectStandardCapacitys = props => {
  const { dataSource } = props;
  if (arrayIsEmpty(dataSource)) {
    return null;
  }
  const columns = [
    {
      title: '标准产能编号',
      key: 'code',
      dataIndex: 'code',
      render: code => (
        <Link.NewTagLink href={`/knowledgeManagement/productivityStandards/${code}/detail`}>{code}</Link.NewTagLink>
      ),
    },
    {
      title: '工序',
      key: 'processCode',
      dataIndex: 'processCode',
    },
  ];
  return (
    <div>
      <p style={{ margin: '10px 0' }}>以下标准产能使用了此工艺路线,若工序序号变更,需要手动更新:</p>
      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={false}
        style={{ margin: 0 }}
        total={dataSource && dataSource.length}
      />
    </div>
  );
};

export default EffectStandardCapacitys;
