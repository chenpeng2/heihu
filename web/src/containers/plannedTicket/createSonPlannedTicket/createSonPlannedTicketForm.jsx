import React, { Component } from 'react';
import { withRouter, Prompt } from 'react-router-dom';
import PropTypes from 'prop-types';

import { Modal, Button, withForm, FormItem } from 'src/components';
import { createSubPlannedTicket } from 'src/services/cooperate/plannedTicket';

import PlannedTicketBaseForm from './baseForm';
import {
  formatFormValueForSubmit,
  savePlannedTicketPlanners,
  getInitialPlannerData,
  getInitialManagerData,
  savePlannedTicketManagers,
  savePlannedTicketProductBatchType,
  getPlannedTicketProductBatchType,
  savePlannedTicketAuditorIds,
  getPlannedTicketAuditorIds,
} from '../util';
import { PROCESS_TYPE_PROCESS_ROUTE } from '../constants';
import styles from '../styles.scss';

const buttonStyle = { width: 114, height: 32, marginRight: 40 };
const { AntModal } = Modal;

type Props = {
  form: {
    validateFieldsAndScroll: () => {},
  },
  fatherPlannedTicketCode: string,
  fatherPlannedTicketDetail: any,
};

class CreatePlannedTicket extends Component {
  props: Props;
  state = {
    plannersInfo: {},
    managersInfo: {},
    productBatchType: null,
    lastAuditorIds: {},
    confirmed: false,
    fieldsValue: null,
  };

  componentDidMount() {
    this.getInitialData();
  }

  getInitialData = () => {
    const productBatchType = getPlannedTicketProductBatchType();
    this.setState({ productBatchType });
    getInitialPlannerData().then(res => this.setState({ plannersInfo: res }));
    getInitialManagerData().then(res => this.setState({ managersInfo: res }));
    const lastAuditorIds = getPlannedTicketAuditorIds();
    this.setState({ lastAuditorIds });
  };

  collectData = () => {
    const { form } = this.props;
    const values = form.getFieldsValue();
    console.log(values);
    const format = formatFormValueForSubmit(values);
    return format;
  };

  createWorkOrder = format => {
    const { code } = format;
    const { fatherPlannedTicketCode } = this.props;

    createSubPlannedTicket(fatherPlannedTicketCode, format)
      .then(({ data: { data, statusCode } }) => {
        if (statusCode === 200) {
          // 保存计划工单审批人
          savePlannedTicketAuditorIds({
            auditorIds: format && format.auditorIds,
            taskAuditorIds: format && format.taskAuditorIds,
          });
          // 保存计划工单成品批次生成方式
          savePlannedTicketProductBatchType(format && format.productBatchType);
          // 保存计划工单计划人员
          savePlannedTicketPlanners({
            planners: format ? format.planners : null,
          });
          // 保存计划工单生产主管
          savePlannedTicketManagers({
            managers: format ? format.managers : null,
          });
          this.context.router.history.push(`/cooperate/plannedTicket/detail/${encodeURIComponent(code)}`);
        }
      })
      .catch(err => console.log(err))
      .finally(e => this.setState({ submiting: false }));
  };

  onSubmit = () => {
    this.setState({ confirmed: true });
    const {
      form: { validateFieldsAndScroll },
      fatherPlannedTicketCode,
    } = this.props;

    if (!fatherPlannedTicketCode) return;

    validateFieldsAndScroll(async (err, values) => {
      if (!err) {
        const format = this.collectData();
        this.createWorkOrder(format);
      }
    });
  };

  showConfirm = () => {
    const { fatherPlannedTicketCode: code } = this.props;
    this.setState({ confirmed: true });
    AntModal.confirm({
      title: '计划工单未保存',
      content: '计划工单还未保存，若离开此页面已填数据将丢失，请确认是否继续？',
      okText: '继续',
      cancelText: '取消',
      onOk: () => {
        this.props.history.push(`/cooperate/plannedTicket/detail/${encodeURIComponent(code)}`);
      },
    });
  };

  render() {
    const { form, fatherPlannedTicketCode, fatherPlannedTicketDetail } = this.props;
    const { getFieldValue, getFieldDecorator } = form;
    const { changeChineseToLocale } = this.context;
    const {
      plannersInfo,
      managersInfo,
      productBatchType,
      lastAuditorIds,
      confirmed,
      fieldsValue,
      submiting,
    } = this.state;

    return (
      <div className={styles.pageStyle}>
        <Prompt
          message={changeChineseToLocale('计划工单还未保存，若离开此页面已填数据将丢失，请确认是否继续？')}
          when={form.isFieldsTouched() && !confirmed}
        />
        <div className={styles.pageHeader}>
          <p>{changeChineseToLocale('创建子计划工单')}</p>
        </div>
        <PlannedTicketBaseForm
          fatherPlannedTicketDetail={fatherPlannedTicketDetail}
          fatherPlannedTicketCode={fatherPlannedTicketCode}
          form={form}
          data={{
            ...plannersInfo,
            ...managersInfo,
            productBatchType,
            ...lastAuditorIds,
          }}
        />
        <FormItem style={{ paddingLeft: 120, marginTop: 30 }}>
          <Button
            type="default"
            style={buttonStyle}
            onClick={() => {
              if (form.isFieldsTouched()) {
                this.showConfirm();
              } else {
                this.props.history.push(
                  `/cooperate/plannedTicket/detail/${encodeURIComponent(fatherPlannedTicketCode)}`,
                );
              }
            }}
          >
            取消
          </Button>
          <Button type="primary" style={buttonStyle} onClick={this.onSubmit}>
            保存
          </Button>
        </FormItem>
      </div>
    );
  }
}

CreatePlannedTicket.contextTypes = {
  router: PropTypes.object,
  changeChineseToLocale: () => {},
};

export default withForm({}, withRouter(CreatePlannedTicket));
