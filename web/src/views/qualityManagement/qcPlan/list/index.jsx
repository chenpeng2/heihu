import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import { Table, withForm, Link, Divider, Badge, Popover } from 'components';
import { replaceSign } from 'src/constants';
import moment, { formatUnix, formatToUnix } from 'src/utils/time';
import { setLocation } from 'utils/url';
import { arrayIsEmpty } from 'utils/array';
import { getQuery } from 'src/routes/getRouteParams';
import { toWorkOrderDetail } from 'src/views/cooperate/plannedTicket/navigation';
import { queryQcPlanList } from 'src/services/qualityManagement/qcPlan';
import { TASK_DISPATCH_TYPE } from 'src/utils/organizationConfig';
import PropTypes from 'prop-types';

import { getOrganizationTaskDispatchType } from '../utils';
import { QCPLAN_CHECK_TYPE, QCPLAN_STATUS, PLAN_WORK_ORDER_CATEGORY } from '../../constants';
import { ActionForList, FilterForList, UpdateQcPlanStatusLink, EditQcPlanLink } from '../components';

const LinkItem = props => {
  const { config } = props;
  const { title, href, text, style } = config;
  let content = replaceSign;
  if (text) {
    content = <Link.NewTagLink href={href}>{text}</Link.NewTagLink>;
  }

  return (
    <span style={style}>
      {title}
      {content}
    </span>
  );
};

/** 关联关系 */
const RelationColumnItem = ({ projectCode, record }, context) => {
  const planWorkOrderCategory = _.get(record.planWorkOrder, 'category');
  const planWorkOrderCode = _.get(record.planWorkOrder, 'code');
  const dispatchType = getOrganizationTaskDispatchType();
  const { changeChineseToLocale } = context;
  const config = {
    style: null,
    title: '',
    text: '',
    href: '',
  };
  if (dispatchType === TASK_DISPATCH_TYPE.manager) {
    config.title = `${changeChineseToLocale('计划工单')}：`;
    config.style = { marginRight: 10 };
    config.text = planWorkOrderCode;
    const isInjectionMouldingChild = planWorkOrderCategory === PLAN_WORK_ORDER_CATEGORY.injectMold.id;
    const category = planWorkOrderCategory === PLAN_WORK_ORDER_CATEGORY.injectMold.id ? null : planWorkOrderCategory;
    config.href = toWorkOrderDetail({
      code: planWorkOrderCode,
      category,
      isInjectionMouldingChild,
    });
  } else {
    config.title = `${changeChineseToLocale('项目')}：`;
    config.text = projectCode;
    config.href = `/cooperate/projects/${encodeURIComponent(projectCode)}/detail`;
  }

  return <LinkItem config={config} />;
};

RelationColumnItem.contextTypes = {
  changeChineseToLocale: PropTypes.func,
};

type Props = {
  form: any,
};

/** 质检计划 */
class QcPlanList extends Component {
  props: Props;
  state = {
    dataSource: [],
    total: 0,
    pagination: {},
  };

  componentDidMount() {
    const query = getQuery(this.props.match);
    const { createdAt, ...rest } = query || {};
    this.props.form.setFieldsValue(rest);
    if (!arrayIsEmpty(createdAt)) {
      this.props.form.setFieldsValue({ createdAt: [moment(createdAt[0]), moment(createdAt[1])] });
    }
    this.fetchData(query);
  }

  formatFilter = params => {
    // 对需要传给后端的过滤项进行format
    const { createdAt, ...rest } = params || {};
    const labelInValueData = _.pick(rest, ['materialCode', 'creatorId', 'planWorkOrderCode', 'projectCode']);
    const values = _.mapValues(labelInValueData, 'key');
    const createdTimeFrom = !arrayIsEmpty(createdAt) && createdAt[0] ? formatToUnix(createdAt[0]) : null;
    const createdTimeTill = !arrayIsEmpty(createdAt) && createdAt[1] ? formatToUnix(createdAt[1]) : null;
    return { ...rest, createdTimeFrom, createdTimeTill, ...values };
  };

