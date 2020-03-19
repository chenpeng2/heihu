import React, { Component, Fragment } from 'react';
import { withRouter, Prompt } from 'react-router-dom';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Modal, Button, withForm, message, Tabs, FormItem, Text, Checkbox, Spin } from 'src/components';
import {
  createPlannedTicket,
  createBaitingWorkOrder,
  createInjectMoldWorkOder,
  checkPlanWorkOrder,
} from 'src/services/cooperate/plannedTicket';
import { arrayIsEmpty } from 'utils/array';
import { toWorkOrderDetail } from 'views/cooperate/plannedTicket/navigation';
import * as CONSTANT from 'constants';
import log from 'utils/log';
import { organizationPlanTicketCategory } from 'views/cooperate/plannedTicket/utils';
import {
  formatFormValueForSubmit,
  savePlannedTicketPlanners,
  savePlannedTicketManagers,
  savePlannedTicketAuditorIds,
  getPlannedTicketAuditorIds,
  getInitialPlannerData,
  getInitialManagerData,
  savePlannedTicketProductBatchType,
  getPlannedTicketProductBatchType,
  getAuditConfig,
  getAllDisabledList,
} from '../util';

import PlannedTicketBaseForm from '../base/plannedTicketForm';
import BaitingWorkOrderBaseForm from '../base/baitingWorkOrderBaseForm';
import InjectionMouldingBaseForm, { formatInjectionMouldingSubmitValue } from '../base/InjectionMouldingBaseForm';
import CreateSubWorkOrderTable from '../CreateSubWorkOrderTable';
import { PROCESS_TYPE_PROCESS_ROUTE } from '../constants';
import styles from '../styles.scss';
import TransferReqCheckbox from '../CreateTransferRequest/TransferReqCheckbox';

const TabPane = Tabs.TabPane;
const buttonStyle = { width: 114, height: 32, marginRight: 40 };
const { AntModal } = Modal;
const commonFormItemStyle = { paddingLeft: 140 };

type Props = {
  form: {
    validateFieldsAndScroll: () => {},
  },
  match: {},
  location: {},
};

type WorkOrderButtonPropsType = {
  onClick: () => {},
  children: any,
};

function WorkOrderButton(props: WorkOrderButtonPropsType) {
  const { children, ...rest } = props || {};
  return (
    <Button type="default" style={buttonStyle} {...rest}>
      {children}
    </Button>
  );
}

class CreatePlannedTicket extends Component {
  props: Props;

  constructor(props) {
    super(props);
    this.baitingWorkOrderBaseForm = React.createRef();
    this.subWorkOrderTableFormRef = React.createRef();
  }

  state = {
    plannersInfo: {},
    managersInfo: {},
    confirmed: false,
    loading: false,
    initialData: null,
    type: CONSTANT.PLAN_TICKET_NORMAL,
    workOrderBaitingConfig: 'false',
    showCreateSubTable: false,
    curWorkOrderData: {},
    submiting: false,
  };

  componentDidMount() {
    const workOrderBaitingConfig = getAuditConfig('baitingWorkOrder');
    this.setState({ workOrderBaitingConfig });
    this.getInitialData();
  }

  getInitialData = () => {
    const {
      location: { state },
    } = this.props;
    const { type } = this.state;
    getInitialPlannerData(type).then(res => this.setState({ plannersInfo: res }));
    getInitialManagerData(type).then(res => this.setState({ managersInfo: res }));
    const productBatchType = getPlannedTicketProductBatchType();
    const lastAuditorIds = getPlannedTicketAuditorIds();
    this.setState({
      initialData: { ...state, productBatchType, ...lastAuditorIds },
    });
  };

