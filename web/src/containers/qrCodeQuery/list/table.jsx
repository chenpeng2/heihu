import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';

import {
  message,
  Button,
  OpenImportModal,
  Attachment,
  Icon,
  Table as BasicTable,
  Tooltip,
  Badge,
  Link,
  openModal,
  buttonAuthorityWrapper,
  Spin,
  FormattedMessage,
} from 'src/components';
import { arrayIsEmpty } from 'src/utils/array';
import { keysToObj } from 'src/utils/parseFile';
import { replaceSign } from 'src/constants';
import { QUALITY_STATUS } from 'src/views/qualityManagement/constants';
import { primary, error, title } from 'src/styles/color';
import moment, { setDayStart } from 'src/utils/time';
import { importMaterialLot, batchClearQrcode } from 'src/services/stock/material';
import auth from 'src/utils/auth';
import log from 'src/utils/log';
import { getFractionString } from 'src/utils/number';
import { getValidityPeriodPrecision } from 'src/utils/organizationConfig';

import LinkToExport from './linkToExport';
import { LOCATION_STATUS, findLocationStatus, findTrallyingStatus, calTimeDiff } from '../utils';
import EnSureForClearQrcode from './enSureForClearQrcode';

const AttachmentInlineView = Attachment.InlineView;
const ButtonWithAuth = buttonAuthorityWrapper(Button);

type Props = {
  data: [],
  fetchData: () => {},
  style: {},
  pagination: {},
  filterHeight: number,
};

class Table extends Component {
  props: Props;
  state = {
    showRowSelection: false,
    selectedRowKeys: [],
    loading: false,
  };

  renderTipForTitle = (title, tipText) => {
    const { changeChineseToLocale } = this.context;

    return (
      <div>
        <Tooltip.AntTooltip title={changeChineseToLocale(tipText)}>
          <span style={{ marginRight: 5 }}>{changeChineseToLocale(title)}</span>
          <Icon type={'info-circle-o'} style={{ color: primary }} />
        </Tooltip.AntTooltip>
      </div>
    );
  };

  getRowSelection = () => {
    const { selectedRowKeys } = this.state;
    return {
      selectedRowKeys,
      getCheckboxProps: record => {
        const { status, inQC, inTrallying, inWeighing, key } = record || {};

        // 是否可以选择
        let disabled = false;

        // 转运中、发料中的二维码不可以置空
        if (status === LOCATION_STATUS.transfer.value || status === LOCATION_STATUS.allocation.value) {
          disabled = true;
        }

        // 业务状态不为空 的行不能被选择
        if (inQC || inTrallying || inWeighing) {
          disabled = true;
        }

        // 置空的二维码数量限制为100
        // 当这一行还没有被选中而且已选中的数量等于100的时候。disabeld
        if (Array.isArray(selectedRowKeys) && selectedRowKeys.length >= 100 && !selectedRowKeys.includes(key)) {
          disabled = true;
        }

        return { disabled };
      },
      onChange: selectedRowKeys => {
        this.setState({
          selectedRowKeys,
        });
      },
      onSelectAll: (selected, selectedRows, changeRows) => {
        const changeRowsLen = arrayIsEmpty(changeRows) ? 0 : changeRows.length;
        const selectedRowKeysLen = arrayIsEmpty(selectedRowKeys) ? 0 : selectedRowKeys.length;

        if (selected && changeRowsLen + selectedRowKeysLen > 100) {
          message.error('一次最多置空100条二维码');
          // 当选中全选，但是数量超过100的时候。这次需要将加的数据删除
          this.setState({ selectedRowKeys: _.pullAllBy(selectedRowKeys, changeRows, 'key') });
        }
      },
    };
  };

