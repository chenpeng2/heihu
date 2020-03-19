import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import { RestPagingTable, Tooltip, Link } from 'components';
import { thousandBitSeparator, safeSub } from 'utils/number';
import { TASK_DISPATCH_TYPE } from 'utils/organizationConfig';
import { replaceSign } from 'constants';
import { arrayIsEmpty } from 'utils/array';
import moment from 'utils/time';
import auth from 'utils/auth';
import { convertUnit } from 'services/bom/material';
import { fetchCustomFields } from '../utils';
import { toWorkOrderDetail } from '../../../plannedTicket/navigation';

type Props = {
  match: any,
  style: {},
  data: [],
  taskDispatchType: string,
  purchaseOrder: {},
  history: any,
  lineCustomFields: any,
};

type State = {};

class MaterialListTable extends Component {
  props: Props;
  state: State = {
    customFields: [],
    scrollX: 0,
    scroll: false,
    baseWidth: 500,
  };

  componentWillMount = () => {
    this.fetchCustomFields();
  };

  fetchCustomFields = async params => {
    const customFields = await fetchCustomFields();
    const customFieldsNum = _.get(customFields, 'length');
    const baseWidth = 1070;
    const { lineCustomFields } = this.props;
    const scrollX = baseWidth + 110 * customFieldsNum + 10 + lineCustomFields.length * 100;
    this.setState({ customFields, scroll: scrollX >= 1100, scrollX, baseWidth });
  };

  convertUnitAndAmount = async params => {
    try {
      const {
        data: { data },
      } = await convertUnit(params);
      if (Array.isArray(data)) {
        const { body } = data[0];
        const { targetUnitAmount, targetUnitName } = body || {};
        // 主单位以及对应转换后的数量
        return { masterUnitName: targetUnitName, masterUnitAmount: targetUnitAmount };
      }
    } catch (error) {
      console.log(error);
    }
    return {};
  };

