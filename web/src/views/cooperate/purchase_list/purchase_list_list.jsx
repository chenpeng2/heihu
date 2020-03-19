import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'antd';
import { withRouter } from 'react-router-dom';
import auth from 'utils/auth';
import { OpenModal, Button, Icon, ImportModal, Link, buttonAuthorityWrapper, PlainText } from 'components';
import { border, blacklakeGreen, warning } from 'src/styles/color';
import { getCustomLanguage } from 'src/utils/customLanguage';
import { setLocation } from 'utils/url';
import PurchaseListTable from 'src/containers/purchase_list/purchase_list_list/purchase_list_table';
import PurchaseListFilter from 'src/containers/purchase_list/purchase_list_list/purchase_list_filter';
import { ORGANIZATION_CONFIG, getOrganizationConfigFromLocalStorage } from 'src/utils/organizationConfig';
import {
  get_purchase_list_list,
  bulkUpdatePurchaseListState,
  importPurchaseList,
} from 'src/services/cooperate/purchase_list';
import { TABLE_UNIQUE_KEY } from 'src/views/cooperate/purchase_list/constants';
import { getFormatParams } from 'src/containers/purchase_list/util/getFormatParams';
import { getQuery } from 'src/routes/getRouteParams';
import { getTablePageSizeFromLocalStorage } from 'utils/localStorage';

type Props = {
  style: {},
  match: {},
  location: any,
};

const { AntModal } = OpenModal;
const ButtonWithAuth = buttonAuthorityWrapper(Button);
const customLanguage = getCustomLanguage();

class Purchase_List_List extends Component {
  props: Props;

  state = {
    purchase_list_data: [],
    purchase_list_total_amount: 0,
    loading: false,
    isBatchOperation: false,
    isBulkaction: false,
    visible: false,
    selectedRows: [],
  };

  componentWillMount() {
    const config = getOrganizationConfigFromLocalStorage();
    const pageSize = getTablePageSizeFromLocalStorage(TABLE_UNIQUE_KEY);
    this.setState({ config });
    this.fetch_purchase_list_list_data({ size: pageSize });
  }

