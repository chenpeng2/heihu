import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { formatTodayUnderline, format } from 'utils/time';
import { thousandBitSeparator } from 'utils/number';
import { error, primary, border } from 'src/styles/color';
import { queryVinitRecordList } from 'src/services/stock/vinitRecord';
import { queryESignatureStatus } from 'services/knowledgeBase/eSignature';
import {
  Link,
  RestPagingTable,
  Spin,
  Tooltip,
  Badge,
  openModal,
  Attachment,
  Icon,
  Button,
  selectAllExport,
} from 'src/components';
import { getCustomLanguage } from 'src/utils/customLanguage';
import { replaceSign } from 'src/constants';

type Props = {
  match: any,
  userQrCode: boolean,
  refetch: () => {},
  exportParams: {},
  data: [],
  loading: boolean,
};
const MyBadge = Badge.MyBadge;
const AttachmentImageView = Attachment.ImageView;
const customLanguage = getCustomLanguage();

class vinitRecordList extends Component {
  props: Props;
  state = {
    signStatus: false,
  };

  async componentWillMount() {
    const res = await queryESignatureStatus('procure_order_in');
    const signStatus = _.get(res, 'data.data');
    const res1 = await queryESignatureStatus('material_lot_admit');
    const signStatus1 = _.get(res1, 'data.data');
    this.setState({ signStatus: signStatus || signStatus1 });
  }

