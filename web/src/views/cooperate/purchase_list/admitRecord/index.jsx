import React, { Component } from 'react';
import _ from 'lodash';
import Proptypes from 'prop-types';
import auth from 'utils/auth';
import {
  RestPagingTable,
  Tooltip,
  openModal,
  Link as AntLink,
  Spin,
  withForm,
  InputNumber,
  message,
  FormItem,
  Select,
  ImagePreview,
  buttonAuthorityWrapper,
  TagTemplateTypeSelect,
  TagTemplateSelect,
  Icon,
} from 'components';
import { amountValidator } from 'components/form';
import {
  replaceSign,
  rawMaterialLabel,
  semiFinishedMaterialLabel,
  RAW_MATERIAL_TAG_TYPE,
  SEMI_FINISHED_MATERIAL_TAG_TYPE,
} from 'src/constants';
import { qcStatus } from 'src/views/qualityManagement/constants';
import moment from 'utils/time';
import { orange, primary } from 'styles/color';
import { getQuery } from 'routes/getRouteParams';
import { queryESignatureStatus } from 'services/knowledgeBase/eSignature';
import { ORGANIZATION_CONFIG, getOrganizationConfigFromLocalStorage } from 'utils/organizationConfig';
import withLodop from 'src/utils/LodopFuncs';
import {
  purchaseInFactoryRecord,
  purchaseUpdatePrintCount,
  purchaseListBulkInfo,
} from 'services/cooperate/purchase_list';
import { getPrintTemplate } from 'services/electronicTag';
import { wrapUrl, download } from 'utils/attachment';
import { thousandBitSeparator } from 'utils/number';
import AdmitRecordModel from 'models/cooperate/purchase/AdmitRecordModel';
import styles from './styles.scss';
import Header from './Header';
import Footer from './Footer';
import { useQrCode, taskDispatchType } from '../utils';

const Link = buttonAuthorityWrapper(AntLink);
const Option = Select.Option;
const DefaultType = RAW_MATERIAL_TAG_TYPE;

type Props = {
  form: any,
  history: any,
  match: {},
  getLodop: () => {},
};

type State = {
  model: AdmitRecordModel,
  defaultTemplateFileId: Number,
};

/** 入厂记录 */
class PurchaseAdmitRecord extends Component {
  props: Props;
  state: State;

  constructor(props) {
    super(props);
    const model = AdmitRecordModel.of();
    this.state = {
      loading: false,
      printLabel: false,
      signStatus: false,
      visible: false,
      selectedRows: [],
      devices: [],
      codeAmount: [],
      selectedDeviceIndex: null,
      data: null,
      hasPrinted: '',
      model,
      pagination: {},
      sortInfo: {},
    };
  }

  async componentWillMount() {
    const { match } = this.props;
    const query = getQuery(match);
    const {
      data: { data: signStatus },
    } = await queryESignatureStatus('procure_order_in');
    this.fetchData(query || {});
    this.getDefaultTemplate(DefaultType);
    this.setState({ signStatus });
  }

