import React from 'react';
import _ from 'lodash';
import moment from 'utils/time';
import { withRouter } from 'react-router-dom';
import { Link, Badge, Table, Tooltip } from 'src/components';
import { replaceSign } from 'src/constants';
import { getQuery } from 'src/routes/getRouteParams';
import { getToolingDetailUrl } from './utils';
import { TOOLING_STATUS } from './constants';

type Props = {
  data: any,
  history: any,
  match: any,
  refreshData: () => {},
};

const List = (props: Props) => {
  const { history, data = {}, refreshData, match } = props;
  const getColumns = () => {
    return [
      {
        title: '模具编号/名称',
        width: 140,
        dataIndex: 'code',
        render: (code, record) => {
          const { name } = record;
          if (!name && !code) return replaceSign;
          return <Tooltip text={`${code || replaceSign}/${name || replaceSign}`} width={140} />;
        },
      },
      {
        title: '定义编号/名称',
        width: 140,
        dataIndex: 'machiningMaterial',
        render: machiningMaterial => {
          const { name, code } = machiningMaterial;
          if (!name && !code) return replaceSign;
          return <Tooltip text={`${code || replaceSign}/${name || replaceSign}`} width={140} />;
        },
      },
      // {
      //   title: '工装类型',
      //   dataIndex: 'machiningMaterial',
      //   key: 'toolingType',
      //   width: 100,
      //   render: machiningMaterial => (machiningMaterial && machiningMaterial.toolingTypeDisplay) || replaceSign,
      // },
      {
        title: '制造商',
        dataIndex: 'manufacturer',
        width: 100,
        render: manufacturer => <Tooltip text={(manufacturer && manufacturer.name) || replaceSign} width={100} />,
      },
      {
        title: '模具型号',
        dataIndex: 'model',
        width: 140,
        render: model => <Tooltip text={model || replaceSign} width={140} />,
      },
      {
        title: '序列号',
        dataIndex: 'serialNumber',
        width: 140,
        render: serialNumber => <Tooltip text={serialNumber || replaceSign} width={140} />,
      },
      {
        title: '首次启用日期',
        dataIndex: 'firstEnableDate',
        width: 120,
        render: firstEnableDate => (
          <Tooltip
            text={(firstEnableDate && moment(firstEnableDate).format('YYYY/MM/DD')) || replaceSign}
            width={140}
          />
        ),
      },
      {
        title: '启用状态',
        width: 120,
        dataIndex: 'enableStatus',
        render: enableStatus =>
          (typeof enableStatus === 'number' && (
            <Badge.MyBadge color={TOOLING_STATUS[enableStatus].color} text={TOOLING_STATUS[enableStatus].label} />
          )) ||
          replaceSign,
      },
      {
        title: '操作',
        key: 'action',
        width: 100,
        render: (_, record) => {
          const { id } = record;
          return (
            <Link
              onClick={() => {
                history.push(getToolingDetailUrl(id));
              }}
            >
              查看
            </Link>
          );
        },
      },
    ];
  };

  const columns = getColumns();
  const query = getQuery(match);
  return (
    <div style={{ marginTop: 20 }}>
      <Table
        columns={columns}
        dataSource={data && Array.isArray(data.data) ? data.data : []}
        total={data && data.total}
        refetch={refreshData}
        pagination={{ current: (query && query.page) || 1, pageSize: (query && query.size) || 10 }}
      />
    </div>
  );
};

export default withRouter(List);
