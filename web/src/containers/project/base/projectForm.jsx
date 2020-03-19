// 任务派遣方式为工人管控式领取和工人非管控式领取时,才有项目的创建和编辑
import React, { Component } from 'react';
import _, { isEqual, get } from 'lodash';

import { Textarea, Attachment, withForm, Form, FormItem, Input, InputNumber, Select, DatePicker } from 'src/components';
import SearchSelect from 'src/components/select/searchSelect';
import {
  amountValidator,
  checkStringLength,
  chineseValidator,
  nullCharacterVerification,
  supportSpecialCharacterValidator,
  checkTwoSidesTrim,
} from 'src/components/form';
import moment from 'src/utils/time';
import { getMbomByMaterialCodeAndVersion } from 'src/services/bom/mbom';
import { getProcessRoutingByCode } from 'src/services/bom/processRouting';
import { getEbomDetail, getEbomByMaterialCodeAndVersion } from 'src/services/bom/ebom';
import { getQcConfigByIds } from 'src/services/qcConfig';
import { getPurchaseOrderDetail } from 'src/services/cooperate/purchaseOrder';
import { queryMaterialDetail } from 'src/services/bom/material';
import { warning, fontSub } from 'src/styles/color';
import { replaceSign } from 'src/constants';
import { getAttachments } from 'src/services/attachment';
import { getOrganizationConfigFromLocalStorage } from 'src/utils/organizationConfig';
import ProductBatchCodeRuleSelect from 'src/containers/plannedTicket/base/productBatchCodeRuleSelect';
import ProductBatchCodeSelect from 'src/containers/plannedTicket/base/productBatchCodeSelect';

import Table from './table';
import EbomTable from './ebomTable';
import PurchaseOrderSelect from './purchaseOrderSelect';
import MaterialSelect from './materialSelect';
import { PROJECT_TYPES } from '../constant';
import { setDefaultValueForCraft, getAttachmentTips, AttachmentPromptStyle, AttachmentTipStyle } from '../utils';

const Option = Select.Option;
const baseFormItemStyle = { width: 300 };

// 拿单个工艺路线数据中已经有qcConfigDetails
const formatProcessList = async processList => {
  const res = [];
  if (Array.isArray(processList)) {
    for (let i = 0; i < processList.length; i += 1) {
      const { nodes } = processList[i];
      for (let j = 0; j < nodes.length; j += 1) {
        res.push({
          ...nodes[j],
          name: nodes[j].processName,
        });
      }
    }
  }

  return res;
};

// 拿生产bom列表数据中没有qcConfigDetails 需要自己取
const formatProcessListForMbom = async processList => {
  const res = [];
  if (Array.isArray(processList)) {
    for (let i = 0; i < processList.length; i += 1) {
      const { nodes } = processList[i];
      for (let j = 0; j < nodes.length; j += 1) {
        const { qcConfigs, inputMaterials, outputMaterial } = nodes[j];
        const qcConfigsData = Array.isArray(qcConfigs) && qcConfigs.length ? await getQcConfigByIds(qcConfigs) : null;
        const { data } = qcConfigsData || {};
        const { data: realData } = data || {};
        res.push({
          ...nodes[j].process,
          inputMaterials,
          outputMaterial,
          nodeCode: nodes[j].nodeCode,
          qcConfigDetails: realData,
        });
      }
    }
  }

  return res;
};

type Props = {
  form: any,
  disabledList: {
    projectCode: boolean,
    product: boolean,
    amount: boolean,
    purchaseOrder: boolean,
    managers: boolean,
    startTimePlanned: boolean,
    endTimePlanned: boolean,
    processRouting: boolean,
    mBom: boolean,
    createByPurchaseOrder: boolean,
  }, // 处理编辑的时候的disabled
  initialData: {},
};

class ProjectForm extends Component {
  props: Props;
  state = {
    activeProduct: null,
    showMbomOrProcessRouting: null,
    listData: [],
    ebomData: [],
    helpMessageForTime: null,
    bindEBomToProcessRouting: false,
    showPurchaseOrderSelect: false, // 面向销售订单的时候才可以选择销售订单
    productBatchType: null,
    materialTargetDate: null,
  };

  componentDidMount() {
    this.setInitialValue();
  }

  componentWillReceiveProps(nextProps) {
    const { initialData } = this.props;
    const { initialData: nextInitialData } = nextProps;
    if (!isEqual(initialData, nextInitialData)) {
      this.setInitialValue(nextProps);
    }
  }

