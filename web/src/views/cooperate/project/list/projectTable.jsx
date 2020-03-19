import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Table, Badge, Tooltip, Icon, Link } from 'src/components';
import { replaceSign, PROJECT_CATEGORY_INJECTION_MOULDING } from 'src/constants';
import { primary, error, blueViolet, warning, border, fontSub } from 'src/styles/color';
import { getPurchaseProgress } from 'src/services/cooperate/project';
import PurchaseListProgressModal from 'src/containers/project/base/purchaseListProgressModal';
import {
  getOrganizationConfigFromLocalStorage,
  ORGANIZATION_CONFIG,
  TASK_DISPATCH_TYPE,
} from 'src/utils/organizationConfig';
import { PROJECT_TYPES } from 'src/containers/project/constant';
import moment from 'src/utils/time';
import { thousandBitSeparator } from 'src/utils/number';
import { isSubProject } from 'src/containers/project/utils';
import Localstorage from 'utils/localStorage';
import auth from 'utils/auth';
import LinkToEditProject from 'src/containers/project/base/linkToEditProject';
import UpdateProjectStatus from 'src/containers/project/base/updateProjectStatus/updateProjectStatus';
import { arrayIsEmpty } from 'src/utils/array';
import { toInjectionMouldingProjectDetail } from '../../navigation';
import { TABLE_UNIQUE_KEY } from '../constants';
import LevelTreePop from './LevelTreePop';

const MyBadge = Badge.MyBadge;

type Props = {
  data: [],
  pagination: {},
  loading: boolean,
  refreshData: () => {},
  match: {},
  total: number,
  cbForRowSelect: () => {},
  showBatchSelect: boolean,
};

class ProjectTable extends Component {
  props: Props;
  state = {
    modalVisible: false,
    modalData: null,
    selectedRowKeys: [], // 被选中的row keys(project code)
    selectedRows: [], // 被选中的row
    sortInfo: {},
    taskDispatchType: null, // 任务派发方式
    editProjectConfig: null, // 是否可以编辑项目
  };

  componentDidMount() {
    this.getOrganizationTaskDispatchType();
    this.getOrganizationEditProjectConfig();
  }

  getOrganizationTaskDispatchType = () => {
    const config = getOrganizationConfigFromLocalStorage();
    const configValue =
      config &&
      config[ORGANIZATION_CONFIG.taskDispatchType] &&
      config[ORGANIZATION_CONFIG.taskDispatchType].configValue;

    this.setState({
      taskDispatchType: configValue,
    });
  };

  getOrganizationEditProjectConfig = () => {
    const config = getOrganizationConfigFromLocalStorage();
    const configValue =
      config && config[ORGANIZATION_CONFIG.editProject] && config[ORGANIZATION_CONFIG.editProject].configValue;

    this.setState({
      editProjectConfig: configValue,
    });
  };