  fetch_purchase_list_list_data = value => {
    const { match } = this.props;

    const query = getQuery(match);
    const { config } = this.state;
    const configValue =
      config &&
      config[ORGANIZATION_CONFIG.taskDispatchType] &&
      config[ORGANIZATION_CONFIG.taskDispatchType].configValue;
    const _params = { ...query, ...value };
    const params = getFormatParams(_params, configValue);
    this.setState({ loading: true });
    setLocation(this.props, () => ({ ..._params }));
    return get_purchase_list_list(params)
      .then(res => {
        const { data } = res || {};
        const { data: realData, total } = data || {};

        this.setState({
          purchase_list_total_amount: total,
          pagination: {
            current: params && params.page,
            total,
            pageSize: (params && params.size) || 10,
          },
          purchase_list_data: realData,
        });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  render_purchase_list_filter = () => {
    const { config } = this.state;
    const useQrCode = config && config.config_use_qrcode.configValue;
    return (
      <PurchaseListFilter
        useQrCode={useQrCode}
        fetch_purchase_list_data={params => {
          this.fetch_purchase_list_list_data(params);
        }}
      />
    );
  };

  render_purchase_list_table = (purchase_list_data, purchase_list_total_amount, loading, isBatchOperation) => {
    const { match } = this.props;
    const { isBulkaction, pagination } = this.state;
    return (
      <PurchaseListTable
        fetchData={p => this.fetch_purchase_list_list_data(p)}
        loading={loading}
        purchase_list_total_amount={purchase_list_total_amount}
        dataSource={purchase_list_data}
        isBatchOperation={isBatchOperation}
        selectRow={selectedRows => {
          this.setState({ selectedRows });
        }}
        isBulkaction={isBulkaction}
        match={match}
        pagination={pagination}
      />
    );
  };

  closeModal = () => {
    this.setState({ visible: false });
  };

  handleOk = () => {
    this.closeModal();
    const { selectedRows } = this.state;
    const query = getQuery(this.props.match);
    const params = selectedRows.map(n => ({
      toStatus: 'done',
      procureOrderCode: n.procureOrderCode,
    }));
    const noAppliedProcureOrders = selectedRows
      .filter(n => n.procureOrderStatus.status !== 1)
      .map(n => n.procureOrderCode);
    const confirmString = noAppliedProcureOrders.map((code, index) => {
      return `<${code}>${index === noAppliedProcureOrders.length - 1 ? '' : '，'}`;
    });
    const message =
      noAppliedProcureOrders.length === 0
        ? '结束成功'
        : `${customLanguage.procure_order}${confirmString.join('')}不是已申请状态，没有结束`;
    this.setState({ isBulkaction: true, isBatchOperation: true });
    bulkUpdatePurchaseListState({ procureOrders: params }).then(res => {
      this.fetch_purchase_list_list_data(query);
      this.setState({ isBulkaction: false, isBatchOperation: false, selectedRows: [] });
      Modal.success({
        title: '批量结束成功',
        content: message,
      });
    });
  };

  handleCancel = () => {
    this.closeModal();
  };

  renderFooter = () => {
    return (
      <div style={{ padding: '24px 0 6px', display: 'flex', justifyContent: 'center' }}>
        <Button style={{ width: 114, marginRight: 60 }} type={'default'} onClick={this.closeModal}>
          取消
        </Button>
        <Button style={{ width: 114 }} onClick={this.handleOk}>
          确定
        </Button>
      </div>
    );
  };

  renderConfirm = () => {
    const { selectedRows } = this.state;
    const { changeChineseToLocale } = this.context;
    const confirmString = selectedRows.map((n, index) => {
      return `<${n.procureOrderCode}>${index === selectedRows.length - 1 ? '' : '，'}`;
    });
    return (
      <div style={{ margin: '35px 0 36px 0', display: 'flex' }}>
        <div style={{ display: 'inline-block', marginRight: 14, marginTop: 10 }}>
          <Icon type={'exclamation-circle'} style={{ fontSize: 36, color: warning }} />
        </div>
        <div style={{ display: 'inline-block' }}>
          <div style={{ fontSize: 18 }}>{changeChineseToLocale('确定结束')}？</div>
          <div style={{ width: 320 }}>{changeChineseToLocale(`确定结束${confirmString}吗？`)}</div>
        </div>
      </div>
    );
  };

  renderActionButton = () => {
    const { selectedRows, visible } = this.state;
    const isEnabled = selectedRows && selectedRows.length;
    const isDisabled = selectedRows && selectedRows.length;
    const query = getQuery(this.props.match);
    return (
      <div style={{ display: 'flex', alignItems: 'center', margin: 20 }}>
        <Button
          disabled={!isEnabled}
          style={{ marginRight: 20 }}
          onClick={() => {
            const params = selectedRows.map(n => ({
              toStatus: 'applied',
              procureOrderCode: n.procureOrderCode,
            }));
            const noCreatedProcureOrders = selectedRows
              .filter(n => n.procureOrderStatus.status !== 4)
              .map(n => n.procureOrderCode);
            const confirmString = noCreatedProcureOrders.map((code, index) => {
              return `<${code}>${index === noCreatedProcureOrders.length - 1 ? '' : '，'}`;
            });
            const message =
              noCreatedProcureOrders.length === 0
                ? '提交成功'
                : `${customLanguage.procure_order}${confirmString.join('')}不是新建状态，没有提交`;
            this.setState({ isBulkaction: true, isBatchOperation: true });
            bulkUpdatePurchaseListState({ procureOrders: params }).then(res => {
              this.fetch_purchase_list_list_data(query);
              this.setState({ isBulkaction: false, isBatchOperation: false, selectedRows: [] });
              Modal.success({
                title: '批量提交成功',
                content: message,
              });
            });
          }}
        >
          批量提交
        </Button>
        <Button
          disabled={!isDisabled}
          style={{ color: blacklakeGreen }}
          onClick={() => {
            this.setState({ visible: true });
          }}
          type={'default'}
        >
          批量结束
        </Button>
        <Button
          style={{ marginLeft: 20 }}
          onClick={() => {
            this.setState({ isBatchOperation: false, selectedRows: [] });
          }}
          type={'default'}
        >
          取消
        </Button>
        <AntModal visible={visible} onOk={this.handleOk} onCancel={this.handleCancel} footer={null} width={420}>
          {this.renderConfirm()}
          {this.renderFooter()}
        </AntModal>
      </div>
    );
  };

  render_create_purchase_list_button = () => {
    const { config } = this.state;
    const configValue =
      config &&
      config[ORGANIZATION_CONFIG.taskDispatchType] &&
      config[ORGANIZATION_CONFIG.taskDispatchType].configValue;
    const useQrCode = config && config.config_use_qrcode.configValue;
    const path = '/cooperate/purchaseLists/create';
    let titles = null;
    let templateUrl = null;
    if (useQrCode === 'true') {
      if (configValue === 'manager') {
        titles = [
          'procureOrderCode',
          'operatorName',
          'supplierCode',
          'materialCode',
          'amountPlanned',
          'unitName',
          'purchaseOrderCode',
          'planWorkerOrderCode',
          'demandTime',
          'concernedPersonName',
          'note',
        ];
        templateUrl =
          'https://s3.cn-northwest-1.amazonaws.com.cn/public-template/20190323/1/%E9%87%87%E8%B4%AD%E6%B8%85%E5%8D%95%E6%A8%A1%E6%9D%BF.csv';
      } else {
        titles = [
          'procureOrderCode',
          'operatorName',
          'supplierCode',
          'materialCode',
          'amountPlanned',
          'unitName',
          'purchaseOrderCode',
          'projectCode',
          'demandTime',
          'concernedPersonName',
          'note',
        ];
        templateUrl =
          'https://s3.cn-northwest-1.amazonaws.com.cn/public-template/20190323/2/%E9%87%87%E8%B4%AD%E6%B8%85%E5%8D%95%E6%A8%A1%E6%9D%BF.csv';
      }
    } else if (configValue === 'manager') {
      titles = [
        'procureOrderCode',
        'operatorName',
        'materialCode',
        'amountPlanned',
        'unitName',
        'purchaseOrderCode',
        'planWorkerOrderCode',
        'demandTime',
        'concernedPersonName',
        'note',
      ];
      templateUrl =
        'https://s3.cn-northwest-1.amazonaws.com.cn/public-template/20190323/3/%E9%87%87%E8%B4%AD%E6%B8%85%E5%8D%95%E6%A8%A1%E6%9D%BF.csv';
    } else {
      titles = [
        'procureOrderCode',
        'operatorName',
        'materialCode',
        'amountPlanned',
        'unitName',
        'purchaseOrderCode',
        'projectCode',
        'demandTime',
        'concernedPersonName',
        'note',
      ];
      templateUrl =
        'https://s3.cn-northwest-1.amazonaws.com.cn/public-template/20190323/4/%E9%87%87%E8%B4%AD%E6%B8%85%E5%8D%95%E6%A8%A1%E6%9D%BF.csv';
    }

    return (
      <div>
        {!this.state.isBatchOperation ? (
          <div style={{ margin: '20px', display: 'flex' }}>
            <ButtonWithAuth
              auth={auth.WEB_CREATE_PROCURE_ORDER}
              icon="plus-circle-o"
              onClick={() => {
                this.context.router.history.push(path);
              }}
            >
              <PlainText
                style={{ textIndent: 8 }}
                text="创建{customLanguage}"
                intlParams={{ customLanguage: `${customLanguage.procure_order}` }}
              />
            </ButtonWithAuth>
            <ButtonWithAuth
              icon="piliangcaozuo"
              iconType="gc"
              auth={auth.WEB_EDIT_PROCURE_ORDER}
              ghost
              style={{ marginLeft: 20 }}
              onClick={() => {
                this.setState({ isBatchOperation: true });
              }}
            >
              批量操作
            </ButtonWithAuth>
            <ButtonWithAuth
              icon="download"
              ghost
              style={{ marginLeft: 20 }}
              auth={auth.WEB_CREATE_PROCURE_ORDER}
              onClick={() =>
                ImportModal({
                  item: customLanguage.procure_order,
                  titles,
                  templateUrl,
                  logUrl: '/cooperate/purchaseLists/import',
                  method: importPurchaseList,
                  fileTypes: '.csv',
                  context: this.context,
                  listName: 'procureOrders',
                  onSuccess: res => {
                    if (sensors) {
                      sensors.track('web_cooperate_purchaseLists_create', {
                        CreateMode: 'Excel导入',
                        amount: res.success,
                      });
                    }
                  },
                })
              }
            >
              导入
            </ButtonWithAuth>
            <Link
              icon="eye"
              style={{ lineHeight: '30px', height: '28px', marginLeft: 20 }}
              onClick={() => {
                this.context.router.history.push('/cooperate/purchaseLists/import');
              }}
            >
              查看导入日志
            </Link>
          </div>
        ) : (
          this.renderActionButton()
        )}
      </div>
    );
  };

  render_line = () => {
    return <div style={{ borderTop: `1px solid ${border}` }} />;
  };

  render() {
    const { style } = this.props;
    const { purchase_list_data, purchase_list_total_amount, loading, isBatchOperation } = this.state;

    return (
      <div style={style}>
        {this.render_purchase_list_filter()}
        {this.render_line()}
        {this.render_create_purchase_list_button()}
        {this.render_purchase_list_table(purchase_list_data, purchase_list_total_amount, loading, isBatchOperation)}
      </div>
    );
  }
}

Purchase_List_List.contextTypes = {
  router: PropTypes.object.isRequired,
  changeChineseToLocale: PropTypes.func,
};

export default withRouter(Purchase_List_List);