  setInitialValue = props => {
    const { initialData, form } = props || this.props;
    if (!initialData) return;

    const {
      projectCode,
      product,
      amountProductPlanned,
      purchaseOrder,
      managers,
      startTimePlanned,
      endTimePlanned,
      processRouting,
      mbomVersion,
      attachments,
      ebom,
      type,
      description,
      productBatchType,
      productBatchNumberRule,
      ...rest
    } = initialData;

    const { code, name, unit, desc } = product || {};
    const { id, purchaseOrderCode } = purchaseOrder || {};
    const { code: processRoutingCode, name: processRoutingName } = processRouting || {};
    const { id: ebomId, version: ebomVersion } = ebom || {};

    const activeProduct = { unitName: unit, code, name, desc };

    const _attachments =
      Array.isArray(attachments) && attachments.length > 0
        ? attachments.map(a => {
          const { original_extension, original_filename, uri, id } = a;
          return {
            originalExtension: original_extension,
            originalFileName: original_filename,
            url: uri,
            id,
            restId: id,
          };
        })
        : null;

    let _showMbomOrProcessRouting = null;
    if (processRouting) {
      _showMbomOrProcessRouting = 'processRouting';
    }
    if (mbomVersion) {
      _showMbomOrProcessRouting = 'mbom';
    }
    if (ebom && processRouting) {
      _showMbomOrProcessRouting = 'processRoutingAndEbom';
    }

    if (productBatchType === 2) {
      const { ruleId } = productBatchNumberRule || {};
      this.props.form.setFieldsValue({
        productBatchNumberRuleId: ruleId,
      });
    }

    this.setState(
      {
        showMbomOrProcessRouting: _showMbomOrProcessRouting,
        activeProduct,
        showPurchaseOrderSelect: type === 2, // 是否展示销售订单的选择
        productBatchType: productBatchType || 1,
      },
      async () => {
        form.setFieldsValue({
          projectType: type,
          processRouting: processRouting
            ? { key: processRoutingCode, label: `${processRoutingCode}/${processRoutingName}` }
            : null,
          mbom: mbomVersion ? { key: mbomVersion, label: mbomVersion } : null,
          type: _showMbomOrProcessRouting,
          product: code && name ? { key: code, label: `${code}/${name}` } : null,
          projectCode,
          amountProductPlanned,
          purchaseOrder: purchaseOrderCode ? { key: purchaseOrderCode, label: purchaseOrderCode } : null,
          managerIds: Array.isArray(managers) ? managers.map(({ id, name }) => ({ key: id, label: name })) : null,
          startTimePlanned: startTimePlanned && moment(startTimePlanned),
          endTimePlanned: endTimePlanned && moment(endTimePlanned),
          attachments: _attachments,
          ebom: ebom ? { key: ebomId, label: ebomVersion } : null,
          remark: description,
          productBatchType: productBatchType || 1,
          ...rest,
        });

        if (purchaseOrderCode) {
          this.setPurchaseOrderData(purchaseOrderCode);
        }

        if (_showMbomOrProcessRouting === 'processRouting') {
          this.setProcessRoutingProcessData(processRoutingCode);
        }

        if (_showMbomOrProcessRouting === 'mbom') {
          this.setMBomProcessData(code, mbomVersion);
        }

        if (_showMbomOrProcessRouting === 'processRoutingAndEbom' && ebom) {
          this.setEBomMaterialData(code, ebomVersion);
          this.setProcessRoutingProcessData(processRoutingCode);
        }
      },
    );
  };

  setProcessRoutingProcessData = async processRoutingCode => {
    const res = await getProcessRoutingByCode({ code: processRoutingCode });

    const { data } = res || {};
    const { data: realData } = data || {};
    const { processList } = realData || {};

    formatProcessList(processList).then(res => {
      this.setState({
        listData: res,
        bindEBomToProcessRouting: false,
      });
    });
  };

  setMBomProcessData = async (code, mbomVersion) => {
    const res = await getMbomByMaterialCodeAndVersion({ code, version: mbomVersion });
    const { data } = res || {};
    const { data: realData } = data || {};
    const { processList, bindEBomToProcessRouting, ebomVersion } = realData || {};

    formatProcessListForMbom(processList).then(res => {
      this.setState({
        ebomData: [],
        listData: res,
        bindEBomToProcessRouting,
      });
      if (ebomVersion && bindEBomToProcessRouting === false) this.setEBomMaterialData(code, ebomVersion);
    });
  };

