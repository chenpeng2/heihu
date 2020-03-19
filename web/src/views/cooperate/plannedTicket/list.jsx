import React, { Component } from 'react';
import _ from 'lodash';
import auth from 'utils/auth';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { Link, Badge, withForm, Tooltip, Table, Icon } from 'src/components';
import { setLocation } from 'utils/url';
import moment, { setDayStart, setDayEnd, formatDate, formatDateTime, formatToUnix } from 'utils/time';
import { replaceSign, PLAN_TICKET_INJECTION_MOULDING, PLAN_TICKET_BAITING } from 'src/constants';
import log from 'utils/log';
import { arrayIsEmpty } from 'utils/array';
import { thousandBitSeparator } from 'utils/number';
import { getQuery } from 'src/routes/getRouteParams';
import authorityWrapper from 'src/components/authorityWrapper';
import {
  queryPlannedTicketList,
  getWorkOrdersByInjectionMoulding,
  getWorkOrderCustomProperty,
} from 'src/services/cooperate/plannedTicket';
import { error, border, warning, fontSub, primary } from 'src/styles/color';
import PurchaseListProgressModal from 'src/containers/project/base/purchaseListProgressModal';
import {
  findPlannedTicketTypes,
  savePlannedTicketFilterExecuteStatus,
  getAuditConfig,
  getPlannedTicketFilterExecuteStatus,
  saveWorkOrderFilterParams,
  getLocalFilterParams,
} from 'src/containers/plannedTicket/util';
import { getTablePageSizeFromLocalStorage } from 'utils/localStorage';
import CancelPlannedTicket from 'src/containers/plannedTicket/base/cancelPlannedTicket';
import { toInjectionMouldingWorkOrderDetail } from 'containers/plannedTicket/detail/InjectionMouldingWorkOrderDetail';
import DeletePlannedTicket from 'containers/plannedTicket/base/DeletePlannedTicket';
import WorkOrderTree from './WorkOrderTree';

import { TABLE_UNIQUE_KEY } from './utils';
import FilterForList from './filter';
import Actions from './actions';
import { toWorkOrderDetail, toEditWorkOrder } from './navigation';

const basePath = '/cooperate/plannedTicket';
const linkStyle = { marginRight: 10 };

const MyBadge = Badge.MyBadge;
const LinkWithAuth = authorityWrapper(Link);

const sortBy = {
  createdAt: 'created',
  planBeginTime: 'begin',
  planEndTime: 'end',
  code: 'code',
};

type Props = {
  form: any,
  match: any,
};