  renderOperations = (status, projectData) => {
    if (!status) {
      return replaceSign;
    }

    const { router } = this.context;
    const { refreshData } = this.props;
    const { taskDispatchType, editProjectConfig } = this.state;
    const { code: statusCode } = status;
    const { projectCode, category } = projectData;
    const checkButton = () => {
      return (
        <Link
          to={
            PROJECT_CATEGORY_INJECTION_MOULDING === category
              ? toInjectionMouldingProjectDetail({ code: projectCode })
              : `/cooperate/projects/${encodeURIComponent(projectCode)}/detail`
          }
        >
          查看
        </Link>
      );
    };
    const editButton = () => {
      const _isSubProject = isSubProject(projectData);
      return <LinkToEditProject projectCode={projectCode} style={{ marginLeft: 10 }} isSubProject={_isSubProject} />;
    };

    // 注塑的子项目
    if (projectData.isInjectChild) {
      return null;
    }

    // 未开始状态可进行的操作是查看，编辑，开始，取消。
    if (statusCode === 'created' || statusCode === 'running' || statusCode === 'paused') {
      return (
        <div>
          {checkButton()}
          {taskDispatchType === TASK_DISPATCH_TYPE.manager && editProjectConfig === 'false' ? null : editButton()}
          <UpdateProjectStatus projectData={projectData} freshData={refreshData} projectCategory={category} />
        </div>
      );
    }

    // 已结束状态可进行的操作是查看。
    // 已取消状态可进行的操作是查看。
    if (statusCode === 'done' || statusCode === 'aborted') {
      return <div>{checkButton()}</div>;
    }

    return null;
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

  getColumns = () => {
    const { changeChineseToLocale } = this.context;
    const productTooltip = (
      <Tooltip
        title={
          <div style={{ padding: 10 }}>
            <div style={{ color: 'black', fontSize: 14, marginBottom: 8 }}>
              {changeChineseToLocale('投入物料／名称')}
            </div>
            <div style={{ color: 'rgba(0, 0, 0, 0.4)' }}>
              {changeChineseToLocale('若为「下料」项目，此列展示的内容为「投入物料编号／名称」。')}
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
            <div style={{ color: 'black', fontSize: 14, marginBottom: 8 }}>{changeChineseToLocale('数量／单位')}</div>
            <div style={{ color: 'rgba(0, 0, 0, 0.4)' }}>
              {changeChineseToLocale('若为「下料」项目，此列展示的内容为「投入物料的数量」。')}
            </div>
          </div>
        }
      >
        <Icon type="exclamation-circle-o" color={'rgba(0, 0, 0, 0.4)'} />
      </Tooltip>
    );
    const processTooltip = (
      <Tooltip
        title={
          <div style={{ padding: 10 }}>
            <div style={{ color: 'black', fontSize: 14, marginBottom: 8 }}>{changeChineseToLocale('进度')}</div>
            <div style={{ color: 'rgba(0, 0, 0, 0.4)' }}>
              {changeChineseToLocale('若为「下料」项目，此列展示的内容为「投入物料的使用进度」。')}
            </div>
          </div>
        }
      >
        <Icon type="exclamation-circle-o" color={'rgba(0, 0, 0, 0.4)'} />
      </Tooltip>
    );
    const { taskDispatchType, sortInfo } = this.state;
    const configs = getOrganizationConfigFromLocalStorage();
    const workOrderBaitingConfig = _.get(configs, '[config_plan_work_order_baiting].configValue');
    const productTitle =
      workOrderBaitingConfig === 'true' ? (
        <div>
          <span style={{ marginRight: 6 }}>{changeChineseToLocale('产出物料编号／名称')}</span>
          {productTooltip}
        </div>
      ) : (
        '产出物料编号／名称'
      );
    const amountAndUnit =
      workOrderBaitingConfig === 'true' ? (
        <div>
          <span style={{ marginRight: 6 }}>{changeChineseToLocale('数量／单位')}</span>
          {amountTooltip}
        </div>
      ) : (
        '数量／单位'
      );
    const progressTitle =
      workOrderBaitingConfig === 'true' ? (
        <div>
          <span style={{ marginRight: 6 }}>{changeChineseToLocale('进度')}</span>
          {processTooltip}
        </div>
      ) : (
        '进度'
      );
    return [
      {
        title: '项目类型',
        width: 140,
        dataIndex: 'type',
        render: data => {
          if (data === 1) {
            return PROJECT_TYPES.storage.name;
          }
          if (data === 2) {
            return PROJECT_TYPES.purchaseOrderType.name;
          }

          return replaceSign;
        },
      },
      {
        title: '项目编号',
        dataIndex: 'projectCode',
        width: 140,
        sorter: true,
        sortOrder: sortInfo && sortInfo.columnKey === 'projectCode' && sortInfo.order,
        render: (data, record) => {
          if (!data) return replaceSign;
          const { category } = record;
          if (Number(category) === 2) {
            return (
              <div>
                {data}
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
          return <Tooltip text={data} length={20} />;
        },
      },
      taskDispatchType !== TASK_DISPATCH_TYPE.manager && {
        title: '项目层级',
        dataIndex: 'level',
        width: 100,
        render: (level, { projectCode, status, category }) => (
          <LevelTreePop code={projectCode} level={level} category={category} status={status} />
        ),
      },
      {
        title: '订单编号',
        dataIndex: 'purchaseOrderCode',
        width: 150,
        sorter: true,
        sortOrder: sortInfo && sortInfo.columnKey === 'purchaseOrderCode' && sortInfo.order,
        render: data => {
          if (!data) return replaceSign;
          return <Tooltip text={data} length={20} />;
        },
      },
      {
        title: productTitle,
        dataIndex: 'product',
        width: 200,
        render: (data, record) => {
          const { code, name } = data || {};
          const { category, inputMaterial, outputMaterial } = record;
          if (Number(category) === 2) {
            const material = inputMaterial && inputMaterial[0];
            const { code, name } = material || {};
            return `${code}/${name}`;
          }
          if (category === PROJECT_CATEGORY_INJECTION_MOULDING) {
            return outputMaterial.map(({ name, code }) => `${code}/${name}`).join(',');
          }
          return `${code || replaceSign}/${name || replaceSign}`;
        },
      },
      {
        title: '产出物料类型',
        dataIndex: 'productMaterialTypes',
        width: 200,
        minWidth: 100,
        render: (types, record) => {
          const { category } = record;
          if (Number(category) === 1 && !arrayIsEmpty(types)) {
            return _.join(types, '，');
          }
          return replaceSign;
        },
      },
      {
        title: amountAndUnit,
        dataIndex: 'amountAndUnit',
        width: 110,
        render: (data, record) => {
          const { amountProductPlanned, product, category, inputMaterial, outputMaterial } = record || {};
          if (Number(category) === 2) {
            const material = inputMaterial && inputMaterial[0];
            const amounts = inputMaterial && inputMaterial.map(({ totalAmount }) => totalAmount);
            const { unitName } = material || {};
            return `${thousandBitSeparator(_.sum(amounts))}${unitName || replaceSign}`;
          }
          if (category === PROJECT_CATEGORY_INJECTION_MOULDING) {
            return outputMaterial.map(({ totalAmount, unitName }) => `${totalAmount} ${unitName}`).join(',');
          }
          const { unit } = product || {};
          if (typeof amountProductPlanned === 'number' && amountProductPlanned >= 0 && unit) {
            return `${thousandBitSeparator(amountProductPlanned)} ${unit}`;
          }
          return replaceSign;
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
      taskDispatchType === TASK_DISPATCH_TYPE.manager
        ? {
            title: '计划员',
            dataIndex: 'planners',
            width: 180,
            render: data => {
              const text = Array.isArray(data) && data.length ? data.map(i => i.name).join(',') : replaceSign;
              return <Tooltip text={text} length={20} />;
            },
          }
        : null,
      {
        title: '生产主管',
        width: 180,
        dataIndex: 'managers',
        render: data => {
          const text =
            Array.isArray(data) && data.length ? data.map(i => i.name || replaceSign).join(',') : replaceSign;

          return <Tooltip text={text} length={20} />;
        },
      },
      {
        title: '创建时间',
        width: 180,
        dataIndex: 'createAt',
        sorter: true,
        sortOrder: sortInfo && sortInfo.columnKey === 'createAt' && sortInfo.order,
        render: (create, { createdAt }) => {
          const time = create || createdAt;
          const text = time ? moment(time).format('YYYY/MM/DD HH:mm') : replaceSign;

          return <span>{text}</span>;
        },
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: 90,
        render: status => {
          const { display, code } = status || {};
          if (!code || !display) return replaceSign;
          if (code === 'paused') {
            return <MyBadge text={display} color={warning} />;
          }
          if (code === 'running') {
            return <MyBadge text={display} color={blueViolet} />;
          }
          if (code === 'created') {
            return <MyBadge text={display} color={border} />;
          }
          if (code === 'done') {
            return <MyBadge text={display} color={error} />;
          }
          if (code === 'aborted') {
            return <MyBadge text={display} color={fontSub} />;
          }
          return null;
        },
      },
      {
        title: '计划开始时间',
        width: 130,
        dataIndex: 'startTimePlanned',
        sorter: true,
        sortOrder: sortInfo && sortInfo.columnKey === 'startTimePlanned' && sortInfo.order,
        render: data => {
          return data ? moment(data).format('YYYY/MM/DD') : replaceSign;
        },
      },
      {
        title: '计划结束时间',
        width: 130,
        dataIndex: 'endTimePlanned',
        sorter: true,
        sortOrder: sortInfo && sortInfo.columnKey === 'endTimePlanned' && sortInfo.order,
        render: data => {
          return data ? moment(data).format('YYYY/MM/DD') : replaceSign;
        },
      },
      {
        title: progressTitle,
        key: 'progress',
        width: 150,
        render: (data, record) => {
          const { amountProductCompleted, amountProductPlanned, category, inputMaterial, outputMaterial } =
            record || {};
          if (amountProductPlanned > 0 && amountProductCompleted >= 0 && category === 1) {
            return `${thousandBitSeparator(amountProductCompleted)}/${thousandBitSeparator(amountProductPlanned)}`;
          }
          const material = inputMaterial && inputMaterial[0];
          const { totalAmount } = material || {};
          if (category === 2 && typeof totalAmount === 'number') {
            return `${thousandBitSeparator(amountProductCompleted)}/${thousandBitSeparator(totalAmount)}`;
          }
          if (category === PROJECT_CATEGORY_INJECTION_MOULDING) {
            return outputMaterial
              .map(({ actualAmount = replaceSign, totalAmount }) => `${actualAmount}/${totalAmount}`)
              .join(',');
          }
          return replaceSign;
        },
      },
      {
        title: '采购进度',
        width: 100,
        key: 'deliverProgress',
        render: (__, record) => {
          const { projectCode, createdType, category } = record || {};
          if (category === PROJECT_CATEGORY_INJECTION_MOULDING) {
            return replaceSign;
          }
          return (
            <Link
              onClick={async () => {
                const res = await getPurchaseProgress({ projectCode });
                const data = _.get(res, 'data.data');

                this.setState({
                  modalVisible: true,
                  modalData: {
                    data,
                    createdType,
                  },
                });
              }}
            >
              查看
            </Link>
          );
        },
      },
      {
        title: '订单备注',
        dataIndex: 'purchaseOrder.remark',
        width: 250,
        render: remark => {
          return <Tooltip text={remark || replaceSign} length={20} />;
        },
      },
      {
        title: '项目备注',
        dataIndex: 'description',
        width: 200,
        render: data => {
          return <Tooltip text={data || replaceSign} length={20} />;
        },
      },
      {
        title: '操作',
        fixed: 'right',
        key: 'action',
        width: 200,
        render: (_, record) => {
          const { status } = record || {};
          return this.renderOperations(status, record);
        },
      },
    ].filter(n => n);
  };

  getRowSelection = props => {
    const { selectedRowKeys } = this.state;
    const { cbForRowSelect, showBatchSelect, data } = props;

    const onSelectChange = (selectedRowKeys, selectedRows) => {
      const { selectedRows: _selectedRows } = this.state;
      const newSelectedRows = _.pullAllBy(_selectedRows, data, 'projectCode').concat(selectedRows);
      this.setState({ selectedRowKeys, selectedRows: newSelectedRows });
      if (typeof cbForRowSelect === 'function') cbForRowSelect(selectedRowKeys, newSelectedRows);
    };

    if (showBatchSelect) {
      return {
        hideDefaultSelections: true,
        selectedRowKeys,
        onChange: onSelectChange,
      };
    }

    return null;
  };

  clearSelectProjectCodes = () => {
    this.setState({
      selectedRowKeys: [],
      selectedRows: [],
    });
  };

  handleTableChange = (pagination, filters, sorter) => {
    if (sorter && sorter.columnKey) {
      const { order, columnKey } = sorter;
      this.setState({ sortInfo: sorter });
      this.props.refreshData({
        page: pagination && pagination.current,
        order: order === 'ascend' ? 0 : 1,
        size: (pagination && pagination.pageSize) || 10,
        sortBy: columnKey === 'createAt' ? 'createdAt' : columnKey,
      });
    } else {
      this.props.refreshData({
        page: pagination && pagination.current,
        size: (pagination && pagination.pageSize) || 10,
      });
    }
  };

  render() {
    const { data, refreshData, total, pagination, showBatchSelect, ...rest } = this.props;
    const columns = this.getColumns();

    // 将projectCode作为key，key同是被默认是rowKey
    const _data = Array.isArray(data)
      ? data.map(a => {
          return {
            key: a ? a.projectCode : null,
            ...a,
          };
        })
      : [];

    return (
      <div>
        {this.renderPurchaseProgressModal()}
        <Table
          tableUniqueKey={TABLE_UNIQUE_KEY}
          useColumnConfig
          rowSelection={this.getRowSelection(this.props)}
          columns={columns}
          dataSource={_data || []}
          total={total}
          {...rest}
          dragable
          pagination={pagination}
          onChange={this.handleTableChange}
        />
      </div>
    );
  }
}

ProjectTable.contextTypes = {
  router: PropTypes.object,
  changeChineseToLocale: () => {},
};

export default ProjectTable;