  setEBomMaterialData = async (code, ebomVersion) => {
    // const res = await getEbomDetail(ebomId);
    const res = await getEbomByMaterialCodeAndVersion({ code, version: ebomVersion });
    const { data } = res || {};
    const { data: ebom_detail } = data || {};
    const { rawMaterialList } = ebom_detail || {};

    const ebomData = Array.isArray(rawMaterialList)
      ? rawMaterialList.map(item => {
        const { material, amount, currentUnit } = item || {};
        return { material, amount, currentUnit };
      })
      : [];

    this.setState({
      ebomData,
    });
  };

  setPurchaseOrderData = (purchaseOrderCode, needFiles) => {
    if (purchaseOrderCode) {
      getPurchaseOrderDetail(purchaseOrderCode).then(async res => {
        const materialList = _.get(res, 'data.data.materialList');
        const { initialData } = this.props;
        const { orderMaterialId } = initialData || {};
        let materialTargetDate;

        if (orderMaterialId) {
          const materialLine = _.find(materialList, o => o.id === orderMaterialId);
          materialTargetDate = materialLine && materialLine.targetDate;
        }

        const fileIds = _.get(res, 'data.data.attachments');
        const filesRes = await getAttachments(fileIds);
        const files = _.get(filesRes, 'data.data');

        const newState = {
          materialTargetDate,
          purchaseOrderCode,
        };

        if (needFiles) {
          newState.files = Array.isArray(files)
            ? files.map(i => {
              const { original_filename, id } = i || {};

              return {
                originalFileName: original_filename,
                restId: id,
                id,
              };
            })
            : [];
        }

        this.setState(newState, () => {
          this.props.form.validateFields(['endTimePlanned', 'startTimePlanned'], { force: true });
        });
      });
    } else {
      this.setState({
        purchaseOrderTargetDate: replaceSign,
      });
    }
  };

  getFormValue = () => {
    const { form } = this.props;
    const { validateFields } = form;

    let res = null;

    validateFields((error, value) => {
      if (!error) {
        res = value;
      }
    });
    return res;
  };

  onChangeForMaterialSelect = (value, option) => {
    if (!value) {
      this.setState({
        listData: [],
        ebomData: [],
        showMbomOrProcessRouting: false,
        activeProduct: null,
      });
      this.props.form.resetFields(['ebom', 'processRouting', 'mbom', 'type']);
      return;
    }
    const { form } = this.props;

    const { key } = option;
    this.props.form.setFieldsValue({ orderMaterialId: _.get(option, 'props.orderMaterialId') });
    this.setState({ materialTargetDate: _.get(option, 'props.targetDate') });

    queryMaterialDetail(key).then(res => {
      const data = _.get(res, 'data.data');

      this.setState(
        {
          activeProduct: data,
        },
        () => {
          form.resetFields(['ebom', 'processRouting', 'mbom', 'type']);
          this.setState({
            listData: [],
            ebomData: [],
            bindEBomToProcessRouting: false,
            showMbomOrProcessRouting: false,
          });
        },
      );
    });
  };

  renderLabel = text => {
    return <span style={{ color: fontSub }}>{text}</span>;
  };

  onChangeForProcessRouting = async value => {
    const { key: code } = value || {};
    if (code) {
      const res = await getProcessRoutingByCode({ code });

      const { data } = res || {};
      const { data: realData } = data || {};
      const { processList } = realData || {};

      formatProcessList(processList).then(res => {
        this.setState({
          listData: res,
          bindEBomToProcessRouting: false,
        });
      });
    } else {
      this.setState({
        listData: [],
      });
    }
  };

  renderProcessRouting = () => {
    const { form: { getFieldDecorator }, disabledList } = this.props;
    return (
      <FormItem>
        {getFieldDecorator('processRouting', {
          rules: [{ required: true, message: '工艺路线编号和名称必填' }],
          onChange: this.onChangeForProcessRouting,
        })(
          <SearchSelect
            type={'processRouting'}
            style={baseFormItemStyle}
            params={{ status: 1 }}
            disabled={disabledList && disabledList.processRouting}
            placeholder={'工艺路线编号／名称'}
          />,
        )}
      </FormItem>
    );
  };

