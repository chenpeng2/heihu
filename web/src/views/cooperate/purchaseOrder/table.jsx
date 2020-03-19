import React, { Component } from 'react';
import _ from 'lodash';

import { Tooltip, Badge, Attachment, Link, OpenModal, Popover } from 'src/components';
import Table from 'components/table/basicTable';
import moment, { formatDate } from 'src/utils/time';
import { error, primary } from 'styles/color';
import { replaceSign } from 'src/constants';
import { stringEllipsis } from 'src/utils/string';
import { getAttachments } from 'src/services/attachment';
import { arrayIsEmpty } from 'utils/array';
import {
  getOrganizationConfigFromLocalStorage,
  ORGANIZATION_CONFIG,
  TASK_DISPATCH_TYPE,
} from 'src/utils/organizationConfig';

import { TABLE_UNIQUE_KEY } from './constants';
import LinkToEditPurchaseOrder from './base/linkToEditPurchaseOrder';
import LinkToPurchaseOrderDetail from './base/linkToPurchaseOrderDetail';
import DeletePurchaseOrder from './base/deletePurchaseOrder';
import FinishPurchaseOrder from './base/finishPurchaseOrder';
import { toProjectDetail } from '../project/navigation';
import { toWorkOrderDetail } from '../plannedTicket/navigation';

const AttachmentImageView = Attachment.ImageView;
const MyBadge = Badge.MyBadge;
const hoverTableStyle = { width: 300, margin: 0 };
const hoverStyle = { cursor: 'pointer' };

type Props = {
  style: {},
  fetchData: () => {},
  data: [],
  loading: boolean,
  pagination: {},
};

type CodesLinkTablePropTypes = {
  taskDispatchType: String,
  data: Array<Object>,
};

export function CodesLinkTable(props: CodesLinkTablePropTypes) {
  const { config, data } = props || {};
  const columns = [
    {
      ...config,
      render: (data, record, index) =>
        data ? <Link.NewTagLink href={record.href}>{data}</Link.NewTagLink> : replaceSign,
    },
  ];
  return <Table scroll={{ y: 250 }} style={hoverTableStyle} pagination={false} dataSource={data} columns={columns} />;
}

class PurchaseOrderTable extends Component {
  props: Props;
  state = {
    taskDispatchType: null,
    sortInfo: {},
  };

  componentWillMount() {
    this.setTaskDispatchType();
  }

  setTaskDispatchType = () => {
    // 获取物料请求类型工厂配置
    const getTaskDispatchConfig = () => {
      const config = getOrganizationConfigFromLocalStorage();

      return config && config[ORGANIZATION_CONFIG.taskDispatchType]
        ? config[ORGANIZATION_CONFIG.taskDispatchType].configValue
        : null;
    };

    const taskDispatchType = getTaskDispatchConfig();

    this.setState({ taskDispatchType });
  };

  fetchAttachmentsData = async ids => {
    const {
      data: { data },
    } = await getAttachments(ids);
    return data.map(x => {
      x.originalFileName = x.original_filename;
      x.originalExtension = x.original_extension;
      return x;
    });
  };

