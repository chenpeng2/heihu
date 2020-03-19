import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

import { formatTodayUnderline, format } from 'utils/time';
import { exportXlsxFile } from 'utils/exportFile';
import { queryDeliverRecordList } from 'src/services/stock/deliverRecord';
import { queryESignatureStatus } from 'services/knowledgeBase/eSignature';
import { FormattedMessage, selectAllExport, Spin, Icon, Button, Checkbox } from 'src/components';
import log from 'src/utils/log';

import Table from './table';

type Props = {
  refetch: () => {},
  userQrCode: boolean,
  isSearch: Boolean,
  data: {},
  exportParams: {},
  loading: boolean,
};

class LgTransfersList extends Component {
  props: Props;
  state = {
    config: [],
    signStatus: false,
    isBatchOperation: false,
    isAllChecked: false,
    loading: false,
    selectedAmount: 0,
    selectedRows: [],
    exportTitle: [],
  };

  async componentWillMount() {
    const { data } = await queryESignatureStatus('material_lot_deliver');
    const signStatus = _.get(data, 'data.signStatus');
    this.setState({ signStatus });
  }

  componentWillReceiveProps(nextProps) {
    const { isSearch } = nextProps;
    if (isSearch) {
      this.setState({ selectedRows: [], isAllChecked: false, selectedAmount: 0 });
    }
  }

  formatExportData = data => {
    const { userQrCode } = this.props;
    const { signStatus } = this.state;
    const _data = data.map(x => {
      let qcStatus = '';
      switch (x.qcStatus) {
        case 1:
          qcStatus = '合格';
          break;
        case 2:
          qcStatus = '让步合格';
          break;
        case 3:
          qcStatus = '待检';
          break;
        case 4:
          qcStatus = '不合格';
          break;
        default:
          qcStatus = '未知';
      }
      const {
        qrcode,
        materialInfo,
        containerQrcode,
        amount,
        projectCode,
        storage,
        operator,
        orderNumber,
        productBatch,
        customerName,
        digitalSignatureUserName,
        createdAt,
        remark,
        hash,
        changed,
        weighDetail,
      } = x || {};
      const { level, amount: weighAmount, unit: weighUnit } = weighDetail || {};
      const { code, name, unit } = materialInfo || {};
      const obj = {
        qrcode,
        materialCode: code,
        materialName: name,
        containerQrCode: containerQrcode,
        amount: typeof amount === 'number' ? String(amount) : null,
        unit,
        weight: weighAmount && weighUnit ? `${weighAmount} ${weighUnit}` : null,
        level,
        projectCode,
        qcStatus,
        storage: (storage && storage.name) || null,
        operator: (operator && operator.name) || null,
        orderNumber,
        productBatch,
        customerName,
        signer: digitalSignatureUserName || null,
        createdAt: createdAt ? format(createdAt) : null,
        remark,
        hashed: hash ? '是' : '否',
        changed: hash && changed ? '是' : '否',
      };
      if (!userQrCode) {
        delete obj.qrcode;
        delete obj.containerQrCode;
      }
      if (!signStatus) {
        delete obj.signer;
      }
      return obj;
    });
    return _data.map(x => Object.values(x));
  };

  dataExport = data => {
    const headers = this.state.exportTitle;
    const values = this.formatExportData(data || []);
    exportXlsxFile([headers, ...values], `出厂记录数据_${formatTodayUnderline()}`);
  };

  handleExport = () => {
    const { exportParams } = this.props;
    const { selectedRows, selectedAmount, isAllChecked } = this.state;
    if (isAllChecked) {
      selectAllExport(
        {
          width: '30%',
        },
        {
          selectedAmount,
          getExportData: async params => {
            const headers = this.state.exportTitle;
            const res = await queryDeliverRecordList({ ...exportParams, ...params }).catch(e => log.error(e));
            const exportData = _.get(res, 'data.data') || {};
            const values = this.formatExportData(exportData || []);
            return [headers, ...values];
          },
          fileName: `出厂记录数据_${formatTodayUnderline()}`,
        },
      );
    } else {
      this.dataExport(selectedRows);
    }
  };

  render() {
    const { data, refetch, loading: initialLoading, userQrCode, isSearch } = this.props;
    const { isBatchOperation, selectedAmount, isAllChecked, loading, signStatus } = this.state;
    const { changeChineseToLocale } = this.context;

    return (
      <Spin spinning={initialLoading || loading}>
        <div id="lgDeliver_list" key={'deliver'} style={{ marginTop: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 20px', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {!isBatchOperation ? (
                <div style={{ lineHeight: '28px' }}>
                  <Icon type="bars" />
                  <span>{changeChineseToLocale('出厂记录')}</span>
                </div>
              ) : (
                <Checkbox
                  style={{ marginLeft: 23 }}
                  checked={isAllChecked}
                  onChange={e => {
                    const checked = e.target.checked;
                    const selectedAmount = checked ? data.total || 0 : 0;
                    this.setState({ isAllChecked: checked, selectedAmount });
                  }}
                >
                  全选
                </Checkbox>
              )}
              {isBatchOperation ? (
                <div style={{ marginLeft: 20 }}>
                  <Button disabled={selectedAmount === 0} style={{ width: 80, height: 28 }} onClick={this.handleExport}>
                    确定
                  </Button>
                  <Button
                    style={{ width: 80, height: 28, margin: '0 20px' }}
                    type={'default'}
                    onClick={() => {
                      this.setState({ isBatchOperation: false, isAllChecked: false });
                    }}
                  >
                    取消
                  </Button>
                  <FormattedMessage defaultMessage={'已选{amount}条'} values={{ amount: selectedAmount }} />
                </div>
              ) : null}
            </div>
            {!isBatchOperation ? (
              <Button
                icon="upload"
                onClick={() => {
                  this.setState({ isBatchOperation: true });
                }}
                disabled={data && data.total === 0}
              >
                批量导出
              </Button>
            ) : null}
          </div>
          <Table
            refetch={refetch}
            signStatus={signStatus}
            isSearch={isSearch}
            userQrCode={userQrCode}
            data={data}
            isBatchOperation={isBatchOperation}
            isAllChecked={isAllChecked}
            handleSelect={selectedRows => {
              this.setState({ selectedRows, selectedAmount: selectedRows.length });
            }}
            getExportTitle={exportTitle => {
              this.setState({ exportTitle });
            }}
          />
        </div>
      </Spin>
    );
  }
}

LgTransfersList.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default withRouter(LgTransfersList);