  getColumns = () => {
    const { changeChineseToLocale } = this.context;
    const { momentFormat, showFormat } = getValidityPeriodPrecision();

    return [
      {
        title: '位置状态',
        dataIndex: 'status',
        showAlways: 'true',
        width: 100,
        render: data => {
          const { name } = findLocationStatus(data) || {};

          return changeChineseToLocale(name) || replaceSign;
        },
      },
      {
        title: '二维码',
        dataIndex: 'code',
        showAlways: 'true',
        width: 180,
        render: data => {
          return data || replaceSign;
        },
      },
      {
        title: '物料编号／名称',
        dataIndex: 'material',
        showAlways: 'true',
        width: 180,
        render: data => {
          const { code, name } = data || {};
          return code && name ? `${code}/${name}` : replaceSign;
        },
      },
      {
        title: '规格描述',
        useColumnConfig: true,
        dataIndex: 'material',
        key: 'materialDesc',
        width: 200,
        render: data => {
          const { desc } = data || {};
          return desc || replaceSign;
        },
      },
      {
        title: '仓位编号／名称',
        dataIndex: 'storageInfo',
        showAlways: 'true',
        width: 200,
        render: data => {
          const { code, name } = data || {};
          return code && name ? `${code}/${name}` : replaceSign;
        },
      },
      {
        title: '数量',
        dataIndex: 'amount',
        showAlways: 'true',
        width: 200,
        render: (data, record) => {
          const { material, unitConversions } = record;
          const { unit } = material || {};

          let text = `${typeof data === 'number' ? data : replaceSign} ${unit || replaceSign}`;
          if (unitConversions && unitConversions.length) {
            unitConversions.forEach(n => {
              text += `，${n.amount} ${n.unit || replaceSign}`;
            });
          }
          return text;
        },
      },
      {
        title: '重量',
        key: 'weight',
        width: 200,
        render: (__, record) => {
          const { amount, unit } = _.get(record, 'weighDetail') || {};
          return amount && unit ? `${amount} ${unit}` : replaceSign;
        },
      },
      {
        title: '等级',
        key: 'level',
        width: 200,
        render: (__, record) => {
          const { level } = _.get(record, 'weighDetail') || {};
          return level || replaceSign;
        },
      },
      {
        title: '销售订单',
        useColumnConfig: true,
        width: 200,
        dataIndex: 'purchaseOrderCode',
        render: data => {
          return data || replaceSign;
        },
      },
      {
        title: '项目编号',
        useColumnConfig: true,
        width: 200,
        dataIndex: 'projectCode',
        render: data => {
          return data || replaceSign;
        },
      },
      {
        title: '质量状态',
        dataIndex: 'qcStatus',
        showAlways: 'true',
        width: 200,
        render: data => {
          if (!data) {
            return replaceSign;
          }

          const { name, color } = QUALITY_STATUS[data] || {};

          return <Badge.MyBadge text={changeChineseToLocale(name) || replaceSign} color={color} />;
        },
      },
      {
        title: '业务状态',
        key: 'inTrallying',
        showAlways: 'true',
        width: 200,
        render: (data, record) => {
          const { name, color } = findTrallyingStatus(record) || {};

          if (!name) return replaceSign;
          return <Badge.MyBadge text={changeChineseToLocale(name) || replaceSign} color={color} />;
        },
      },
      {
        title: '父级二维码',
        useColumnConfig: true,
        width: 200,
        dataIndex: 'containerCode',
        render: data => {
          return data || replaceSign;
        },
      },
      {
        title: '供应商编号／名称',
        useColumnConfig: true,
        width: 200,
        dataIndex: 'supplier',
        render: data => {
          const { code, name } = data || {};

          return code && name ? `${code}/${name}` : replaceSign;
        },
      },
      {
        title: '供应商批次',
        useColumnConfig: true,
        width: 200,
        dataIndex: 'mfgBatches',
        render: data => {
          const mfgBatchNos = [];
          if (Array.isArray(data)) {
            data.forEach(({ mfgBatchNo }) => mfgBatchNos.push(mfgBatchNo));
          }

          return arrayIsEmpty(mfgBatchNos) ? replaceSign : mfgBatchNos.join(',');
        },
      },
      {
        title: '入厂批次',
        useColumnConfig: true,
        width: 200,
        dataIndex: 'inboundBatch',
        render: data => {
          return data || replaceSign;
        },
      },
      {
        title: '生产批次',
        useColumnConfig: true,
        width: 200,
        dataIndex: 'productBatch',
        render: data => {
          return data || replaceSign;
        },
      },
      {
        title: this.renderTipForTitle('创建时间', '二维码的创建时间'),
        useColumnConfig: true,
        width: 200,
        dataIndex: 'createdAt',
        render: data => {
          if (!data) return replaceSign;
          return moment(data).format('YYYY/MM/DD HH:mm');
        },
      },
      {
        title: this.renderTipForTitle('使用时间', '使用时间=当前时间-二维码的创建时间'),
        useColumnConfig: true,
        width: 200,
        key: 'useTime',
        render: (__, record) => {
          const { createdAt } = record || {};
          if (!createdAt) return replaceSign;

          return calTimeDiff(createdAt, new Date());
        },
      },
      {
        title: '生产日期',
        useColumnConfig: true,
        width: 200,
        dataIndex: 'productionDate',
        render: data => {
          return data ? moment(data).format(showFormat) : replaceSign;
        },
      },
      {
        title: '有效期',
        useColumnConfig: true,
        width: 200,
        key: 'validityPeriod',
        render: (__, record) => {
          const { validityPeriod } = record || {};
          if (!validityPeriod) return replaceSign;

          return (
            <span
              style={{
                color: moment(moment(validityPeriod).format(momentFormat)).isBefore(moment().format(momentFormat))
                  ? error
                  : title,
              }}
            >
              {moment(validityPeriod).format(showFormat)}
            </span>
          );
        },
      },
      {
        title: '入厂规格',
        width: 200,
        useColumnConfig: true,
        dataIndex: 'specification',
        render: data => {
          const { unit } = data || {};

          const amount = getFractionString(data);
          return `${amount || replaceSign} ${unit || replaceSign}`;
        },
      },
      {
        title: '产地',
        width: 200,
        useColumnConfig: true,
        dataIndex: 'originPlace',
        render: data => {
          return typeof data === 'string' ? data : replaceSign;
        },
      },
      {
        title: '质检时间',
        useColumnConfig: true,
        width: 200,
        key: 'qualityInspectTime',
        render: (__, record) => {
          const { qualityInspectTime } = record || {};
          if (!qualityInspectTime) return replaceSign;

          return moment(qualityInspectTime).format('YYYY/MM/DD HH:mm');
        },
      },
      {
        title: '上次盘点时间',
        useColumnConfig: true,
        width: 200,
        dataIndex: 'trallyingAt',
        render: data => {
          if (!data) return replaceSign;

          return <span>{moment(data).format('YYYY/MM/DD HH:mm')}</span>;
        },
      },
      {
        title: '备注',
        useColumnConfig: true,
        width: 200,
        dataIndex: 'remark',
        render: data => {
          return data || replaceSign;
        },
      },
      {
        title: '附件',
        useColumnConfig: true,
        dataIndex: 'attachments',
        width: 200,
        render: data => {
          if (!Array.isArray(data) || !data.length) return replaceSign;

          return (
            <div style={{ color: primary, cursor: 'pointer' }}>
              <Link
                icon="paper-clip"
                onClick={() => {
                  openModal({
                    title: '附件',
                    footer: null,
                    children: <AttachmentInlineView files={data} />,
                  });
                }}
              />
              <span> {Array.isArray(data) ? data.length : 0} </span>
            </div>
          );
        },
      },
    ];
  };