  formatBaitingValues = values => {
    const {
      planners,
      managers,
      purchaseOrder,
      outMaterials: _outMaterials,
      inMaterials: _inMaterials,
      attachments: files,
      customFields,
      ...rest
    } = values;
    const outMaterials = _outMaterials && _outMaterials.filter(({ code }) => code);
    const inMaterials = _inMaterials && _inMaterials.filter(({ code }) => code);
    const attachments = files && files.map(({ id }) => id);
    const purchaseOrderCode = purchaseOrder && purchaseOrder.key;
    const plannerId = planners && planners.map(({ key }) => key);
    const managerId = managers && managers.map(({ key }) => key);

    return {
      purchaseOrderCode,
      plannerId,
      managerId,
      outMaterials,
      inMaterials,
      attachments,
      customFields: customFields
        ? _.map(customFields, (value, key) => ({
            name: key,
            content: value,
          }))
        : undefined,
      ...rest,
    };
  };

  createWorkOrder = format => {
    createPlannedTicket(format)
      .then(({ data: { data, statusCode } }) => {
        if (statusCode === 200) {
          if (sensors) {
            sensors.track('web_cooperate_plannedTicket_create', {
              CreateMode: '手动创建',
              amount: 1,
            });
          }
          // 保存成品批次生成方式
          savePlannedTicketProductBatchType(format && format.productBatchType);
          // 保存计划工单审批人
          savePlannedTicketAuditorIds({
            auditorIds: format && format.auditorIds,
            taskAuditorIds: format && format.payloadTaskAuditorIds,
          });
          // 保存计划工单计划人员
          savePlannedTicketPlanners(format ? format.planners : null);
          // 保存计划工单生产主管
          savePlannedTicketManagers(format ? format.managers : null);
          const { code } = format;
          message.success('创建成功！');
          this.context.router.history.push(`/cooperate/plannedTicket/detail/${encodeURIComponent(code)}`);
        }
      })
      .catch(err => log.error(err))
      .finally(() => this.setState({ loading: false }));
  };

  collectWorkOrderData = () => {
    const { form } = this.props;
    const { showCreateSubTable } = this.state;
    const values = form.getFieldsValue();
    let children = null;
    if (showCreateSubTable) {
      const subTableRef = this.subWorkOrderTableFormRef.current;
      const subFormRef = subTableRef.props.form;
      const selectedRowKeys = _.get(subTableRef.props, 'rowSelection.selectedRowKeys');
      subFormRef.validateFieldsAndScroll(selectedRowKeys, (err, subValues) => {
        this.setState({ submiting: _.isEmpty(err) });
        if (!err) {
          children = this.filterChild(subValues.children, selectedRowKeys);
        }
      });
    }
    const format = formatFormValueForSubmit({ ...values, children });
    return this.state.showCreateSubTable && !children ? null : format;
  };

  createBaitingWorkOrder = values => {
    const materials = this.baitingWorkOrderBaseForm.current.onSubmit();
    const format = this.formatBaitingValues({ ...values, ...materials });
    createBaitingWorkOrder(format)
      .then(({ data: { data, statusCode } }) => {
        if (statusCode === 200) {
          // 保存计划工单计划人员
          savePlannedTicketPlanners(values ? values.planners : null, CONSTANT.PLAN_TICKET_BAITING);
          // 保存计划工单生产主管
          savePlannedTicketManagers(values ? values.managers : null, CONSTANT.PLAN_TICKET_BAITING);
          message.success('创建成功！');
          const { code } = format;
          this.context.router.history.push(`/cooperate/plannedTicket/baiting/detail/${encodeURIComponent(code)}`);
        }
      })
      .finally(e => {
        this.setState({ loading: false });
      });
  };