  getCallBacksForSetDefaultValueForCraft = value => {
    const callBacks = {};
    if (value === 'mbom') {
      callBacks.cbForMbom = this.onChangeForMbom;
    }
    if (value === 'processRoutingAndEbom') {
      callBacks.cbForEbom = this.onChangeForEBom;
      callBacks.cbForProcessRouting = this.onChangeForProcessRouting;
    }
    if (value === 'processRouting') {
      callBacks.cbForProcessRouting = this.onChangeForProcessRouting;
    }

    return callBacks;
  };

  onChangeForMbom = async (value, code) => {
    const { key: mbomVersion } = value || {};

    if (code && mbomVersion) {
      const res = await getMbomByMaterialCodeAndVersion({ code, version: mbomVersion });
      const { data } = res || {};
      const { data: realData } = data || {};
      const { processList, bindEBomToProcessRouting, ebomVersion } = realData || {};

      formatProcessListForMbom(processList).then(res => {
        this.setState({
          ebomData: [],
          listData: res,
          bindEBomToProcessRouting,
        });
        if (ebomVersion && bindEBomToProcessRouting === false) this.setEBomMaterialData(code, ebomVersion);
      });
    } else {
      this.setState({
        listData: [],
        ebomData: [],
      });
    }
  };

  renderMBom = () => {
    const { form: { getFieldDecorator }, disabledList } = this.props;

    const { activeProduct } = this.state;
    if (!activeProduct) return null;

    const { code } = activeProduct;

    // status: 1表示启用
    return (
      <FormItem key={`mbom-${code}`}>
        {getFieldDecorator('mbom', {
          rules: [{ required: true, message: '生产bom编号和名称必填' }],
          onChange: value => this.onChangeForMbom(value, code),
        })(
          <SearchSelect
            type={'mbom'}
            style={baseFormItemStyle}
            params={{ materialCode: code, status: 1 }}
            disabled={disabledList && disabledList.mBom}
            placeholder={'生产bom版本号'}
          />,
        )}
      </FormItem>
    );
  };

  onChangeForEBom = async value => {
    if (value) {
      const res = await getEbomDetail(value.key);
      const { data } = res || {};
      const { data: ebom_detail } = data || {};
      const { rawMaterialList } = ebom_detail || {};

      const ebomData = Array.isArray(rawMaterialList)
        ? rawMaterialList.map(item => {
          const { material, amount, currentUnit } = item || {};
          return { material, amount, currentUnit };
        })
        : [];

      this.setState({
        ebomData,
      });
    } else {
      this.setState({
        ebomData: [],
      });
    }
  };

  renderEBom = () => {
    const { activeProduct } = this.state;
    if (!activeProduct) return null;

    const { form: { getFieldDecorator }, disabledList } = this.props;
    const { code } = activeProduct || {};

    // status: 1表示启用
    return (
      <FormItem key={`ebom-${code}`}>
        {getFieldDecorator('ebom', {
          rules: [{ required: true, message: '物料清单版本号必填' }],
          onChange: this.onChangeForEBom,
        })(
          <SearchSelect
            placeholder={'物料清单版本号'}
            type={'ebomExact'}
            params={{ productMaterialCode: code, status: 1 }}
            style={baseFormItemStyle}
            disabled={disabledList && disabledList.ebom}
          />,
        )}
      </FormItem>
    );
  };

  renderProcessRoutingAndEbom = () => {
    const style = { display: 'inline-block' };
    return (
      <React.Fragment>
        <div style={{ ...style, marginRight: 10 }}>{this.renderProcessRouting()}</div>
        <div style={style}>{this.renderEBom()}</div>
      </React.Fragment>
    );
  };

  isTaskDispatchEqualWorkerWeak = () => {
    const config = getOrganizationConfigFromLocalStorage();

    return config ? (_.get(config, 'config_task_dispatch_type.configValue') === 'worker_weak') : false;
  };

  codeFormatCheck = name => {
    return (rule, value, callback) => {
      const re = /^[\w\s\*\u00b7\_\/\.\-\uff08\uff09\&\(\)]+$/;
      if (value && !re.test(value)) {
        callback(`${name}只能由英文字母、数字、*·_ /-.,中文括号,英文括号,&,空格组成`);
      }
      callback();
    };
  };