class PlannedTicketList extends Component {
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      modalVisible: false,
      dataSource: [],
      modalData: null,
      sortInfo: {},
      pagination: {},
      selectedRowKeys: [],
      selectedRows: [],
      actionType: null,
      customFields: [],
    };
  }

  componentDidMount = () => {
    this.queryCustomFields();
    this.setLastQuery();
  };

  queryCustomFields = () => {
    getWorkOrderCustomProperty({ size: 1000 })
      .then(res => {
        const customFields = _.get(res, 'data.data');
        this.setState({ customFields });
      })
      .catch(err => log.error(err));
  };

  setLastQuery = () => {
    const executeStatusInLocalStorage = getPlannedTicketFilterExecuteStatus();
    const localFilterParams = getLocalFilterParams() || {};
    const { match } = this.props;
    const lastQuery = getQuery(match);
    const { executeStatus, createdAt, planBeginTime, planEndTime, ...rest } = lastQuery;
    const value = { ...localFilterParams, ...rest };
    if (Array.isArray(createdAt) && !_.isEmpty(createdAt)) {
      value.createAt = [moment(createdAt[0]), moment(createdAt[1])];
    }
    if (Array.isArray(planBeginTime) && !_.isEmpty(planBeginTime)) {
      value.planBeginTime = [moment(planBeginTime[0]), moment(planBeginTime[1])];
    }
    if (Array.isArray(planEndTime) && !_.isEmpty(planEndTime)) {
      value.planEndTime = [moment(planEndTime[0]), moment(planEndTime[1])];
    }
    value.executeStatus = executeStatusInLocalStorage
      ? _.split(executeStatusInLocalStorage, ',').map(x => Number(x))
      : undefined;
    const filterInstanceRef = _.get(this.filter, 'wrappedInstance');
    if (filterInstanceRef && typeof filterInstanceRef.setInitialValue === 'function') {
      filterInstanceRef.setInitialValue(value);
    }
    const pageSize = getTablePageSizeFromLocalStorage(TABLE_UNIQUE_KEY);

    const { setInitialValue } = _.get(this.filterFormRef, 'wrappedInstance', {});
    if (typeof setInitialValue === 'function') {
      setInitialValue(value);
    }
    this.fetchData({ ...value, size: pageSize });
  };

  formatRangeTime = (rangeTime, showTime = false) => {
    if (Array.isArray(rangeTime) && !_.isEmpty(rangeTime)) {
      const from = rangeTime[0]
        ? showTime
          ? formatToUnix(rangeTime[0])
          : formatToUnix(setDayStart(rangeTime[0]))
        : undefined;
      const to = rangeTime[1]
        ? showTime
          ? formatToUnix(rangeTime[1])
          : formatToUnix(setDayEnd(rangeTime[1]))
        : undefined;
      return [from, to];
    }
    return [undefined, undefined];
  };

  formatData = params => {
    const {
      planEndTime,
      planBeginTime,
      createdAt,
      status,
      materialCode,
      materialType,
      plannerId,
      managerId,
      executeStatus,
      type,
      ...rest
    } = params;
    const _planBeginTime = this.formatRangeTime(planBeginTime);
    const _createdAt = this.formatRangeTime(createdAt);
    const _planEndTime = this.formatRangeTime(planEndTime);

    rest.status = status && status.length > 0 ? _.join(status, ',') : undefined;
    rest.executeStatus = executeStatus && executeStatus.length > 0 ? _.join(executeStatus, ',') : undefined;
    rest.plannerId = plannerId ? plannerId.key : undefined;
    rest.managerId = managerId ? managerId.key : undefined;
    rest.type = type === '全部' ? undefined : type;
    rest.materialCode = _.get(materialCode, 'key', undefined);
    rest.materialType = _.get(materialType, 'label', undefined);
    rest.fromAt = _createdAt[0];
    rest.toAt = _createdAt[1];
    rest.beginFromAt = _planBeginTime[0];
    rest.beginToAt = _planBeginTime[1];
    rest.endFromAt = _planEndTime[0];
    rest.endToAt = _planEndTime[1];

    return _.omitBy(rest, _.isUndefined);
  };

  fetchData = async params => {
    this.setState({ loading: true });
    const { match } = this.props;
    setLocation(this.props, p => {
      return { ...p, ...params };
    });
    const query = getQuery(match);

    const _params = this.formatData({ ...query, ...params });

    // 保存列表页筛选的执行状态
    savePlannedTicketFilterExecuteStatus(_params && _params.executeStatus);
    // 保存列表页上次筛选过的自定义字段
    saveWorkOrderFilterParams({ fieldName: _params && _params.fieldName });

    await queryPlannedTicketList(_params)
      .then(({ data: { data, count } }) => {
        this.setState({
          pagination: {
            current: _params && _params.page,
            total: count,
            pageSize: (_params && _params.size) || 10,
          },
          dataSource:
            data &&
            data.map(node => ({
              ...node,
              children: node.subs && [],
            })),
        });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  getPlanStatus = status => {
    switch (status) {
      case 1:
        return '新建';
      case 2:
        return '已排程';
      case 3:
        return '已下发';
      case 4:
        return '已取消';
      case 5:
        return '审批中';
      case 6:
        return '已审批';
      default:
        return replaceSign;
    }
  };

  renderAuditRemarks = record => {
    const { auditProcessDTO, status } = record;
    const { auditors } = auditProcessDTO || {};
    // 全部审批通过时才显示「审批备注」
    if (Number(status) !== 6) return replaceSign;

    if (auditors && auditors.length > 0) {
      let remarks = '';
      auditors.forEach(({ remark, name }) => {
        if (remark) {
          remarks = `${remarks}${remark}(${name});`;
        }
      });
      return remarks === '' ? replaceSign : remarks;
    }
  };

  getExecuteStatus = status => {
    switch (status) {
      case 1:
        return <MyBadge text={'未开始'} color={border} />;
      case 2:
        return <MyBadge text={'进行中'} color={primary} />;
      case 3:
        return <MyBadge text={'暂停中'} color={warning} />;
      case 4:
        return <MyBadge text={'已结束'} color={error} />;
      case 5:
        return <MyBadge text={'已取消'} color={fontSub} />;
      default:
        return replaceSign;
    }
  };

  getColumns = sortInfo => {
    const filterForm = _.get(this.filterFormRef, 'wrappedInstance.props.form');
    const { changeChineseToLocale } = this.context;
    const { customFields } = this.state;
    const workOrderAuditConfig = getAuditConfig('workOrderAudit');
    const workOrderBaitingConfig = getAuditConfig('baitingWorkOrder');
    const customFieldsColumns = !arrayIsEmpty(customFields)
      ? customFields.map(({ name }, i) => ({
          title: name,
          dataIndex: `fieldDO[${i}]`,
          key: `fieldDO[${i}]`,
          width: 120,
          render: (data, record) => (!_.isEmpty(data) ? data.customFieldContent : replaceSign),
        }))
      : [];
    const productTooltip = (
      <Tooltip
        title={
          <div style={{ padding: 10 }}>
            <div style={{ color: 'black', fontSize: 14, marginBottom: 8 }}>{changeChineseToLocale('产出物料')}</div>
            <div style={{ color: 'rgba(0, 0, 0, 0.4)' }}>
              {changeChineseToLocale('若为「下料」计划工单，此列展示的内容为「投入物料」。')}
            </div>
          </div>
        }
      >
        <Icon type="exclamation-circle-o" color={'rgba(0, 0, 0, 0.4)'} />
      </Tooltip>
    );
    const amountTooltip = (
      <Tooltip
        title={
          <div style={{ padding: 10 }}>
            <div style={{ color: 'black', fontSize: 14, marginBottom: 8 }}>{changeChineseToLocale('数量')}</div>
            <div>{changeChineseToLocale('若为「下料」计划工单，此列展示的内容为「投入物料的数量」。')}</div>
          </div>
        }
      >
        <Icon type="exclamation-circle-o" color={'rgba(0, 0, 0, 0.4)'} />
      </Tooltip>
    );
    const productTitle =
      workOrderBaitingConfig === 'true' ? (
        <div>
          <span style={{ marginRight: 6 }}>{changeChineseToLocale('产出物料')}</span>
          {productTooltip}
        </div>
      ) : (
        '产出物料'
      );
    const amountAndUnit =
      workOrderBaitingConfig === 'true' ? (
        <div>
          <span style={{ marginRight: 6 }}>{changeChineseToLocale('数量')}</span>
          {amountTooltip}
        </div>
      ) : (
        '数量'
      );
    return [
      {
        title: '工单类型',
        dataIndex: 'type',
        fixed: 'left',
        width: 150,
        render: data => {
          const typeValue = findPlannedTicketTypes(data);

          return <span>{typeValue ? typeValue.name : replaceSign}</span>;
        },
      },
      {
        title: '工单编号',
        dataIndex: 'code',
        fixed: 'left',
        width: 170,
        sorter: true,
        sortOrder: sortInfo.columnKey === 'code' && sortInfo.order,
        render: (text, record) => {
          const { category } = record;
          if (Number(category) === 2) {
            return (
              <div>
                {text}
                <div
                  style={{
                    display: 'inline-block',
                    color: primary,
                    border: `1px solid ${primary}`,
                    borderRadius: '50%',
                    width: 18,
                    height: 18,
                    textAlign: 'center',
                    marginLeft: 2,
                    transform: 'scale(0.85)',
                  }}
                >
                  下
                </div>
              </div>
            );
          }
          return text || replaceSign;
        },
      },
      {
        title: '工单层级',
        dataIndex: 'level',
        fixed: 'left',
        width: 150,
        render: (level, { code, status, category, isChild }) => {
          if (category === PLAN_TICKET_INJECTION_MOULDING || isChild) {
            return replaceSign;
          }
          return <WorkOrderTree code={code} status={status} level={level} category={category} /> || replaceSign;
        },
      },
      {
        title: '订单编号',
        dataIndex: 'purchaseOrderCode',
        width: 150,
        render: (text, record) =>
          text ? (
            <Link onClick={() => window.open(`/cooperate/purchaseOrders/${record.purchaseOrderId}/detail`, '_blank')}>
              {text}
            </Link>
          ) : (
            replaceSign
          ),
      },
      {
        title: productTitle,
        key: 'inMaterial',
        width: 200,
        render: record => {
          const { materialCode, materialName, category, inMaterial, subs } = record;
          if (Number(category) === 2) {
            const { code, name } = inMaterial && inMaterial[0];
            return `${code || replaceSign}/${name || replaceSign}`;
          }
          if (category === PLAN_TICKET_INJECTION_MOULDING) {
            return arrayIsEmpty(subs) ? replaceSign : subs.map(({ code, name }) => `${code}/${name}`).join(',');
          }
          return `${materialCode || replaceSign}/${materialName || replaceSign}`;
        },
      },
      {
        title: '产出物料类型',
        dataIndex: 'materialTypes',
        width: 200,
        render: (types, record) => {
          if (Array.isArray(types) && types.length > 0) {
            return _.join(types, '，');
          }
          return replaceSign;
        },
      },
      {
        title: amountAndUnit,
        dataIndex: 'amount',
        width: 130,
        render: (text, record) => {
          const { category, inMaterial, materialUnit, subs } = record;
          if (Number(category) === 2) {
            const { totalAmount, unitName } = inMaterial && inMaterial[0];
            return `${thousandBitSeparator(totalAmount)}${unitName || replaceSign}`;
          }
          if (Number(category) === PLAN_TICKET_INJECTION_MOULDING) {
            return arrayIsEmpty(subs)
              ? replaceSign
              : subs.map(({ amount, unitName = replaceSign }) => `${amount} ${unitName}`).join(',');
          }
          return !_.isUndefined(text) ? `${thousandBitSeparator(text)}${materialUnit || replaceSign}` : replaceSign;
        },
      },
      {
        title: '已生产数量',
        dataIndex: 'amountCompleted',
        key: 'amountCompleted',
        width: 100,
        align: 'right',
        hidden: [PLAN_TICKET_INJECTION_MOULDING, PLAN_TICKET_BAITING].includes(
          filterForm && filterForm.getFieldValue('category'),
        ),
        render: (text, record) => {
          const amount = Number(text);
          return typeof amount === 'number' ? thousandBitSeparator(amount) : replaceSign;
        },
      },
      {
        title: '成品批次',
        dataIndex: 'productBatch',
        width: 130,
        render: (text, record) => {
          const { productBatchType } = record;
          if (productBatchType === 2) return replaceSign;
          return text || replaceSign;
        },
      },
      {
        title: '计划员',
        dataIndex: 'planners',
        width: 170,
        render: data => (Array.isArray(data) ? data.join(',') : replaceSign),
      },
      {
        title: '生产主管',
        dataIndex: 'managers',
        width: 170,
        render: data => (Array.isArray(data) ? data.join(',') : replaceSign),
      },
      {
        title: '计划状态',
        dataIndex: 'status',
        width: 120,
        render: text => this.getPlanStatus(text),
      },
      {
        title: '创建时间',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 160,
        sorter: true,
        sortOrder: sortInfo.columnKey === 'createdAt' && sortInfo.order,
        render: text => (text ? formatDateTime(text) : replaceSign),
      },
      {
        title: '执行状态',
        dataIndex: 'executeStatus',
        width: 120,
        render: text => this.getExecuteStatus(text),
      },
      {
        title: '计划开始时间',
        dataIndex: 'planBeginTime',
        width: 150,
        sorter: true,
        sortOrder: sortInfo.columnKey === 'planBeginTime' && sortInfo.order,
        render: text => (text ? formatDate(text) : replaceSign),
      },
      {
        title: '计划结束时间',
        dataIndex: 'planEndTime',
        width: 150,
        sorter: true,
        sortOrder: sortInfo.columnKey === 'planEndTime' && sortInfo.order,
        render: text => (text ? formatDate(text) : replaceSign),
      },
      {
        title: '订单备注',
        dataIndex: 'purchaseOrderRemark',
        width: 200,
        render: text => text || replaceSign,
      },
      workOrderAuditConfig === 'true'
        ? {
            title: '审批备注',
            dataIndex: 'auditProcessDTO',
            width: 330,
            render: (data, record) => this.renderAuditRemarks(record),
          }
        : undefined,
      {
        title: '备注',
        dataIndex: 'remark',
        width: 200,
        render: text => text || replaceSign,
      },
      ...customFieldsColumns,
      {
        title: '操作',
        width: 150,
        key: 'action',
        fixed: 'right',
        render: record => {
          const workOrderAuditConfig = getAuditConfig('workOrderAudit');
          const { status, code, needAudit, category, isChild } = record;
          const detailPath = toWorkOrderDetail({
            ...record,
            isInjectionMouldingChild: record.isChild,
          });
          const editPath = toEditWorkOrder(record);
          const editDisabled =
            workOrderAuditConfig === 'true' && needAudit
              ? [1].indexOf(status) === -1
              : [1, 2, 3].indexOf(status) === -1;
          const cancelDisabled =
            workOrderAuditConfig === 'true' ? [1].indexOf(status) === -1 : [1, 2].indexOf(status) === -1;

          return (
            <div>
              <LinkWithAuth auth={auth.WEB_VIEW_PLAN_WORK_ORDER} to={detailPath} style={linkStyle}>
                查看
              </LinkWithAuth>
              {workOrderAuditConfig !== 'true' && status === 4
                ? null
                : !isChild && (
                    <LinkWithAuth
                      disabled={editDisabled}
                      auth={auth.WEB_EDIT_PLAN_WORK_ORDER}
                      to={editPath}
                      style={linkStyle}
                    >
                      编辑
                    </LinkWithAuth>
                  )}
              {workOrderAuditConfig !== 'true' && [1, 2].indexOf(status) === -1
                ? null
                : !isChild && (
                    <CancelPlannedTicket
                      disabled={cancelDisabled}
                      fetchData={this.fetchData}
                      code={code}
                      category={category}
                    />
                  )}
              {!isChild && (
                <DeletePlannedTicket
                  category={category}
                  code={code}
                  status={status}
                  deleteCallback={this.fetchData}
                  icon={null}
                />
              )}
            </div>
          );
        },
      },
    ]
      .filter(n => n)
      .filter(c => c && !c.hidden);
  };

  renderPurchaseProgressModal = () => {
    const { modalVisible, modalData } = this.state;

    return (
      <PurchaseListProgressModal
        onVisibleChange={visible => {
          this.setState({ modalVisible: visible });
        }}
        data={modalData}
        visible={modalVisible}
      />
    );
  };

  handleTableChange = (pagination, filters, sorter) => {
    if (sorter && sorter.columnKey) {
      const { order } = sorter;
      this.setState({ sortInfo: sorter });
      this.fetchData({
        sortBy: sortBy[sorter.columnKey],
        page: pagination && pagination.current,
        order: order === 'ascend' ? 'ASC' : 'DESC',
        size: (pagination && pagination.pageSize) || 10,
      });
    } else {
      this.fetchData({
        page: pagination && pagination.current,
        size: (pagination && pagination.pageSize) || 10,
      });
    }
  };

  renderRowSelection = type => {
    const { selectedRowKeys } = this.state;

    if (!type) return null;

    if (type === 'audit') {
      return {
        selectedRowKeys,
        getCheckboxProps: record => ({
          disabled: record.status !== 1 || record.needAudit === 0 || record.parentCode,
        }),
        onChange: (selectedRowKeys, selectedRows) => {
          const { selectedRows: _selectedRows, dataSource } = this.state;
          const newSelectedRows = _.pullAllBy(_selectedRows, dataSource, 'id').concat(selectedRows);
          this.setState({ selectedRowKeys, selectedRows: newSelectedRows });
        },
      };
    }
  };

  handleExpand = async (expanded, record) => {
    const {
      data: { data },
    } = await getWorkOrdersByInjectionMoulding(record.code);
    record.children = data.map(node => ({
      ...node,
      category: 1,
      isChild: true,
    }));
    this.forceUpdate();
  };

  render() {
    const { loading, dataSource, sortInfo, pagination, selectedRows, actionType, customFields } = this.state;
    const columns = this.getColumns(sortInfo);

    return (
      <div>
        <FilterForList
          customFields={customFields}
          wrappedComponentRef={e => (this.filterFormRef = e)}
          fetchData={this.fetchData}
        />
        <Actions
          refetch={this.fetchData}
          selectedRows={selectedRows}
          onBulkActionChange={actionType => this.setState({ actionType, selectedRowKeys: [], selectedRows: [] })}
        />
        <Table
          tableUniqueKey={TABLE_UNIQUE_KEY}
          useColumnConfig
          loading={loading}
          dataSource={dataSource}
          columns={columns}
          rowSelection={this.renderRowSelection(actionType)}
          rowKey={record => record.code}
          bordered
          dragable
          pagination={pagination}
          onChange={this.handleTableChange}
          onExpand={this.handleExpand}
        />
      </div>
    );
  }
}

PlannedTicketList.contextTypes = {
  router: PropTypes.object,
  changeChineseToLocale: () => {},
};

export default withRouter(PlannedTicketList);