  createInjectMoldWorkOder = values => {
    const format = formatInjectionMouldingSubmitValue(values);
    createInjectMoldWorkOder(format)
      .then(({ data: { data, statusCode } }) => {
        if (statusCode === 200) {
          // 保存计划工单计划人员
          savePlannedTicketPlanners(values ? values.planners : null, CONSTANT.PLAN_TICKET_INJECTION_MOULDING);
          // 保存计划工单生产主管
          savePlannedTicketManagers(values ? values.managers : null, CONSTANT.PLAN_TICKET_INJECTION_MOULDING);
          message.success('创建成功！');
          this.context.router.history.push(
            toWorkOrderDetail({
              code: values.code,
              category: CONSTANT.PLAN_TICKET_INJECTION_MOULDING,
            }),
          );
        }
      })
      .finally(e => {
        this.setState({ loading: false });
      });
  };

  filterChild = (subData: Array, selectedRowKeys: Array) => {
    return subData
      .filter(data => data && selectedRowKeys.includes(data.key) && data.amount)
      .filter(data => {
        if (arrayIsEmpty(data.children)) return [];
        data.children = this.filterChild(data.children, selectedRowKeys);
        return data;
      });
  };

  onSubmit = () => {
    this.setState({ confirmed: true });
    const {
      form: { validateFieldsAndScroll },
    } = this.props;
    validateFieldsAndScroll(async (err, values) => {
      if (!err) {
        const { type } = this.state;
        this.setState({ loading: true });
        if (type === CONSTANT.PLAN_TICKET_BAITING) {
          this.createBaitingWorkOrder(values);
        } else if (type === CONSTANT.PLAN_TICKET_NORMAL) {
          const format = await this.collectWorkOrderData();
          if (values && !values.createTransReq && format) {
            this.createWorkOrder(format);
            return;
          }
          this.setState({ submiting: !_.isEmpty(format) });
        } else if (type === CONSTANT.PLAN_TICKET_INJECTION_MOULDING) {
          this.createInjectMoldWorkOder(values);
        }
      }
    });
  };

  showConfirm = () => {
    this.setState({ confirmed: true });
    AntModal.confirm({
      title: '计划工单未保存',
      content: '计划工单还未保存，若离开此页面已填数据将丢失，请确认是否继续？',
      okText: '继续',
      cancelText: '取消',
      onOk: () => {
        this.props.history.push('/cooperate/plannedTicket');
      },
    });
  };

  checkWorkOrderPayloads = cb => {
    const {
      form: { validateFieldsAndScroll },
    } = this.props;
    validateFieldsAndScroll((err, values) => {
      if (!err) {
        const format = formatFormValueForSubmit(values);
        this.apiCheckPlanWorkOrder(format, cb);
      } else {
        this.setState({ showCreateSubTable: false });
      }
    });
  };

  apiCheckPlanWorkOrder = (data, cb) => {
    checkPlanWorkOrder(data)
      .then(res => {
        const statusCode = _.get(res, 'data.statusCode');
        if (statusCode === 200) {
          this.setState({ curWorkOrderData: data });
          cb();
        }
      })
      .catch(err => {
        log.error(err);
        this.setState({ showCreateSubTable: false });
      });
  };

  handleBulkCreateSubOnChange = e => {
    if (e.target.checked) {
      this.checkWorkOrderPayloads(() => {
        this.setState({ showCreateSubTable: true });
      });
      return;
    }
    this.setState({ showCreateSubTable: false });
  };

  renderDefaultBtn = (workOrderAuditConfig, taskAuditConfig) => {
    const { form } = this.props;
    return (
      <WorkOrderButton
        onClick={() => {
          if (form.isFieldsTouched()) {
            this.showConfirm();
          } else {
            this.props.history.push('/cooperate/plannedTicket');
          }
        }}
      >
        取消
      </WorkOrderButton>
    );
  };