  fetchData = params => {
    setLocation(this.props, p => ({ ...p, ...params }));
    const query = getQuery(this.props.match);
    const _params = this.formatFilter({ ...query, ...params });
    queryQcPlanList(_params)
      .then(res => {
        const { pagination } = this.state;
        const dataSource = _.get(res, 'data.data');
        const total = _.get(res, 'data.total');
        this.setState({
          dataSource,
          total,
          pagination: { ...pagination, current: (_params && _params.page) || 1 },
        });
      })
      .catch(err => console.log(err));
  };

  getColumns = () => {
    const { changeChineseToLocale } = this.context;
    return [
      {
        title: '编号',
        key: 'code',
        dataIndex: 'code',
        render: (data, record) => data || replaceSign,
      },
      {
        title: '计划类型',
        key: 'checkType',
        dataIndex: 'checkType',
        render: (data, record) =>
          typeof data === 'number' ? changeChineseToLocale(QCPLAN_CHECK_TYPE[data]) : replaceSign,
      },
      {
        title: '物料清单',
        key: 'qcPlanProcesses',
        dataIndex: 'qcPlanProcesses',
        render: (data, record) => {
          if (arrayIsEmpty(data)) return replaceSign;
          const materials = data.map(({ material }) => material);
          const content = this.renderQcPlanProcessMaterials(materials);
          return (
            <Popover content={content} placement="bottomLeft" trigger="click">
              <Link>查看</Link>
            </Popover>
          );
        },
      },
      {
        title: '关联关系',
        key: 'projectCode',
        dataIndex: 'projectCode',
        render: (projectCode, record) => <RelationColumnItem projectCode={projectCode} record={record} />,
      },
      {
        title: '当前状态',
        dataIndex: 'status',
        render: (data, record) =>
          typeof data === 'number' ? (
            <Badge.MyBadge text={QCPLAN_STATUS[data].display} color={QCPLAN_STATUS[data].color} />
          ) : (
            replaceSign
          ),
      },
      {
        title: '创建人',
        dataIndex: 'creatorName',
        render: (data, record) => data || replaceSign,
      },
      {
        title: '创建时间',
        key: 'createdAt',
        dataIndex: 'createdAt',
        render: (data, record) => {
          if (!data) return replaceSign;
          return formatUnix(data);
        },
      },
      {
        title: '更新时间',
        key: 'updatedAt',
        dataIndex: 'updatedAt',
        render: (data, record) => {
          if (!data) return replaceSign;
          return formatUnix(data);
        },
      },
      {
        title: '操作',
        key: 'action',
        dataIndex: 'action',
        render: (data, record) => {
          const { status, code, planWorkOrderCategory } = record;
          return (
            <Fragment>
              <UpdateQcPlanStatusLink params={{ status: Number(!status), code }} refetchData={this.fetchData} />
              <EditQcPlanLink params={{ code, category: planWorkOrderCategory }} />
            </Fragment>
          );
        },
      },
    ];
  };

  renderQcPlanProcessMaterials = materials => {
    const { changeChineseToLocale } = this.context;
    const columns = [
      {
        title: `${changeChineseToLocale('物料编号')} / ${changeChineseToLocale('物料名称')}`,
        dataIndex: 'material',
        key: 'material',
        render: (data, record) => `${_.get(record, 'code', replaceSign)}/${_.get(record, 'name', replaceSign)}`,
      },
    ];
    return (
      <Table
        scroll={{ y: 280 }}
        style={{ margin: 0, width: 400 }}
        dataSource={materials}
        columns={columns}
        pagination={false}
      />
    );
  };

  render() {
    const { form } = this.props;
    const { dataSource, total, pagination } = this.state;
    const columns = this.getColumns();
    const lineStyle = { borderBottom: '1px solid #f1f2f5' };

    return (
      <div>
        <FilterForList fetchData={this.fetchData} form={form} />
        <Divider lineStyle={lineStyle} />
        <ActionForList />
        <Table
          refetch={this.fetchData}
          rowKey={record => record.code}
          pagination={pagination}
          dataSource={dataSource}
          columns={columns}
          total={total}
        />
      </div>
    );
  }
}

QcPlanList.contextTypes = {
  changeChineseToLocale: PropTypes.func,
};

export default withForm({}, QcPlanList);