  renderHeaderForRowSelection = () => {
    const { fetchData } = this.props;
    const { showRowSelection, selectedRowKeys } = this.state;

    if (showRowSelection) {
      return (
        <React.Fragment>
          <Button
            onClick={() => {
              if (Array.isArray(selectedRowKeys) && selectedRowKeys.length) {
                openModal({
                  width: 500,
                  children: <EnSureForClearQrcode amount={selectedRowKeys.length} />,
                  onOk: async () => {
                    this.setState({ loading: true });
                    try {
                      const res = await batchClearQrcode(selectedRowKeys);
                      const { status, data } = res || {};
                      const { data: messageData } = data || {};
                      // 批量置空二维码的时候。如果因为业务状态的原因部分成功需要有提示
                      if (!arrayIsEmpty(messageData)) {
                        message.error(messageData.join(','));
                      } else {
                        message.success('清空二维码成功');
                      }

                      if (status && status >= 200 && status < 300) {
                        this.setState({ showRowSelection: false, selectedRowKeys: [] }, () => {
                          // 清空二维码后需要重新拉取数据
                          if (typeof fetchData === 'function') {
                            fetchData();
                          }
                        });
                      }
                    } catch (e) {
                      log.error(e);
                    } finally {
                      this.setState({ loading: false });
                    }
                  },
                });
              } else {
                message.warn('请选择二维码');
              }
            }}
          >
            确认置空
          </Button>
          <Button
            onClick={() => {
              this.setState({ showRowSelection: false, selectedRowKeys: [] });
            }}
            type={'ghost'}
            style={{ marginLeft: 20 }}
          >
            取消
          </Button>
          <span style={{ marginLeft: 10, lineHeight: '28px' }}>
            <FormattedMessage
              defaultMessage={'已选{amount}条'}
              values={{
                amount: (
                  <span style={{ color: primary, margin: '0px 2px' }}>
                    {Array.isArray(selectedRowKeys) ? selectedRowKeys.length : 0}
                  </span>
                ),
              }}
            />
          </span>
        </React.Fragment>
      );
    }

    return null;
  };