  render() {
    const { form, match } = this.props;
    const { getFieldDecorator, getFieldValue } = form || {};
    const { changeChineseToLocale } = this.context;
    const {
      submiting,
      confirmed,
      managersInfo,
      plannersInfo,
      initialData,
      type,
      workOrderBaitingConfig,
      showCreateSubTable,
      curWorkOrderData,
    } = this.state;
    const { value: typeValue, text: typeText } = type || {};
    const { disabledList, ...restData } = initialData || {};
    const data = Object.assign({
      ...plannersInfo,
      ...managersInfo,
      ...restData,
    });
    const renderForm = {
      [CONSTANT.PLAN_TICKET_NORMAL]: (
        <PlannedTicketBaseForm
          match={match}
          form={form}
          data={data}
          disabledList={showCreateSubTable ? getAllDisabledList(form) : disabledList}
        />
      ),
      [CONSTANT.PLAN_TICKET_BAITING]:
        workOrderBaitingConfig === 'true' ? (
          <BaitingWorkOrderBaseForm
            ref={this.baitingWorkOrderBaseForm}
            match={match}
            form={form}
            data={data}
            disabledList={disabledList}
            type="baiting"
          />
        ) : null,
      [CONSTANT.PLAN_TICKET_INJECTION_MOULDING]: <InjectionMouldingBaseForm form={form} data={data} />,
    };
    const workOrderAuditConfig = getAuditConfig('workOrderAudit');
    const taskAuditConfig = getAuditConfig('taskAudit');

    return (
      <div className={styles.pageStyle}>
        <Prompt
          message={'计划工单还未保存，若离开此页面已填数据将丢失，请确认是否继续？'}
          when={form.isFieldsTouched() && !confirmed}
        />
        {organizationPlanTicketCategory().length > 1 && (
          <Tabs
            onChange={key => {
              form.resetFields();
              this.setState(
                {
                  type: parseInt(key, 10),
                },
                () => {
                  this.getInitialData();
                },
              );
            }}
            defaultActiveKey={CONSTANT.PLAN_TICKET_NORMAL}
          >
            {organizationPlanTicketCategory().map(key => (
              <TabPane tab={changeChineseToLocale(CONSTANT.planTicketMap.get(key))} key={key} />
            ))}
          </Tabs>
        )}
        <div className={styles.pageContent}>
          <div className={styles.pageHeader}>
            <p>{changeChineseToLocale('创建计划工单')}</p>
          </div>
          {renderForm[type]}
          {workOrderAuditConfig === 'false' && taskAuditConfig === 'false' && type === CONSTANT.PLAN_TICKET_NORMAL && (
            <Fragment>
              <FormItem style={commonFormItemStyle}>
                <Checkbox
                  disabled={getFieldValue('selectType') === PROCESS_TYPE_PROCESS_ROUTE}
                  checked={showCreateSubTable}
                  onChange={this.handleBulkCreateSubOnChange}
                >
                  批量创建子工单
                </Checkbox>
              </FormItem>
              <FormItem style={commonFormItemStyle}>
                <CreateSubWorkOrderTable
                  topWorkOrderData={curWorkOrderData}
                  wrappedComponentRef={this.subWorkOrderTableFormRef}
                  show={showCreateSubTable}
                />
              </FormItem>
            </Fragment>
          )}
          <FormItem style={{ ...commonFormItemStyle, marginTop: 30 }}>
            {this.renderDefaultBtn()}
            <Button type="primary" style={buttonStyle} onClick={this.onSubmit}>
              保存
            </Button>
            {type === CONSTANT.PLAN_TICKET_NORMAL &&
              getFieldDecorator('createTransReq')(
                <TransferReqCheckbox
                  onSubmit={this.createWorkOrder}
                  form={form}
                  submiting={submiting}
                  collectData={this.collectWorkOrderData}
                  setSubmiting={submiting => this.setState({ submiting })}
                  disabled={!getFieldValue('selectType') || getFieldValue('selectType') === PROCESS_TYPE_PROCESS_ROUTE}
                />,
              )}
          </FormItem>
        </div>
      </div>
    );
  }
}

CreatePlannedTicket.contextTypes = {
  router: PropTypes.object,
  changeChineseToLocale: () => {},
};

export default withForm({}, withRouter(CreatePlannedTicket));
