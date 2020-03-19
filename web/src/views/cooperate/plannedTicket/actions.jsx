import React, { Component } from 'react';
import PropTypes from 'prop-types';
import auth from 'utils/auth';
import _ from 'lodash';

import { Button, Link, OpenImportModal, Icon, message } from 'components';
import {
  importPlannedTicket,
  applyAuditPlannedTicket,
  getWorkOrderCustomProperty,
} from 'services/cooperate/plannedTicket';
import { arrayIsEmpty } from 'utils/array';
import { keysToObj } from 'utils/parseFile';
import { getAuditConfig, applyForAudit } from 'containers/plannedTicket/util';
import { ORGANIZATION_CONFIG, includeOrganizationConfig } from 'utils/organizationConfig';

import { GET_IMPORT_TEMPLATE } from './constants';

type Props = {
  onBulkActionChange: () => {},
  selectedRows: [],
};

class Actions extends Component {
  props: Props;
  state = {
    showBulkActions: false,
    actionType: 'audit',
  };

  getImportTitles = () => {
    const { taskAuditConfig, workOrderAuditConfig } = getAuditConfig();
    const titles = [
      'parentCode',
      'type',
      'code',
      'purchaseOrderCode',
      'materialCode',
      'amount',
      'productBatchType',
      'productBatch',
      'parentSeq',
      'plannerName',
      'managerName',
      'priority',
      'planBeginTime',
      'planEndTime',
      'remark',
      'processRouteCode',
      'ebomVersion',
      'mbomVersion',
    ];

    if (taskAuditConfig === 'true') {
      for (let i = 1; i <= 5; i++) {
        titles.splice(-4, 0, `taskAuditorType${i}`);
        titles.splice(-4, 0, `taskAuditorName${i}`);
      }
      if (workOrderAuditConfig === 'true') {
        titles.splice(-14, 0, 'auditorName');
      }
    } else if (taskAuditConfig === 'false' && workOrderAuditConfig === 'true') {
      titles.splice(-4, 0, 'auditorName');
    }

    return titles;
  };

  formatImportData = async data => {
    const res = await getWorkOrderCustomProperty({ size: 1000 });
    const fields = _.get(res, 'data.data');
    const customFields = !arrayIsEmpty(fields) ? fields.map(e => e.name) : [];
    const titles = this.getImportTitles();
    if (data[0].length !== titles.length + customFields.length) {
      message.error('模板版本不符，请下载最新模板!');
      // throw new Error('模板版本不符，请下载最新模板!');
    }
    const keysData = keysToObj(data, titles);

    const valueInCsvData = Array.isArray(data) ? data.slice(1) : []; // csv文件中的数据
    const titlesInCsv = data[0]; // csv文件中的titles
    valueInCsvData.forEach((item, index) => {
      const fields = [];
      for (let i = titles.length; i < titlesInCsv.length; i += 1) {
        fields.push({
          name: titlesInCsv[i],
          content: item[i],
        });
      }
      keysData[index].fields = fields;
    });

    return keysData;
  };

  renderNormalActions = () => {
    const { workOrderAuditConfig, taskAuditConfig } = getAuditConfig();
    const showBatchOperationButton =
      workOrderAuditConfig === 'true' && !includeOrganizationConfig(ORGANIZATION_CONFIG.injectionMouldingWorkOrder);
    return (
      <React.Fragment>
        <Button
          auth={auth.WEB_CREATE_PLAN_WORK_ORDER}
          icon="plus-circle-o"
          style={{ marginRight: '20px' }}
          onClick={() => {
            this.context.router.history.push('/cooperate/plannedTicket/create');
          }}
        >
          创建计划工单
        </Button>
        <Button
          ghost
          auth={auth.WEB_CREATE_PLAN_WORK_ORDER}
          icon="download"
          style={{ marginRight: '20px' }}
          onClick={async () => {
            OpenImportModal({
              item: '计划工单',
              fileTypes: ['.xlsx'],
              context: this.context,
              method: importPlannedTicket,
              listName: 'createPlanWorkOrderDTOList',
              logUrl: '/cooperate/plannedTicket/logs/import',
              titles: this.getImportTitles(),
              dataFormat: this.formatImportData,
              fileDataStartLocation: 1,
              template: await GET_IMPORT_TEMPLATE(),
              onSuccess: res => {
                if (sensors) {
                  sensors.track('web_cooperate_plannedTicket_create', {
                    CreateMode: 'Excel导入',
                    amount: res.success,
                  });
                }
              },
            });
          }}
        >
          导入计划工单
        </Button>
        {showBatchOperationButton && (
          <Button
            onClick={() => this.toggleBulkActions('audit')}
            style={{ marginRight: 20, verticalAlign: 'middle' }}
            ghost
          >
            <Icon iconType={'gc'} type={'piliangcaozuo'} />
            批量操作
          </Button>
        )}
        <Link
          icon="eye-o"
          style={{ lineHeight: '30px', height: '28px' }}
          onClick={() => {
            this.context.router.history.push('/cooperate/plannedTicket/logs/import');
          }}
        >
          查看导入日志
        </Link>
      </React.Fragment>
    );
  };

  renderBulkActions = () => {
    const { actionType } = this.state;
    const workOrderAuditConfig = getAuditConfig('workOrderAudit');
    const hasSelected = _.get(this.props, 'selectedRows.length') > 0;

    return (
      <React.Fragment>
        {workOrderAuditConfig === 'true' ? (
          <Button
            type="primary"
            icon="plus-circle-o"
            style={{ marginRight: 20, verticalAlign: 'middle' }}
            onClick={this.handleBulkAction}
          >
            批量申请审批
          </Button>
        ) : null}
        {/* {auditConfig === 'true' ? <Button
        type={actionType === 'audit' ? 'primary' : null}
        ghost={actionType !== 'audit'}
        icon="plus-circle-o"
        style={{ marginRight: 20, verticalAlign: 'middle' }}
        onClick={() => this.toggleActionType('audit')}
      >
        批量申请审批
      </Button> : null}
      {actionType ? <Button
        ghost
        style={{ marginRight: 20, verticalAlign: 'middle' }}
        disabled={!hasSelected}
        onClick={this.handleBulkAction}
      >
        确定
      </Button> : null } */}
        <Button style={{ marginRight: 20, verticalAlign: 'middle' }} ghost onClick={this.toggleBulkActions}>
          取消
        </Button>
      </React.Fragment>
    );
  };

  toggleBulkActions = actionType => {
    this.setState({ showBulkActions: !this.state.showBulkActions });
    // 目前只有一个审批功能
    this.props.onBulkActionChange(actionType || null);
    // this.toggleActionType(null);
  };

  toggleActionType = actionType => {
    this.setState({ actionType });
    this.props.onBulkActionChange(actionType);
  };

  handleBulkAction = () => {
    const { actionType } = this.state;
    const { selectedRows, refetch } = this.props;
    if (actionType === 'audit') {
      const codes = selectedRows && selectedRows.map(({ code }) => code);
      applyForAudit(codes, () => {
        if (typeof refetch === 'function') {
          refetch();
        }
        this.toggleBulkActions();
      });
    }
  };

  render() {
    const { showBulkActions } = this.state;

    return <div style={{ padding: 20 }}>{showBulkActions ? this.renderBulkActions() : this.renderNormalActions()}</div>;
  }
}

Actions.contextTypes = {
  router: PropTypes.object,
};

export default Actions;