  render() {
    const { data, fetchData, style, pagination, filterHeight } = this.props;
    const { showRowSelection, loading } = this.state;
    const columns = this.getColumns();

    const _data =
      Array.isArray(data) && data.length
        ? data.map(i => {
            if (i) i.key = i.id;
            return i;
          })
        : [];

    return (
      <Spin spinning={loading}>
        <div style={style}>
          <div style={{ display: 'flex', marginTop: 10 }}>
            {showRowSelection ? (
              <React.Fragment>{this.renderHeaderForRowSelection()}</React.Fragment>
            ) : (
              <React.Fragment>
                <LinkToExport style={{ float: 'right' }} />
                <ButtonWithAuth
                  auth={auth.WEB_EMPTY_MATERIAL_LOT}
                  onClick={() => {
                    this.setState({ showRowSelection: true });
                  }}
                  style={{ margin: '0px 20px' }}
                >
                  批量置空
                </ButtonWithAuth>
                <ButtonWithAuth
                  icon="download"
                  ghost
                  auth={auth.WEB_IMPORT_INIT_MATERIAL_LOT}
                  style={{ marginRight: 20 }}
                  onClick={() =>
                    OpenImportModal({
                      item: '二维码',
                      fileTypes: '.csv',
                      context: this.context,
                      templateUrl:
                        'https://s3.cn-northwest-1.amazonaws.com.cn/public-template/20190403/%E4%BA%8C%E7%BB%B4%E7%A0%81%E5%AF%BC%E5%85%A5%E6%A8%A1%E7%89%88.csv',
                      logUrl: '/stock/qrCode/importLog',
                      method: importMaterialLot,
                      titles: [
                        'qrCode',
                        'materialCode',
                        'amount',
                        'unitName',
                        'qcStatus',
                        'storageCode',
                        'supplierCode',
                        'validityPeriod',
                        'originPlaceTxt',
                        'remark',
                        'mfgBatchCode',
                      ],
                      dataFormat: (data, title) => {
                        // 将空字符串改为null
                        let res = keysToObj(data, title);
                        if (Array.isArray(res)) {
                          res = res.map(i => {
                            Object.keys(i).forEach(j => {
                              if (i[j] === '') i[j] = null;
                            });
                            return i;
                          });
                        }
                        return res;
                      },
                      listName: 'list',
                      fileDataStartLocation: 1,
                    })
                  }
                >
                  导入
                </ButtonWithAuth>
                <Link
                  icon="bars"
                  style={{ lineHeight: '30px', height: '28px' }}
                  onClick={() => {
                    this.context.router.history.push('/stock/qrCode/importLog');
                  }}
                >
                  查看导入日志
                </Link>
              </React.Fragment>
            )}
          </div>
          <BasicTable
            dragable
            hideDefaultSelections
            rowSelection={showRowSelection ? this.getRowSelection() : null}
            tableUniqueKey={'qrCodeQueryColumnConfig'}
            useColumnConfig
            style={{ margin: 0, marginTop: 22 }}
            scroll={{ y: window.innerHeight - filterHeight }} // 100页每条的时候的鼠标操作优化
            columns={columns}
            dataSource={_data || []}
            refetch={fetchData}
            pagination={pagination}
          />
        </div>
      </Spin>
    );
  }
}

Table.contextTypes = {
  router: PropTypes.any,
  changeChineseToLocale: PropTypes.func,
};

export default withRouter(Table);
