import React from 'react';

import BaseMaterialModel from 'models/cooperate/planWorkOrder/BaseMaterialModel';
import { Table, Link, Popover } from 'components';
import { replaceSign } from 'src/constants';
import { arrayIsEmpty } from 'utils/array';

import { Dimension } from './constants';
import Title from '../base/Title';
import { formatColumns } from '../util';

type ProdProgressTablePropsType = {
  dimension: String,
  data: Array<any>,
  workOrderCode: String,
};

type MaterialTablePropTypes = {
  data: Array<BaseMaterialModel>,
};

export function getMaterialTableColumns(props) {
  const columns = [
    {
      title: '物料编号/物料名称',
      dataIndex: 'materialDisplay',
      key: 'materialDisplay',
      width: 150,
      text: true,
    },
    {
      title: '规格描述',
      dataIndex: 'desc',
      key: 'desc',
      width: 100,
      text: true,
    },
    {
      title: '单位',
      dataIndex: 'unitName',
      key: 'unitName',
      width: 80,
      text: true,
    },
    {
      title: '数量',
      dataIndex: 'amount',
      key: 'amount',
      numeric: true,
    },
  ];
  return formatColumns(columns);
}

export function MaterialTable(props: MaterialTablePropTypes) {
  const { data } = props || {};

  return (
    <div>
      <Title>投入物料</Title>
      <Table
        pagination={false}
        columns={getMaterialTableColumns()}
        dataSource={data}
        scroll={{ y: 300 }}
        style={{ margin: 0, width: 500 }}
      />
    </div>
  );
}

export function getProdProgressTableColumns(props: ProdProgressTablePropsType) {
  const { dimension, workOrderCode: curWorkOrderCode } = props || {};
  let columns = [];
  if (dimension === Dimension.WORK_ORDER) {
    columns = [
      {
        title: '层级',
        dataIndex: 'workOrderLevel',
        key: 'workOrderLevel',
        width: 60,
      },
      {
        title: '工单编号',
        dataIndex: 'workOrderCode',
        key: 'workOrderCode',
        width: 160,
        render: (data, record) => {
          if (!data) return replaceSign;
          const link = (
            <Link.NewTagLink href={`/cooperate/plannedTicket/detail/${encodeURIComponent(data)}`}>
              {data}
            </Link.NewTagLink>
          );
          return data !== curWorkOrderCode ? link : data;
        },
      },
      {
        title: '产出物料',
        dataIndex: 'outputMaterial.materialDisplay',
        key: 'outputMaterial.materialDisplay',
        width: 180,
        text: true,
        length: 25,
      },
      {
        title: '规格描述',
        dataIndex: 'outputMaterial.desc',
        key: 'outputMaterial.desc',
        width: 130,
        text: true,
      },
      {
        title: '单位',
        dataIndex: 'outputMaterial.unitName',
        key: 'outputMaterial.unitName',
        width: 80,
        text: true,
      },
      {
        title: '计划产出数量',
        dataIndex: 'plannedOutputAmount',
        key: 'plannedOutputAmount',
        width: 140,
        numeric: true,
      },
      {
        title: '已排程',
        dataIndex: 'scheduledAmount',
        key: 'scheduledAmount',
        width: 140,
        numeric: true,
      },
      {
        title: '已下发',
        dataIndex: 'distributedAmount',
        key: 'distributedAmount',
        width: 140,
        numeric: true,
      },
      {
        title: '已生产',
        dataIndex: 'producedAmount',
        key: 'producedAmount',
        width: 140,
        numeric: true,
      },
    ];
  } else {
    columns = [
      {
        title: '层级',
        dataIndex: 'workOrderLevel',
        key: 'workOrderLevel',
        width: 60,
        text: true,
      },
      {
        title: '工单编号',
        dataIndex: 'workOrderCode',
        key: 'workOrderCode',
        width: 160,
        length: 22,
        render: (data, record) => {
          if (!data) return replaceSign;
          const link = (
            <Link.NewTagLink href={`/cooperate/plannedTicket/detail/${encodeURIComponent(data)}`}>
              {data}
            </Link.NewTagLink>
          );
          return data !== curWorkOrderCode ? link : data;
        },
      },
      {
        title: '工序序号/名称',
        dataIndex: 'processSeqAndName',
        key: 'processSeqAndName',
        width: 150,
        text: true,
        render: (data, record) => data || replaceSign,
      },
      {
        title: '投入物料',
        dataIndex: 'inputMaterial',
        key: 'inputMaterial',
        width: 100,
        render: (data, record) => {
          if (!data || arrayIsEmpty(data)) return replaceSign;
          return (
            <Popover
              title={null}
              getPopupContainer={() => document.getElementById('prod_progress_table')}
              content={<MaterialTable data={data} />}
              placement="bottom"
              trigger="click"
            >
              <Link>查看</Link>
            </Popover>
          );
        },
      },
      {
        title: '产出物料',
        dataIndex: 'outputMaterial.materialDisplay',
        key: 'outputMaterial.materialDisplay',
        width: 150,
        text: true,
      },
      {
        title: '规格描述',
        dataIndex: 'outputMaterial.desc',
        key: 'outputMaterial.desc',
        width: 130,
        text: true,
      },
      {
        title: '单位',
        dataIndex: 'outputMaterial.unitName',
        key: 'outputMaterial.unitName',
        width: 80,
        text: true,
      },
      {
        title: '计划产出数量',
        dataIndex: 'plannedOutputAmount',
        key: 'plannedOutputAmount',
        width: 140,
        numeric: true,
      },
      {
        title: '已排程',
        dataIndex: 'scheduledAmount',
        key: 'scheduledAmount',
        width: 140,
        numeric: true,
      },
      {
        title: '已下发',
        dataIndex: 'distributedAmount',
        key: 'distributedAmount',
        width: 140,
        numeric: true,
      },
      {
        title: '已生产',
        dataIndex: 'producedAmount',
        key: 'producedAmount',
        width: 140,
        numeric: true,
      },
    ];
  }
  return formatColumns(columns);
}

export default function ProdProgressTable(props: ProdProgressTablePropsType) {
  const { data } = props || {};

  return (
    <Table
      id="prod_progress_table"
      style={{ margin: 0 }}
      dataSource={data}
      columns={getProdProgressTableColumns(props)}
      pagination={false}
      scroll={{ y: 480 }}
    />
  );
}