  fetchData = query => {
    const { page = 1 } = query || {};
    const { match } = this.props;
    const { params } = match;
    const { id } = params || {};
    this.setState({ loading: true });
    purchaseInFactoryRecord({ ...query, procureOrderId: id, size: 10 })
      .then(res => {
        const { data } = res || {};
        const { data: realData, total } = data || {};
        this.setState({ data: realData, pagination: { total, current: page, pageSize: 10 } });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  getDefaultTemplate = type => {
    getPrintTemplate({ type: type || RAW_MATERIAL_TAG_TYPE })
      .then(res => {
        const data = _.get(res, 'data.data');
        const { attachmentId } = data || {};
        this.setState({ defaultTemplateFileId: attachmentId });
      })
      .catch(err => console.log(err));
  };

  getReplaceData = data => {
    const {
      code,
      material,
      inboundBatch,
      amount,
      productionDate,
      validPeriod,
      operator,
      createdAt,
      supplierBatch,
      supplier,
      note,
      storageInfo,
      unitName,
      qcStatus,
      inspectionTime,
      procureOrderCode,
    } = data || {};
    const { code: materialCode, name, desc } = material || {};
    const storage_info = (storageInfo && storageInfo.name) || '';
    const amount_unit = (amount && `${amount}${unitName}`) || '';
    const production_date = (productionDate && moment(Number(productionDate)).format('YYYY/MM/DD')) || '';
    const validity_period = (validPeriod && moment(Number(validPeriod)).format('YYYY/MM/DD')) || '';
    const operator_name = (operator && operator.name) || '';
    const last_update_time = (createdAt && moment(createdAt).format('YYYY/MM/DD hh:mm:ss')) || '';
    const supplier_code = (supplier && `${supplier.code}/${supplier.name}`) || '';
    const qc_status = this.getFormatQCStatus(qcStatus);
    const replaceData = {
      material_code: materialCode || '',
      material_name: name || '',
      qr_code: code || '',
      storage_info,
      amount_unit,
      inbound_batch: inboundBatch || '',
      production_date,
      validity_period,
      operator_name,
      last_update_time,
      description: desc || '',
      supplier_code,
      mfg_batches: supplierBatch || '',
      inbound_note: note || '',
      quality_inspect_time: inspectionTime || '',
      qc_status,
      procure_order_code: procureOrderCode || '',
    };
    return replaceData;
  };

  getFormatQCStatus(status) {
    switch (status) {
      case 1:
        return qcStatus[1];
      case 2:
        return qcStatus[2];
      case 3:
        return qcStatus[3];
      case 4:
        return qcStatus[4];
      case 5:
        return qcStatus[5];
      default:
        return '';
    }
  }

  lodopPrint = (dataToWrite, selectedDeviceIndex) => {
    const { getLodop } = this.props;
    const lodop = getLodop();
    if (lodop) {
      lodop.SET_PRINTER_INDEX(selectedDeviceIndex);
      if (lodop.SET_PRINTER_INDEX(selectedDeviceIndex)) {
        lodop.SET_PRINT_MODE('SEND_RAW_DATA_ENCODE', 'UTF-8');
        lodop.SEND_PRINT_RAWDATA(dataToWrite);
      }
    }
  };

  writeToSelectedPrinter = ({ type, fileId }, data) => {
    const { selectedRows, selectedDeviceIndex, data: columnsData, model } = this.state;
    if (fileId) {
      if (selectedDeviceIndex || selectedDeviceIndex === 0) {
        download(
          wrapUrl(fileId),
          '',
          fileData => {
            const reader = new FileReader();
            reader.readAsText(fileData);
            reader.addEventListener('loadend', () => {
              const dataStr = reader.result;
              let printLabel = [];
              switch (type) {
                case RAW_MATERIAL_TAG_TYPE:
                  printLabel = rawMaterialLabel;
                  break;
                case SEMI_FINISHED_MATERIAL_TAG_TYPE:
                  printLabel = semiFinishedMaterialLabel;
                  break;
                default:
                  message.error('没有该类型模板');
              }
              // 需要联排打印时的处理
              const _matchField = [];
              printLabel.forEach(n => {
                const params = n.substring(1, n.length - 1);
                const _reg = new RegExp(`\\$${params}_[0-9]+\\$`, 'gim');
                _matchField.push(dataStr.match(_reg));
              });
              if (_matchField[0]) {
                const columns = _matchField[0].length;
                const _data = [];
                for (let i = 0, len = data.length; i < len; i += columns) {
                  const part = data.slice(i, i + columns);
                  if (part.length < columns) {
                    for (let j = 0; j < columns - part.length; j += 1) {
                      part.push({});
                    }
                  }
                  _data.push(part);
                }
                let allDataToWrite = '';
                _data.forEach(n => {
                  let dataToWrite = dataStr;
                  n.forEach((m, index) => {
                    const replaceData = this.getReplaceData(m);
                    printLabel.forEach(n => {
                      const params = n.substring(1, n.length - 1);
                      const reg = new RegExp(`\\$${params}_${index + 1}\\$`, 'gim');
                      dataToWrite = dataToWrite.replace(reg, replaceData[params]);
                    });
                  });
                  allDataToWrite += dataToWrite;
                });
                this.lodopPrint(allDataToWrite, selectedDeviceIndex);
              } else {
                let allDataToWrite = '';
                data.forEach(n => {
                  let dataToWrite = dataStr;
                  const replaceData = this.getReplaceData(n);
                  printLabel.forEach(n => {
                    const params = n.substring(1, n.length - 1);
                    const reg = new RegExp(`\\$${params}\\$`, 'gim');
                    dataToWrite = dataToWrite.replace(reg, replaceData[params]);
                  });
                  allDataToWrite += dataToWrite;
                });
                this.lodopPrint(allDataToWrite, selectedDeviceIndex);
              }
              const items = [];
              selectedRows.forEach(n => {
                const codeAmount = n.codeAmount || 1;
                items.push({ id: n.id, printCount: codeAmount });
              });
              purchaseUpdatePrintCount({ items }).then(() => {
                columnsData.forEach(n => {
                  selectedRows.forEach(m => {
                    if (n.id === m.id) {
                      const codeAmount = m.codeAmount || 1;
                      n.printCount += codeAmount;
                    }
                  });
                });
                this.setState({ data: columnsData });
              });
              message.success('发送打印请求成功，请查看打印机');
              model.printing = false;
              this.setState({ model });
            });
          },
          true,
        );
      } else {
        message.error('请确认连接好打印机并选择');
        model.printing = false;
        this.setState({ model });
      }
    } else {
      message.error('请确认是否上传对应模板');
      model.printing = false;
      this.setState({ model });
    }
  };

  /** 保存 */
  onSave = () => {
    const {
      form: { validateFieldsAndScroll },
    } = this.props;
    const { selectedRows, model, selectedType } = this.state;
    model.printing = true;
    this.setState({ model });

    const data = [];
    const qrCodes = [];
    selectedRows.forEach(row => {
      const { codeAmount, code } = row;
      if (codeAmount > 1) {
        for (let i = 0; i < codeAmount; i += 1) {
          data.push(row);
        }
      } else {
        data.push(row);
      }
      if (code) {
        qrCodes.push(code);
      }
    });
    validateFieldsAndScroll(async (err, values) => {
      if (err) return null;
      this.getBulkInfo(qrCodes)
        .then(res => {
          const newData = this.updateBulkInfo(data, res);
          const { tagTemplateFileId: fileId, tagTemplateType: type } = values || {};
          this.writeToSelectedPrinter({ type, fileId }, newData);
        })
        .catch(() => {});
    });
  };

  /** 更新物料信息 */
  updateBulkInfo(data, res) {
    if (!Array.isArray(data) || !Array.isArray(res)) {
      return data;
    }
    const newData = [];
    for (let i = 0; i < data.length; i++) {
      const dataItem = data[i];
      for (let j = 0; j < res.length; j++) {
        const resItem = res[j];
        if (dataItem && resItem && dataItem.code === resItem.code) {
          const { operator, material, supplier } = dataItem;
          const {
            operatorName,
            amount,
            storageInfo,
            materialUnit,
            lastOperatorTime,
            qcStatus,
            inspectionTime,
            validationPeriod,
            materialDesc,
            materialName,
            materialCode,
            inboundBatch,
            inboundNote,
            supplier: newSupplier,
            mfgBatches,
            procureOrderCode,
          } = resItem;
          let supplierBatch = '';
          if (Array.isArray(mfgBatches)) {
            mfgBatches.forEach((batch, index) => {
              const { mfgBatchNo } = batch;
              const seprator = index === 0 ? '' : '，';
              supplierBatch += `${seprator}${mfgBatchNo}`;
            });
          }
          const newItem = {
            ...dataItem,
            amount,
            storageInfo,
            unitName: materialUnit,
            createdAt: lastOperatorTime,
            qcStatus,
            inspectionTime,
            validPeriod: validationPeriod,
            note: inboundNote,
            supplierBatch,
            procureOrderCode,
          };
          if (operatorName && operator) {
            newItem.operator = {
              ...operator,
              name: operatorName,
            };
          }
          if (supplier && newSupplier) {
            newItem.supplier = {
              ...supplier,
              code: newSupplier.code,
              name: newSupplier.name,
            };
          }
          if (material) {
            newItem.material = {
              ...material,
              name: materialName,
              code: materialCode,
              inboundBatch,
              desc: materialDesc,
            };
          }
          newData.push(newItem);
          break;
        }
      }
    }
    return newData;
  }

  getBulkInfo(params) {
    return new Promise((resolve, reject) => {
      this.setState({ loading: true });
      purchaseListBulkInfo(params)
        .then(res => {
          this.setState({ loading: false });
          if (!res) {
            reject();
            return;
          }
          const { data } = res;
          if (!data) {
            reject();
            return;
          }
          const { data: result } = data;
          if (!Array.isArray(result)) {
            reject();
            return;
          }
          resolve(result);
        })
        .catch(() => {
          this.setState({ loading: false });
          reject();
        });
    });
  }

  getColumns = () => {
    const { form, match } = this.props;
    const { signStatus, hasPrinted, visible, sortInfo } = this.state;
    const query = getQuery(match);
    const page = query.page || 1;
    const { getFieldDecorator } = form;
    const base_render = data => (data ? <Tooltip text={data} length={15} /> : replaceSign);
    const { printLabel } = this.state;
    const checkOption = (value, label) => (
      <div
        className={styles.checkOption}
        onClick={() => {
          this.fetchData({ hasPrinted: value });
          this.setState({ hasPrinted: value, visible: false });
        }}
      >
        <span style={{ marginLeft: 10 }}>{label}</span>
      </div>
    );
    const renderDate = date => (date ? moment(Number(date)).format('YYYY/MM/DD') : replaceSign);
    return [
      {
        title: '打印二维码的数量',
        key: 'codeAmount',
        index: 'codeAmount',
        hidden: !printLabel,
        width: 150,
        render: (data, record, index) => {
          const { codeAmount, selectedRows } = this.state;
          const isSelected = selectedRows.map(n => n.id).findIndex(n => n === record.id) !== -1;
          const amount = codeAmount[page === 1 ? index : index + 10 * page];
          const defaultAmount = isSelected ? 1 : null;
          return (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <FormItem>
                {getFieldDecorator(`codeAmount[${page === 1 ? index : index + 10 * page}]`, {
                  initialValue: (amount && Number(amount.split('/')[0])) || defaultAmount,
                  rules: [
                    {
                      validator: amountValidator(100, { value: 0, equal: false, message: '数字必需大于0' }, 'integer'),
                    },
                  ],
                })(
                  <InputNumber
                    onChange={value => {
                      codeAmount[page === 1 ? index : index + 10 * page] = `${value}/${record.code}`;
                      selectedRows.forEach(n => {
                        if (n.code === record.code) {
                          n.codeAmount = value;
                        }
                      });
                      this.setState({ codeAmount, selectedRows });
                    }}
                    disabled={!isSelected}
                    style={{ marginRight: 5 }}
                    placeholder={'请输入'}
                  />,
                )}
              </FormItem>
              个
            </div>
          );
        },
      },
      {
        title: (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            已打印数量
            <Tooltip
              trigger="click"
              placement="bottom"
              visible={visible}
              onVisibleChange={visible => {
                this.setState({ visible });
              }}
              getPopupContainer={() => document.getElementsByClassName(styles.purchaseAdmitRecord)[0]}
              title={
                <div style={{ width: 100, padding: '10px 0' }}>
                  {checkOption('', '全部')}
                  {checkOption(1, '已打印')}
                  {checkOption(0, '未打印')}
                </div>
              }
            >
              <Icon style={{ color: primary, fontSize: 15 }} type="filter" />
              <span style={{ color: primary, marginLeft: 3, cursor: 'pointer' }}>
                {hasPrinted === '' ? '全部' : hasPrinted === 0 ? '未打印' : '已打印'}
              </span>
            </Tooltip>
          </div>
        ),
        dataIndex: 'printCount',
        key: 'printCount',
        hidden: !printLabel,
        width: 160,
        render: data => thousandBitSeparator(data),
      },
      {
        title: '二维码',
        dataIndex: 'code',
        key: 'code',
        hidden: !useQrCode,
        width: 100,
      },
      {
        title: '物料编号/名称',
        dataIndex: 'material',
        key: 'materialCode',
        width: 260,
        sorter: true,
        sortOrder: sortInfo.columnKey === 'materialCode' && sortInfo.order,
        render: material => {
          const { code, name } = material || {};
          if (code && name) {
            return <Tooltip text={`${code} / ${name}`} length={20} />;
          }
          return null;
        },
      },
      {
        title: '物料数量',
        dataIndex: 'amount',
        width: 180,
        key: 'amount',
        render: (amount, record) => {
          const text = amount > 0 ? `${thousandBitSeparator(amount)}${record.unitName}` : replaceSign;
          return text;
        },
      },
      {
        title: '操作时间',
        dataIndex: 'createdAt',
        width: 160,
        key: 'createdAt',
        render: createdAt => (createdAt ? moment(createdAt).format('YYYY/MM/DD hh:mm:ss') : replaceSign),
      },
      {
        title: '订单编号',
        dataIndex: 'purchaseOrderCode',
        width: 180,
        key: 'purchaseOrderCode',
        render: base_render,
      },
      {
        title: taskDispatchType === 'manager' ? '计划工单编号' : '项目编号',
        dataIndex: taskDispatchType === 'manager' ? 'planWorkOrderCode' : 'projectCode',
        width: 180,
        key: 'projectCode',
        render: base_render,
      },
      {
        title: '入厂位置',
        dataIndex: 'storageInfo',
        width: 240,
        key: 'admitStorage',
        render: storageInfo => (storageInfo && storageInfo.name) || replaceSign,
      },
      signStatus && {
        title: '电子签名人',
        dataIndex: 'signer',
        width: 140,
        key: 'signer',
        render: signer => (signer && signer.name) || replaceSign,
      },
      {
        title: '操作人',
        dataIndex: 'operator',
        width: 140,
        key: 'operator',
        render: operator => (operator && operator.name) || replaceSign,
      },
      {
        title: '供应商',
        dataIndex: 'supplier',
        key: 'supplier',
        width: 180,
        render: supplier => (supplier && supplier.name) || replaceSign,
      },
      {
        title: '供应商批次',
        dataIndex: 'supplierBatch',
        key: 'demandTime',
        width: 150,
        render: base_render,
      },
      {
        title: '入厂规格',
        dataIndex: 'specification',
        key: 'specification',
        width: 180,
        render: specification => {
          return (
            <div>
              {specification ? `${specification.numerator}${specification.unitName || replaceSign}` : replaceSign}
            </div>
          );
        },
      },
      {
        title: '产地',
        dataIndex: 'province',
        key: 'province',
        width: 150,
        render: (province, record) => (province ? `${province} ${record.city}` : replaceSign),
      },
      {
        title: '入厂批次',
        dataIndex: 'inboundBatch',
        key: 'inboundBatch',
        width: 150,
        render: base_render,
      },
      {
        title: '生产日期',
        dataIndex: 'productionDate',
        key: 'productionDate',
        width: 150,
        render: renderDate,
      },
      {
        title: '有效期',
        dataIndex: 'validPeriod',
        key: 'validPeriod',
        width: 150,
        render: renderDate,
      },
      {
        title: '入厂记录',
        dataIndex: 'note',
        key: 'note',
        width: 200,
        render: (data, record) => {
          const { attachmentIds } = record;
          return (
            <div>
              {data ? <Tooltip text={data} length={15} /> : replaceSign}
              {attachmentIds && attachmentIds.length ? (
                <Link
                  style={{ marginLeft: 20 }}
                  onClick={() => {
                    openModal({
                      title: '附件',
                      footer: null,
                      width: 600,
                      children: (
                        <div>
                          <div style={{ display: 'inline-block', margin: '20px 0 0 20px' }}>
                            {attachmentIds.map(id => (
                              <ImagePreview url={id} filename={''} />
                            ))}
                          </div>
                        </div>
                      ),
                    });
                  }}
                >
                  附件
                </Link>
              ) : null}
            </div>
          );
        },
      },
    ].filter(x => x && !x.hidden);
  };

  onCancel = () => {
    this.setState({ printLabel: false });
  };

  renderFooter() {
    const { data, selectedRows, printLabel, model } = this.state;
    if (!printLabel) return null;
    const disabled = !(data && data.length) || !selectedRows.length || model.printing;
    return <Footer disabled={disabled} onCancel={this.onCancel} onSave={this.onSave} />;
  }

  /** table变化 */
  handleTableChange = async (pagination, filters, sorter, extra) => {
    const { current = 1, pageSize = 10 } = pagination || {};
    if (sorter && sorter.columnKey) {
      const { order, columnKey } = sorter;
      this.setState({ sortInfo: sorter });
      await this.fetchData({
        page: current,
        order: order === 'ascend' ? 'ASC' : 'DESC',
        sortBy: columnKey,
        size: pageSize,
      });
    } else {
      await this.fetchData({ page: current, size: pageSize });
    }
    this.setState({ pagination });
  };

  render() {
    const { form, getLodop } = this.props;
    const { getFieldDecorator, getFieldValue } = form || {};
    const { loading, data, printLabel, total, devices, model, defaultTemplateFileId, pagination } = this.state;
    const _selectedRows = this.state.selectedRows || [];
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        const multiSelectedRows = _selectedRows.concat(selectedRows);
        this.setState({ selectedRows: _.uniqBy(multiSelectedRows, 'code') });
      },
      onSelect: (record, selected) => {
        if (!selected) {
          const selectedRows = _selectedRows.filter(n => n.code !== record.code);
          this.setState({ selectedRows });
        }
      },
      onSelectAll: (selected, selectedRows, changeRows) => {
        if (!selected) {
          const diffSelectedRows = _selectedRows.filter(n => {
            return changeRows.map(m => m.code).indexOf(n.code) === -1;
          });
          this.setState({ selectedRows: diffSelectedRows });
        }
      },
      selectedRowKeys: (_selectedRows && _selectedRows.map(n => n.code)) || [],
    };
    const columns = _.compact(this.getColumns());
    const spinning = loading || model.printing;
    const tagTypes = [RAW_MATERIAL_TAG_TYPE, SEMI_FINISHED_MATERIAL_TAG_TYPE];
    return (
      <Spin spinning={spinning}>
        <div className={styles.purchaseAdmitRecord}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Header />
            {!printLabel && useQrCode ? (
              <Link
                auth={auth.WEB_PRINT_PROCURE_IN_FACTORY_TAG}
                style={{ marginRight: 20 }}
                icon="dayin"
                iconType="gc"
                onClick={() => {
                  const lodop = getLodop();
                  let devices = [];
                  if (lodop) {
                    const printNum = lodop.GET_PRINTER_COUNT();
                    devices = new Array((printNum || 1) + 1)
                      .join(0)
                      .split('')
                      .map((_, index) => ({
                        label: lodop.GET_PRINTER_NAME(index),
                        key: index,
                      }));
                  }
                  this.setState({ printLabel: true, devices });
                }}
              >
                打印入厂标签
              </Link>
            ) : null}
          </div>
          {printLabel ? (
            <React.Fragment>
              <FormItem label="选择标签模板">
                {getFieldDecorator('tagTemplateType', {
                  initialValue: RAW_MATERIAL_TAG_TYPE,
                })(
                  <TagTemplateTypeSelect
                    onChange={this.getDefaultTemplate}
                    types={tagTypes}
                    style={{ width: 300, height: 32, marginTop: 5, marginRight: 10 }}
                  />,
                )}
                {getFieldDecorator('tagTemplateFileId', {
                  initialValue: defaultTemplateFileId,
                })(
                  <TagTemplateSelect
                    type={getFieldValue('tagTemplateType')}
                    style={{ width: 300, height: 32, marginTop: 5 }}
                  />,
                )}
              </FormItem>
              <FormItem label="选择打印设备">
                <Select
                  labelInValue
                  onChange={value => {
                    this.setState({ selectedDeviceIndex: value.key });
                  }}
                  style={{ width: 300, height: 32, marginTop: 5 }}
                >
                  {devices.map(n => (
                    <Option key={n.key} value={n.key}>
                      {n.label}
                    </Option>
                  ))}
                </Select>
              </FormItem>
              <div style={{ color: orange, margin: '5px 0 5px 20px' }}>
                标签字段：二维码、物料名称、物料编号、数量&单位、仓位、入厂批次、质检日期、有效期、操作人、质量状态、规格描述、供应商、供应商批次、入厂备注
              </div>
            </React.Fragment>
          ) : null}
          <RestPagingTable
            dataSource={data}
            refetch={this.fetchData}
            onChange={this.handleTableChange}
            pagination={pagination}
            rowSelection={printLabel ? rowSelection : null}
            rowKey={record => record.code}
            total={total}
            columns={columns}
            purchaseAdmitRecord
            scroll={{ x: true, y: printLabel ? 430 : false }}
            key={printLabel ? 'admitrecord' : 'normalRecord'}
          />
          {this.renderFooter()}
        </div>
      </Spin>
    );
  }
}

PurchaseAdmitRecord.contextTypes = {
  changeChineseToLocale: Proptypes.func,
};

export default withForm({}, withLodop(PurchaseAdmitRecord));