  render() {
    const { form, form: { getFieldDecorator, getFieldValue }, disabledList, editing, initialData } = this.props;
    const {
      ebomData,
      activeProduct,
      showMbomOrProcessRouting,
      listData,
      bindEBomToProcessRouting,
      showPurchaseOrderSelect,
      productBatchType,
      materialTargetDate,
    } = this.state;
    const { orderMaterialId } = initialData || {};

    const { unitName, desc: productDesc } = activeProduct || {};

    return (
      <Form>
        <FormItem label={'项目类型'}>
          {getFieldDecorator('projectType', {
            rules: [
              {
                required: true,
                message: '项目类型必填',
              },
            ],
            onChange: v => {
              if (v === PROJECT_TYPES.purchaseOrderType.value) {
                this.setState({ showPurchaseOrderSelect: true });
              } else {
                this.setState({ showPurchaseOrderSelect: false });
              }
              // 清除订单相关的数据
              this.setPurchaseOrderData();
            },
          })(
            <Select style={baseFormItemStyle} disabled={disabledList && disabledList.projectType}>
              {Object.values(PROJECT_TYPES).map(i => {
                const { name, value } = i;
                return (
                  <Option value={value} key={value}>
                    {name}
                  </Option>
                );
              })}
            </Select>,
          )}
        </FormItem>
        {showPurchaseOrderSelect ? (
          <FormItem label={'销售订单'}>
            {getFieldDecorator('purchaseOrder', {
              onChange: v => {
                const purchaseOrderCode = _.get(v, 'key');
                this.setPurchaseOrderData(purchaseOrderCode, true);
              },
            })(
              <PurchaseOrderSelect
                style={baseFormItemStyle}
                disabled={disabledList && disabledList.purchaseOrder}
              />,
            )}
            {/* <span style={{ marginLeft: 10, color: fontSub }}>
              {`订单交期：${this.state.purchaseOrderTargetDate || replaceSign}`}
            </span> */}
          </FormItem>
        ) : null}
        <FormItem label={this.renderLabel('项目编号')}>
          {getFieldDecorator('projectCode', {
            rules: [
              { required: true, message: '项目编号必填' },
              {
                validator: checkStringLength(50),
              },
              {
                validator: chineseValidator('项目编号'),
              },
              {
                validator: checkTwoSidesTrim('项目编号'),
              },
              {
                validator: supportSpecialCharacterValidator('项目编号'),
              },
            ],
          })(<Input style={baseFormItemStyle} disabled={disabledList && disabledList.projectCode} />)}
        </FormItem>
        <FormItem label={this.renderLabel('产出物料')}>
          {getFieldDecorator('product', {
            rules: [
              {
                required: true,
                message: '产出物料必填',
              },
              {
                validator: (rule, value, cb) => {
                  const status = get(value, 'material.status', undefined);
                  if (status !== undefined && status === 0) return cb('产出物料不能选择停用中的物料');
                  cb();
                },
              },
            ],
          })(
            <MaterialSelect
              purchaseOrderCode={this.state.purchaseOrderCode}
              allowClear
              showTargetDate={!orderMaterialId && !editing}
              params={{ status: 'enable' }}
              style={baseFormItemStyle}
              disabled={disabledList && disabledList.product}
              onChange={this.onChangeForMaterialSelect}
            // onSelect={(value, option) => {
            //   this.props.form.setFieldsValue({ orderMaterialId: _.get(option, 'props.orderMaterialId') });
            //   this.setState({ materialTargetDate: _.get(option, 'props.targetDate') });
            // }}
            />,
          )}
          {orderMaterialId ?
            <span style={{ marginLeft: 10 }}>
              {`物料交货日期：${materialTargetDate ? moment(materialTargetDate).format('YYYY-MM-DD') : replaceSign}`}
            </span> : null}
        </FormItem>
        <FormItem label="" style={{ display: 'none' }}>
          {getFieldDecorator('orderMaterialId')(
            <Input />,
          )}
        </FormItem>
        <FormItem label="规格">
          <div style={{ width: 560, wordBreak: 'break-all' }}>{productDesc || replaceSign}</div>
        </FormItem>
        <FormItem label={this.renderLabel('数量')}>
          {getFieldDecorator('amountProductPlanned', {
            rules: [{ required: true, message: '数量必填' }, { validator: amountValidator(10000000000) }],
          })(
            <InputNumber
              style={{ ...baseFormItemStyle, width: 210, marginRight: 10 }}
              disabled={disabledList && disabledList.amount}
            />,
          )}
          <Input style={{ width: 80 }} disabled value={unitName} placeholder={null} />
        </FormItem>
        <div style={{ display: 'flex' }}>
          <FormItem label="成品批次">
            {getFieldDecorator('productBatchType', {
            })(
              <Select
                style={{ width: 120, marginRight: 10 }}
                disabled={disabledList && disabledList.productBatch}
                onChange={v => {
                  this.setState({ productBatchType: v });
                  this.props.form.resetFields(['productBatch']);
                }}
              >
                <Option value={1}>手动输入</Option>
                <Option value={2}>按规则生成</Option>
              </Select>,
            )}
          </FormItem>
          <FormItem>
            {productBatchType === 1 ?
              getFieldDecorator('productBatch', {
                rules: [{
                  validator: checkStringLength(100),
                }, {
                  // validator: this.codeFormatCheck('成品批次'),
                }, {
                  validator: checkTwoSidesTrim('成品批次'),
                }],
              })(
                // <ProductBatchCodeSelect
                //   disabled={disabledList && disabledList.productBatch}
                //   style={{ width: 170 }}
                //   placeholder="请输入成品批次"
                // />
                <Input
                  disabled={disabledList && disabledList.productBatch}
                  style={{ width: 170 }}
                  placeholder="请输入成品批次"
                />,
              ) :
              getFieldDecorator('productBatchNumberRuleId')(
                <ProductBatchCodeRuleSelect
                  disabled={disabledList && disabledList.productBatch}
                  style={{ width: 170 }}
                />)
            }
          </FormItem>
        </div>
        <FormItem label={this.renderLabel('生产主管')}>
          {getFieldDecorator('managerIds', {
            rules: [{ required: true, message: '生产主管必填' }],
          })(
            <SearchSelect
              params={{ roleId: 5, size: 1000 }}
              type={'account'}
              style={baseFormItemStyle}
              mode={'multiple'}
              disabled={disabledList && disabledList.managers}
            />,
          )}
        </FormItem>
        <div>
          <div style={{ display: 'inline-block' }}>
            <FormItem label={this.renderLabel('计划时间')}>
              {getFieldDecorator('startTimePlanned', {
                rules: [
                  {
                    validator: (rule, value, cb) => {
                      const materialTargetDate = this.state.materialTargetDate;

                      if (value && materialTargetDate && moment(value).isAfter(materialTargetDate, 'day')) {
                        this.setState({
                          helpMessageForStartTimePlanned: `计划开始时间不得晚于销售订单交期时间${moment(
                            materialTargetDate,
                          ).format('YYYY/MM/DD')}`,
                        });
                      } else {
                        this.setState({
                          helpMessageForStartTimePlanned: null,
                        });
                      }

                      cb();
                    },
                  },
                  {
                    validator: (rule, value, cb) => {
                      const endTime = this.state.endTimeForCheck;
                      if (value && endTime && moment(value).isAfter(endTime, 'day')) {
                        cb('结束时间不可早于开始时间');
                      }
                      cb();
                    },
                  },
                ],
              })(
                <DatePicker
                  style={{ width: 145, marginRight: 10 }}
                  placeholder={'开始时间'}
                  disabled={disabledList && disabledList.startTimePlanned}
                />,
              )}
            </FormItem>
          </div>
          <div style={{ display: 'inline-block' }}>
            <FormItem>
              {getFieldDecorator('endTimePlanned', {
                onChange: v => {
                  this.setState({ endTimeForCheck: v }, () => {
                    this.props.form.validateFields(['startTimePlanned'], { force: true });
                  });
                },
                rules: [
                  {
                    validator: (rule, value, cb) => {
                      const materialTargetDate = this.state.materialTargetDate;

                      if (value && materialTargetDate && moment(value).isAfter(materialTargetDate, 'day')) {
                        this.setState({
                          helpMessageForEndTimePlanned: `计划结束时间不得晚于销售订单交期时间${moment(
                            materialTargetDate,
                          ).format('YYYY/MM/DD')}`,
                        });
                      } else {
                        this.setState({
                          helpMessageForEndTimePlanned: null,
                        });
                      }

                      cb();
                    },
                  },
                ],
              })(
                <DatePicker
                  style={{ width: 145 }}
                  placeholder={'结束时间'}
                  disabled={disabledList && disabledList.endTimePlanned}
                />,
              )}
            </FormItem>
          </div>
          {this.state.helpMessageForStartTimePlanned || this.state.helpMessageForEndTimePlanned ? (
            <div>
              <FormItem label={' '}>
                {this.state.helpMessageForStartTimePlanned ? (
                  <div style={{ color: warning, marginRight: 10, lineHeight: '16px' }}>
                    {this.state.helpMessageForStartTimePlanned}
                  </div>
                ) : null}
                {this.state.helpMessageForEndTimePlanned ? (
                  <div style={{ color: warning, marginRight: 10, lineHeight: '16px' }}>
                    {this.state.helpMessageForEndTimePlanned}
                  </div>
                ) : null}
              </FormItem>
            </div>
          ) : null}
        </div>
        <div style={{ display: 'inline-block', marginRight: 10 }}>
          {this.isTaskDispatchEqualWorkerWeak() ? null : (
            <FormItem label={this.renderLabel('工艺')}>
              {getFieldDecorator('type', {
                rules: [
                  { required: true, message: '工艺路线或生产bom必须选则一项' },
                  {
                    validator: (rule, value, cb) => {
                      if (value === 'mbom' && !activeProduct) {
                        cb('生产bom需要产出物料');
                      }
                      if (value === 'processRoutingAndEbom' && !activeProduct) {
                        cb('物料清单需要产出物料');
                      }
                      cb();
                    },
                  },
                ],
                onChange: value => {
                  this.setState(
                    {
                      showMbomOrProcessRouting: value,
                      listData: value === 'mbom' || !getFieldValue('processRouting') ? [] : listData,
                      ebomData: [],
                    },
                    () => {
                      setDefaultValueForCraft(
                        value,
                        form,
                        { materialCode: activeProduct ? activeProduct.code : null },
                        this.getCallBacksForSetDefaultValueForCraft(value),
                      );
                    },
                  );
                },
              })(
                <Select
                  style={baseFormItemStyle}
                  disabled={disabledList && (disabledList.mBom || disabledList.processRouting)}
                >
                  <Option key={'processRouting'} value={'processRouting'}>
                    工艺路线
                  </Option>
                  <Option key={'mbom'} value={'mbom'}>
                    生产bom
                  </Option>
                  <Option key={'processRoutingAndEbom'} value={'processRoutingAndEbom'}>
                    工艺路线+物料清单
                  </Option>
                </Select>,
              )}
            </FormItem>
          )}
        </div>
        <div style={{ display: 'inline-block' }}>
          {/* 工艺路线/生产 BOM 如果选择生产 BOM 则 droplist 可选项为当前产出物料的已发布生产 BOM 的所有版本号，如果选择工艺路线则 droplist 可选项为所有已发布的工艺路线 */}
          {showMbomOrProcessRouting === 'processRouting' ? this.renderProcessRouting() : null}
          {showMbomOrProcessRouting === 'mbom' && (activeProduct && activeProduct.code) ? this.renderMBom() : null}
          {showMbomOrProcessRouting === 'processRoutingAndEbom' && (activeProduct && activeProduct.code)
            ? this.renderProcessRoutingAndEbom()
            : null}
        </div>
        <div style={{ margin: '0px 0px 20px 120px' }}>
          <div style={{ display: 'inline-block', width: 610, verticalAlign: 'top' }}>
            {Array.isArray(listData) && listData.length > 0 ? (
              <Table bindEBomToProcessRouting={bindEBomToProcessRouting} data={listData} style={{ width: 610 }} />
            ) : null}
          </div>
          <div style={{ display: 'inline-block', width: 302, marginLeft: 10 }}>
            {Array.isArray(ebomData) && ebomData.length > 0 ? (
              <EbomTable data={ebomData} style={{ width: 300 }} />
            ) : null}
          </div>
        </div>
        <FormItem label={this.renderLabel('附件')}>
          {getFieldDecorator('attachments', {
            initialValue: this.state.files || [],
          })(
            <Attachment
              prompt={
                <div style={AttachmentPromptStyle}>
                  <div>支持扩展名：JPG/PNG/JPEG/PDF，最大不能超过10M，用于执行生产任务时查看。</div>
                  {/* <div>{`${getAttachmentTips(this.state.files)}`}</div> */}
                </div>
              }
            />,
          )}
        </FormItem>
        <div style={AttachmentTipStyle}>{`${getAttachmentTips(this.state.files)}`}</div>
        <FormItem label={this.renderLabel('备注')}>
          {getFieldDecorator('remark')(<Textarea style={{ height: 120, width: 300 }} maxLength={500} />)}
        </FormItem>
      </Form>
    );
  }
}

export default ProjectForm;