  getMfgBatchesStr = mfgBatches => {
    return mfgBatches.map(n => `${n.materialCode}: ${n.mfgBatchNo}`).join('; ');
  };

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
      const obj = {
        qrcode: x.qrcode || '',
        materialCode: x.materialInfo.code || '',
        materialName: x.materialInfo.name || '',
        amount: typeof x.opeAmount ? String(x.opeAmount) : '',
        unit: x.opeUnit || '',
        storage: x.storage.name || '',
        supplierCode: x.supplierCode || '',
        supplierName: x.supplierName || '',
        mfgBatches: x.mfgBatches ? this.getMfgBatchesStr(x.mfgBatches) : '',
        qcStatus,
        orderNumber: x.orderNumber || '',
        operator: x.operator.name || '',
        signer: x.digitalSignatureUserName || '',
        createdAt: x.createdAt ? format(x.createdAt) : '',
        remark: x.remark || '',
        hash: x.hash ? '是' : '否',
        changed: x.hash && x.changed ? '是' : '否',
      };
      if (!userQrCode) {
        delete obj.qrcode;
        delete obj.supplierCode;
        delete obj.supplierName;
        delete obj.mfgBatches;
      }
      if (!signStatus) {
        delete obj.signer;
      }
      return obj;
    });
    return _data.map(x => Object.values(x));
  };

  getColumnsTitle = () => {
    const title = [];
    this.getColumns()
      .filter(n => n && n.title !== '附件')
      .forEach(n => {
        const index = n.title.indexOf('编号/');
        const amountIndex = n.title.indexOf('数量');
        if (index !== -1) {
          title.push(`${n.title.substring(0, index)}编号`);
          title.push(`${n.title.substring(0, index)}名称`);
        } else if (amountIndex !== -1) {
          title.push('数量');
          title.push('单位');
        } else {
          title.push(n.title);
        }
      });
    return title;
  };

  dataExport = exportParams => {
    const { data } = this.props;
    selectAllExport(
      {
        width: '30%',
      },
      {
        selectedAmount: (data && data.total) || 0,
        getExportData: async params => {
          const headers = this.getColumnsTitle();
          const res = await queryVinitRecordList({ ...exportParams, ...params });
          const exportData = _.get(res, 'data.data', []);
          const values = this.formatExportData(exportData);
          return [headers, ...values];
        },
        fileName: `入厂记录数据_${formatTodayUnderline()}`,
      },
    );
  };

  getColumns = () => {
    const { userQrCode } = this.props;
    const { signStatus } = this.state;
    const { router, changeChineseToLocale } = this.context;

    const columns = [
      userQrCode
        ? {
            title: '二维码',
            dataIndex: 'qrcode',
            width: 200,
            render: (qrCode, record) => {
              return qrCode || replaceSign;
            },
          }
        : null,
      {
        title: '物料编号/名称',
        dataIndex: 'materialInfo',
        width: 200,
        render: materialInfo => (
          <div>
            <Tooltip text={materialInfo.code || replaceSign} length={14} />
            <br />
            <Tooltip text={materialInfo.name || replaceSign} length={14} />
          </div>
        ),
      },
      {
        title: '数量',
        key: 'amount',
        width: 100,
        render: (__, record) => {
          const { opeAmount, opeUnit } = record || {};
          return (
            <div key={`amount-${record.id}`}>
              {thousandBitSeparator(opeAmount)} {opeUnit || replaceSign}
            </div>
          );
        },
      },
      {
        title: '入厂仓位',
        dataIndex: 'storage',
        width: 150,
        key: 'storage',
        render: storage => storage.name || replaceSign,
      },
      userQrCode
        ? {
            title: '供应商编号/名称',
            dataIndex: 'supplierCode',
            width: 150,
            key: 'storage',
            render: (supplierCode, record) => {
              return (supplierCode && `${supplierCode}/${record.supplierName}`) || replaceSign;
            },
          }
        : null,
      userQrCode
        ? {
            title: '供应商批次',
            width: 150,
            dataIndex: 'mfgBatches',
            render: (mfgBatches, record) => {
              const mfgBatchNo = mfgBatches ? this.getMfgBatchesStr(mfgBatches) : replaceSign;
              return mfgBatchNo || replaceSign;
            },
          }
        : null,
      {
        title: '质量状态',
        dataIndex: 'qcStatus',
        key: 'qcStatus',
        width: 150,
        render: qcStatus => {
          let status = {};
          switch (qcStatus) {
            case 1:
              status = {
                color: primary,
                text: '合格',
              };
              break;
            case 2:
              status = {
                color: primary,
                text: '让步合格',
              };
              break;
            case 3:
              status = {
                color: border,
                text: '待检',
              };
              break;
            case 4:
              status = {
                color: error,
                text: '不合格',
              };
              break;
            default:
              status = {};
          }
          return <MyBadge text={status.text} color={status.color} />;
        },
      },
      {
        title: customLanguage.procure_order,
        width: 150,
        dataIndex: 'orderNumber',
        render: data => {
          return data || replaceSign;
        },
      },
      {
        title: '操作人',
        dataIndex: 'operator',
        width: 100,
        key: 'operator',
        render: (operator, record) => _.get(operator, 'name', replaceSign),
      },
      signStatus && {
        title: '电子签名人',
        dataIndex: 'digitalSignatureUserName',
        width: 100,
        key: 'digitalSignatureUserName',
        render: digitalSignatureUserName => digitalSignatureUserName || replaceSign,
      },
      {
        title: '操作时间',
        dataIndex: 'createdAt',
        width: 100,
        render: (createdAt, record) => {
          const getFormatDate = timestamp => {
            if (!timestamp) {
              return '';
            }
            return format(Number(timestamp), 'YYYY/MM/DD HH:mm');
          };
          return <span key={`createdAt-${record.id}`}>{getFormatDate(createdAt)}</span>;
        },
      },
      {
        title: '备注',
        dataIndex: 'remark',
        width: 200,
        key: 'remark',
        render: remark => <Tooltip text={remark || replaceSign} length={12} />,
      },
      {
        title: '区块链认证',
        key: 'block',
        width: 150,
        render: (__, record) => {
          const { hash } = record || {};
          if (hash) return changeChineseToLocale('是');
          return changeChineseToLocale('否');
        },
      },
      {
        title: '是否篡改',
        key: 'changed',
        width: 150,
        render: (__, record) => {
          const { hash } = record || {};
          if (hash) return changeChineseToLocale('是');
          return changeChineseToLocale('否');
        },
      },
      {
        title: '附件',
        dataIndex: 'attachments',
        width: 100,
        render: data => {
          if (Array.isArray(data) && data.length) {
            return (
              <Link
                icon="paper-clip"
                onClick={() => {
                  openModal({
                    title: '附件',
                    footer: null,
                    children: (
                      <AttachmentImageView
                        attachment={{
                          files: data.map(file => {
                            return {
                              ...file,
                              id: file,
                              originalFileName:
                                file.originalFileName || file.original_filename || file.originalFilename,
                              originalExtension: file.original_extension || file.originalExtension,
                            };
                          }),
                        }}
                      />
                    ),
                  });
                }}
              >
                <span style={{ color: primary, cursor: 'pointer' }}>{data.length}</span>
              </Link>
            );
          }

          return replaceSign;
        },
      },
    ];
    return columns;
  };

  render() {
    const { data, refetch, loading, userQrCode, exportParams } = this.props;
    const { changeChineseToLocale } = this.context;
    const columns = this.getColumns().filter(n => n);

    return (
      <Spin spinning={loading}>
        <div id="vinit_list" key={'vinit'} style={{ marginTop: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 20px', marginBottom: 10 }}>
            <div style={{ lineHeight: '28px' }}>
              <Icon type="bars" />
              <span>{changeChineseToLocale('入厂记录')}</span>
            </div>
            <Button
              icon="upload"
              onClick={() => {
                this.dataExport(exportParams);
              }}
              disabled={data && data.total === 0}
            >
              批量导出
            </Button>
          </div>
          <RestPagingTable
            dataSource={(data && data.data) || []}
            total={data && data.total}
            rowKey={record => record.id}
            scroll={{ x: true }}
            columns={columns}
            bordered
            refetch={refetch}
          />
        </div>
      </Spin>
    );
  }
}

vinitRecordList.contextTypes = {
  router: PropTypes.object.isRequired,
  changeChineseToLocale: PropTypes.any,
};

export default withRouter(vinitRecordList);