  getColumns = dataSource => {
    const { taskDispatchType, lineCustomFields } = this.props;
    const { customFields } = this.state;
    const customFieldsColumns = Array.isArray(customFields)
      ? customFields.map(keyName => {
          return {
            title: keyName,
            key: keyName,
            dataIndex: keyName,
            width: 110,
            render: (data, record, i) => {
              const customFields = _.get(dataSource, `[${i}].materialCustomFields`, []);
              const node = _.find(customFields, o => _.get(o, 'keyName') === keyName);
              const { keyValue } = node || {};

              return <Tooltip text={keyValue || replaceSign} length={7} />;
            },
          };
        })
      : [];

    const soCustomColumns = Array.isArray(lineCustomFields)
      ? lineCustomFields.map(field => {
          const column = {
            title: field.name,
            key: field.name,
            dataIndex: field.name,
            width: 100,
            render: (data, record) => {
              const fields = _.get(record, 'lineCustomFields', []);
              const node = _.find(fields, o => _.get(o, 'keyName') === field.name);
              const { keyValue } = node || {};
              return <Tooltip text={keyValue || replaceSign} length={100} />;
            },
          };
          return column;
        })
      : [];

    const columns = [
      {
        title: '物料编号/名称',
        key: 'material',
        fixed: 'left',
        width: 180,
        render: (__, record) => {
          const { materialCode, materialName } = record;
          const text = `${materialCode || replaceSign}/${materialName || replaceSign}`;

          return materialCode ? <Tooltip text={text} length={20} /> : replaceSign;
        },
      },
      ...customFieldsColumns,
      {
        title: '数量',
        key: 'amount',
        width: 100,
        render: (__, record) => {
          const { amount, unitName } = record;
          const text = `${amount ? thousandBitSeparator(amount) : 0} ${unitName || replaceSign}`;

          return unitName ? <Tooltip text={text} length={10} /> : replaceSign;
        },
      },
      {
        title: '出厂数',
        dataIndex: 'amountDone',
        width: 100,
        render: (amount, record) => {
          const { unitName } = record;
          if (typeof amount !== 'number') return replaceSign;
          const text = `${amount ? thousandBitSeparator(amount) : 0} ${unitName || replaceSign}`;
          return <Tooltip text={text} length={10} />;
        },
      },
      {
        title: '退货数',
        dataIndex: 'amountRetrieve',
        width: 100,
        render: (amount, record) => {
          const { unitName } = record;
          if (typeof amount !== 'number') return replaceSign;
          const text = `${amount ? thousandBitSeparator(amount) : 0} ${unitName || replaceSign}`;
          return <Tooltip text={text} length={10} />;
        },
      },
      {
        title: '规格描述',
        dataIndex: 'materialDesc',
        width: 100,
        render: (materialDesc, record) => {
          return !_.isEmpty(materialDesc) ? <Tooltip text={materialDesc} length={12} /> : replaceSign;
        },
      },
    ];

    // 主管派发的时候显示计划工单
    if (taskDispatchType === TASK_DISPATCH_TYPE.manager) {
      columns.push(
        {
          title: '计划生产数',
          width: 100,
          render: (__, record) => {
            const { workOrderAmount, amount } = record || {};
            return `${typeof workOrderAmount === 'number' ? thousandBitSeparator(workOrderAmount) : replaceSign}/${
              typeof amount === 'number' ? thousandBitSeparator(amount) : replaceSign
            }`;
          },
        },
        // ...commonRightColumns,
        {
          title: '交货日期',
          dataIndex: 'targetDate',
          key: 'targetDate',
          width: 100,
          render: targetDate => (targetDate ? moment(targetDate).format('YYYY/MM/DD') : replaceSign),
        },
        ...soCustomColumns,
        {
          title: '计划工单',
          dataIndex: 'planWorkOrderCodes',
          fixed: 'right',
          width: 180,
          render: data => {
            return (
              <div>
                {!arrayIsEmpty(data)
                  ? data.map(({ code, category }, i) => {
                      const href = toWorkOrderDetail({ code, category });
                      return (
                        <span>
                          {i === 0 ? '' : ','}
                          <Link.NewTagLink href={href}>{code}</Link.NewTagLink>
                        </span>
                      );
                    })
                  : replaceSign}
              </div>
            );
          },
        },
        {
          title: '操作',
          fixed: 'right',
          width: 110,
          render: record => {
            const { id, targetDate, materialCode, materialName, materialDesc, unitName, workOrderAmount, amount } =
              record || {};

            const {
              purchaseOrder: { purchaseOrderCode },
            } = this.props;
            if (!materialCode) return replaceSign;

            return (
              <Link
                auth={auth.WEB_CREATE_PLAN_WORK_ORDER}
                onClick={async () => {
                  const minus = safeSub(amount, workOrderAmount) < 0 ? 0 : safeSub(amount, workOrderAmount);
                  const disabledList = {
                    plannedTicketType: true,
                    purchaseOrder: true,
                    product: true,
                  };
                  const { masterUnitName, masterUnitAmount } = await this.convertUnitAndAmount([
                    {
                      materialCode,
                      sourceUnitName: unitName,
                      sourceUnitAmount: minus,
                    },
                  ]);
                  const params = {
                    disabledList,
                    materialCode,
                    materialName,
                    materialDesc,
                    purchaseOrderCode,
                    type: 2,
                    targetDate,
                    orderMaterialId: id,
                    amount: masterUnitAmount,
                    materialUnit: masterUnitName,
                  };

                  this.props.history.push({
                    pathname: '/cooperate/plannedTicket/create',
                    state: { ...params },
                  });
                }}
              >
                创建计划工单
              </Link>
            );
          },
        },
      );
    }

    // 工人管控的时候显示项目
    if (taskDispatchType === TASK_DISPATCH_TYPE.worker || taskDispatchType === TASK_DISPATCH_TYPE.workerWeak) {
      columns.push(
        {
          title: '计划生产数',
          width: 100,
          render: (__, record) => {
            const { projectAmount, amount } = record || {};
            return `${typeof projectAmount === 'number' ? thousandBitSeparator(projectAmount) : replaceSign}/${
              typeof amount === 'number' ? thousandBitSeparator(amount) : replaceSign
            }`;
          },
        },
        // ...commonRightColumns,
        {
          title: '交货日期',
          dataIndex: 'targetDate',
          key: 'targetDate',
          width: 100,
          render: targetDate => (targetDate ? moment(targetDate).format('YYYY/MM/DD') : replaceSign),
        },
        ...soCustomColumns,
        {
          title: '项目号',
          dataIndex: 'projects',
          fixed: 'right',
          width: 180,
          render: data => {
            if (Array.isArray(data) && data.length > 0) {
              return (
                <React.Fragment>
                  {data.map((x, i) => (
                    <React.Fragment>
                      {i !== 0 ? <span>, </span> : null}
                      <Link
                        onClick={() => window.open(`/cooperate/projects/${encodeURIComponent(x)}/detail`, '_blank')}
                      >
                        {x}
                      </Link>
                    </React.Fragment>
                  ))}
                </React.Fragment>
              );
            }
            return replaceSign;
          },
        },
        {
          title: '操作',
          width: 110,
          fixed: 'right',
          render: record => {
            const { id, targetDate, materialCode, materialName, unitName, materialDesc, amount, workOrderAmount } =
              record || {};
            const { purchaseOrder } = this.props;
            if (!materialCode) return replaceSign;

            return (
              <Link
                onClick={async () => {
                  const disabledList = {
                    projectType: true,
                    purchaseOrder: true,
                    product: true,
                  };
                  const minus = safeSub(amount, workOrderAmount) < 0 ? 0 : safeSub(amount, workOrderAmount);
                  const { masterUnitName, masterUnitAmount } = await this.convertUnitAndAmount([
                    {
                      materialCode,
                      sourceUnitName: unitName,
                      sourceUnitAmount: minus,
                    },
                  ]);
                  const params = {
                    disabledList,
                    amountProductPlanned: masterUnitAmount,
                    product: { unit: masterUnitName, code: materialCode, name: materialName, desc: materialDesc },
                    purchaseOrder,
                    type: 2,
                    targetDate,
                    orderMaterialId: id,
                  };

                  this.props.history.push({ pathname: '/cooperate/projects/create', state: { ...params } });
                }}
              >
                创建项目
              </Link>
            );
          },
        },
      );
    }

    return columns;
  };

  render() {
    const { data } = this.props;
    const { baseWidth, scroll } = this.state;
    const columns = this.getColumns(data);

    return (
      <RestPagingTable
        rowKey={record => record.id}
        style={{ margin: 0, minWidth: baseWidth, maxWidth: 1100 }}
        scroll={scroll}
        dataSource={data || []}
        columns={columns}
        pagination={false}
      />
    );
  }
}

export default withRouter(MaterialListTable);