  getColumns = sortInfo => {
    const { fetchData } = this.props;
    const { taskDispatchType } = this.state;

    const columns = [
      {
        title: '订单号',
        dataIndex: 'purchaseOrderCode',
        width: 130,
        sorter: true,
        sortOrder: sortInfo.columnKey === 'purchaseOrderCode' && sortInfo.order,
        render: data => data || replaceSign,
      },
      {
        title: '创建时间',
        dataIndex: 'createdAt',
        width: 120,
        sorter: true,
        sortOrder: sortInfo.columnKey === 'createdAt' && sortInfo.order,
        render: data => (data ? moment(data).format('YYYY/MM/DD HH:mm:ss') : replaceSign),
      },
      {
        title: '更新时间',
        dataIndex: 'updatedAt',
        width: 120,
        sorter: true,
        sortOrder: sortInfo.columnKey === 'updatedAt' && sortInfo.order,
        render: data => (data ? moment(data).format('YYYY/MM/DD HH:mm:ss') : replaceSign),
      },
      {
        title: '物料',
        dataIndex: 'materialList',
        width: 250,
        render: data => {
          if (!Array.isArray(data) || !data.length) return replaceSign;

          return data
            .map(({ materialCode, materialName, amount, unitName }) => {
              return `${materialCode}: ${materialName} x ${amount} ${unitName}`;
            })
            .join(',');
        },
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: 100,
        render: data => {
          const { display, value } = data || {};
          return display ? <MyBadge text={display} color={value ? primary : error} /> : replaceSign;
        },
      },
      {
        title: '客户',
        dataIndex: 'customer.name',
        width: 150,
        render: name => {
          return name || replaceSign;
        },
      },
      {
        title: '附件',
        dataIndex: 'attachments',
        width: 80,
        render: data => {
          if (Array.isArray(data) && data.length) {
            return (
              <Link
                icon="paper-clip"
                onClick={async () => {
                  const files = await this.fetchAttachmentsData(data);
                  OpenModal({
                    title: '附件',
                    footer: null,
                    children: (
                      <AttachmentImageView
                        attachment={{
                          files,
                        }}
                      />
                    ),
                  });
                }}
              >
                {data.length}
              </Link>
            );
          }
          return replaceSign;
        },
      },
      {
        title: '操作',
        fixed: 'right',
        key: 'action',
        width: 200,
        render: (data, record) => {
          const { id } = record;
          const status = _.get(record, 'status.value');

          return (
            <div>
              <LinkToPurchaseOrderDetail code={id} />
              {status ? (
                <React.Fragment>
                  <LinkToEditPurchaseOrder code={id} />
                  <FinishPurchaseOrder
                    style={{ marginRight: 10 }}
                    page="list"
                    code={id}
                    data={record}
                    refetch={fetchData}
                  />
                  <DeletePurchaseOrder code={id} data={record} fetchData={fetchData} />
                </React.Fragment>
              ) : null}
            </div>
          );
        },
      },
    ];

    const workOrderColumn = {
      title: '计划工单',
      dataIndex: 'workOrderCodes',
      width: 220,
      render: data => {
        if (arrayIsEmpty(data)) return replaceSign;

        const workOrders = data.map(({ code, category }) => ({
          planWorkOrderCode: code,
          href: toWorkOrderDetail({ code, category }),
        }));
        const workOrderCodes = workOrders.map(({ planWorkOrderCode }) => planWorkOrderCode).join(',');
        const config = { title: '计划工单编号', dataIndex: 'planWorkOrderCode', key: 'planWorkOrderCode' };
        const content = <CodesLinkTable config={config} data={workOrders} taskDispatchType={taskDispatchType} />;

        return (
          <Popover content={content} placement="bottomLeft" trigger="hover">
            <p style={hoverStyle}>{stringEllipsis(workOrderCodes, 23)}</p>
          </Popover>
        );
      },
    };

    const projectColumn = {
      title: '项目号',
      dataIndex: 'projects',
      width: 220,
      render: data => {
        if (arrayIsEmpty(data)) return replaceSign;

        const config = { title: '项目编号', dataIndex: 'projectCode', key: 'projectCode' };
        const projectCodes = data.map(({ projectCode }) => projectCode).join(',');
        const projects = data.map(({ projectCode }) => ({ projectCode, href: toProjectDetail({ code: projectCode }) }));
        const content = <CodesLinkTable config={config} data={projects} taskDispatchType={taskDispatchType} />;
        return (
          <Popover content={content} placement="bottomLeft" trigger="hover">
            <p style={hoverStyle}>{stringEllipsis(projectCodes, 23)}</p>
          </Popover>
        );
      },
    };

    if (taskDispatchType === TASK_DISPATCH_TYPE.manager) {
      columns.splice(5, 0, workOrderColumn, projectColumn);
    }

    if (taskDispatchType === TASK_DISPATCH_TYPE.workerWeak || taskDispatchType === TASK_DISPATCH_TYPE.worker) {
      columns.splice(5, 0, projectColumn);
    }

    return columns;
  };

  handleTableChange = (pagination, filters, sorter) => {
    if (sorter && sorter.columnKey) {
      const { order } = sorter;
      this.setState({ sortInfo: sorter });
      this.props.fetchData({
        page: pagination && pagination.current,
        order: order === 'ascend' ? 'ASC' : 'DESC',
        sortBy: sorter.columnKey,
        size: (pagination && pagination.pageSize) || 10,
      });
    } else {
      this.props.fetchData({ page: pagination && pagination.current, size: (pagination && pagination.pageSize) || 10 });
    }
  };

  render() {
    const { style, data, pagination, fetchData, loading } = this.props;
    const { sortInfo } = this.state;

    const columns = this.getColumns(sortInfo);

    return (
      <Table
        tableUniqueKey={TABLE_UNIQUE_KEY}
        useColumnConfig
        style={{ margin: 0, ...style }}
        pagination={pagination}
        dataSource={data || []}
        columns={columns}
        refetch={fetchData}
        loading={loading}
        scroll={{ x: true }}
        rowKey={record => record.id}
        onChange={this.handleTableChange}
        dragable
      />
    );
  }
}

export default PurchaseOrderTable;
