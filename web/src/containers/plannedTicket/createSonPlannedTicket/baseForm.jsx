import React, { Component } from 'react';
import _ from 'lodash';

import { getAttachments } from 'src/services/attachment';
import { getProcessRoutingByCode } from 'src/services/bom/processRouting';
import { getPurchaseOrderDetail } from 'src/services/cooperate/purchaseOrder';
import { getMbomByMaterialCodeAndVersion } from 'src/services/bom/mbom';
import { disabledDateBeforToday } from 'components/datePicker';
import EbomTable from 'containers/project/base/ebomTable';
import { getQcConfigByIds } from 'src/services/qcConfig';
import { getEbomDetail, getEbomByMaterialCodeAndVersion } from 'src/services/bom/ebom';
import Table from 'containers/project/base/table';
import { getWorkOrderCustomProperty } from 'services/cooperate/plannedTicket';
import {
  amountValidator,
  chineseValidator,
  checkPositiveInteger,
  supportSpecialCharacterValidator,
  checkStringLength,
  checkTwoSidesTrim,
  CustomFields,
} from 'src/components/form';
import { middleGrey, warning, fontSub } from 'src/styles/color';
import { formatUnixMoment } from 'utils/time';
import { arrayIsEmpty } from 'utils/array';
import { Searchselect, InputNumber, Attachment, DatePicker, FormItem, Select, Input, Form } from 'components';
import { queryMaterialDetail } from 'src/services/bom/material';
import { getSubProcessAndAmounts } from 'src/services/cooperate/plannedTicket';
import { replaceSign, ROLES_HAS_AUDIT_AUTHORITY } from 'src/constants';
import { Textarea, AlterableTable } from 'src/components';
import { safeSub } from 'utils/number';
import moment from 'src/utils/time';
import UserAndUserGroupSelect from 'components/select/UserAndUserGroupSelect';
import MaterialSelect from './materialSelect';
import ProcessSelect from './processSelect';
import UserOrUserGroupSelect from '../base/userOrUserGroupSelect';
import { setDefaultValueForCraft, getAuditConfig } from '../util';
import ProductBatchCodeRuleSelect from '../base/productBatchCodeRuleSelect';
import styles from '../styles.scss';

const Option = Select.Option;

type propTypes = {
  form: any,
  status: Number,
  data: {},
  editing: Boolean,
  fatherPlannedTicketCode: string,
  disabledList: any,
  fatherPlannedTicketDetail: any,
};

const baseFormItemStyle = { width: 300 };
const AttachmentPromptStyle = {
  color: middleGrey,
  position: 'absolute',
  marginLeft: 120,
  top: 4,
  width: 315,
  lineHeight: '16px',
  wordBreak: 'break-all',
};
const AttachmentTipStyle = {
  paddingLeft: 122,
  width: 560,
  wordBreak: 'break-all',
  position: 'relative',
  top: '-12px',
  color: 'rgb(142, 152, 174)',
};

// 获取附件的提示
const getAttachmentTips = files => {
  if (!Array.isArray(files) || !files.length) return ' ';

  const text = files
    .map(i => {
      const { originalFileName } = i || {};

      return originalFileName;
    })
    .filter(i => i)
    .join(',');

  return `${text}来自销售订单`;
};

// 拿生产bom列表数据中没有qcConfigDetails 需要自己取
const formatProcessListForMbom = async processList => {
  const res = [];
  if (Array.isArray(processList)) {
    for (let i = 0; i < processList.length; i += 1) {
      const { nodes } = processList[i];
      for (let j = 0; j < nodes.length; j += 1) {
        const { qcConfigs, inputMaterials, outputMaterial, deliverable } = nodes[j];
        const qcConfigsData = Array.isArray(qcConfigs) && qcConfigs.length ? await getQcConfigByIds(qcConfigs) : null;
        const { data } = qcConfigsData || {};
        const { data: realData } = data || {};
        res.push({
          ...nodes[j].process,
          deliverable,
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

class PlannedTicketBaseForm extends Component {
  props: propTypes;
  state = {
    showMbomOrProcessRouting: null,
    bindEBomToProcessRouting: false,
    outputMaterial: null,
    listData: [],
    ebomData: [],
    unitName: null,
    curUser: null,
    disabled: false,
    needTaskAudit: false,
    taskAuditors: [],
    formData: {},
    showPurchaseOrderSelect: false,
    productBatchType: null,
    materialTargetDate: null,
  };

  async componentDidMount() {
    const { data } = this.props;
    const res = await getWorkOrderCustomProperty({ size: 1000 });
    const customFields = _.get(res, 'data.data');
    this.setState({
      formData: data,
      customFields: !arrayIsEmpty(customFields)
        ? customFields.map(e => ({
            maxLength: e.maxLen,
            name: e.name,
          }))
        : [],
    });
    this.setInitialData(data);
  }

  componentWillReceiveProps(nextProps) {
    const { data, editing } = nextProps;
    const { status } = data || {};
    const { formData } = this.state;

    if (!_.isEqual(formData, data)) {
      this.setState({
        formData: data,
        disabled: status !== undefined ? status !== 1 : Boolean(false),
      });
      this.setInitialData(data);
    }

    // 创建的时候才需要设置附件，编辑的时候不需要
    this.setPurchaseOrderData(nextProps, !editing);
  }

  disabledEndDate = endValue => {
    const { startValue } = this.state;
    if (!endValue || !startValue) {
      return false;
    }
    return endValue.valueOf() <= startValue.valueOf();
  };

  handleMaterialSelectChange = value => {
    if (!value) {
      this.setState({
        outputMaterial: null,
        unitName: null,
        showMbomOrProcessRouting: false,
        listData: [],
        ebomData: [],
      });
      this.props.form.resetFields(['ebom', 'processRoute', 'mbom', 'selectType', 'fatherPlannedTicketProcess']);
      this.setMaterialAmountTips();
      return;
    }

    const { form, fatherPlannedTicketCode } = this.props;
    const { key } = value;

    queryMaterialDetail(key).then(res => {
      const data = _.get(res, 'data.data');
      this.setState(
        {
          outputMaterial: data,
          unitName: _.get(data, 'unitName', null),
        },
        () => {
          form.resetFields(['ebom', 'processRoute', 'mbom', 'selectType', 'fatherPlannedTicketProcess']);
          this.setState({
            listData: [],
            ebomData: [],
            bindEBomToProcessRouting: false,
          });
        },
      );
    });

    this.setMaterialAmountTips(fatherPlannedTicketCode, key);
  };

  // 获取父工单需求量，已有子工单的计划产出量
  setMaterialAmountTips = (fatherPlannedTicketCode, materialCode) => {
    if (fatherPlannedTicketCode && materialCode) {
      getSubProcessAndAmounts(fatherPlannedTicketCode, materialCode).then(res => {
        const { maxAmount, subAmounts, amountLimit } = _.get(res, 'data.data') || {};

        const sonPlannedTicketsText = Array.isArray(subAmounts)
          ? subAmounts
              .filter(i => {
                const codeNow = _.get(this.props, 'data.code');
                if (i && i.code === codeNow) {
                  return false;
                }

                return true;
              })
              .map(i => {
                const { code, amount } = i || {};
                return `已有子工单${code}计划产出量${typeof amount === 'number' ? amount : replaceSign}`;
              })
              .join(',')
          : '';

        this.setState({
          materialAmountTips: `父工单需求量${
            typeof maxAmount === 'number' ? maxAmount : replaceSign
          }。${sonPlannedTicketsText}`,
        });

        if (amountLimit && !this.props.editing) {
          const _subAmounts = Array.isArray(subAmounts) ? subAmounts.map(({ amount }) => amount) : [];
          const initialAmount = safeSub(maxAmount, _.sum(_subAmounts));

          if (typeof initialAmount === 'number') {
            this.props.form.setFieldsValue({
              amount: initialAmount > 0 ? initialAmount : 0,
            });
          }
        }
      });
    } else {
      this.setState({ materialAmountTips: null });
    }
  };

  setProcessRoutingProcessData = async processRoutingCode => {
    const res = await getProcessRoutingByCode({ code: processRoutingCode });

    const { data } = res || {};
    const { data: realData } = data || {};
    const { processList } = realData || {};

    formatProcessList(processList).then(res => {
      this.setState({
        listData: res,
        needTaskAudit: _.find(res, o => o.deliverable),
      });
    });
  };

  setMBomProcessData = async (code, mbomVersion) => {
    const res = await getMbomByMaterialCodeAndVersion({
      code,
      version: mbomVersion,
    });
    const { data } = res || {};
    const { data: realData } = data || {};
    const { processList, bindEBomToProcessRouting, ebomVersion } = realData || {};

    formatProcessListForMbom(processList).then(res => {
      this.setState({
        ebomData: [],
        listData: res,
        bindEBomToProcessRouting,
        needTaskAudit: _.find(res, o => o.deliverable),
      });
      if (ebomVersion && bindEBomToProcessRouting === false) this.setEBomMaterialData(code, ebomVersion);
    });
  };

  setEBomMaterialData = async (code, ebomVersion) => {
    const res = await getEbomByMaterialCodeAndVersion({
      code,
      version: ebomVersion,
    });
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

  // 设置销售订单的信息
  setPurchaseOrderData = (props, needFiles) => {
    const { fatherPlannedTicketDetail, data } = props || this.props;
    const { purchaseOrderCode, materialCode } = fatherPlannedTicketDetail || {};

    if (!purchaseOrderCode) return;

    // 设置附件，订单交货日期
    getPurchaseOrderDetail(purchaseOrderCode).then(async res => {
      const purchaseOrderData = _.get(res, 'data.data');
      const { materialList } = purchaseOrderData || {};
      const fileIds = _.get(res, 'data.data.attachments');
      const filesRes = await getAttachments(fileIds);
      const files = _.get(filesRes, 'data.data');
      const material = _.find(materialList, o => o.materialCode === materialCode);

      const newState = {
        purchaseOrderCode,
      };

      // 是否需要附件
      if (needFiles) {
        newState.files = Array.isArray(files)
          ? files.map(i => {
              const { id } = i || {};
              const originalFileName = i.originalFileName || i.original_filename || i.originalFilename;

              return {
                originalFileName,
                restId: id,
                id,
              };
            })
          : [];
      }

      this.setState(newState);
    });
  };

  setTaskAuditors = data => {
    this.setState({ taskAuditors: data });
  };

  setInitialData = data => {
    const {
      form: { setFieldsValue },
      editing,
    } = this.props;
    const {
      code,
      amount,
      priority,
      planners,
      managers,
      ebomVersion,
      selectType,
      mbomVersion,
      planEndTime,
      materialUnit,
      materialCode,
      materialName,
      materialDesc,
      planBeginTime,
      attachmentFiles,
      processRouteName,
      processRouteCode,
      purchaseOrderCode,
      parentOrder,
      parentCode: fatherPlannedTicketCode,
      remark,
      productBatchType,
      productBatch,
      taskAuditors,
      taskAuditorIds,
      fieldDTO,
      ...rest
    } = data || {};
    const { processCode, processName, processSeq } = parentOrder || {};
    const customFields = {};
    if (!arrayIsEmpty(fieldDTO)) {
      fieldDTO.forEach(e => (customFields[e.name] = e.content));
    }

    this.setMaterialAmountTips(fatherPlannedTicketCode, materialCode);

    this.setState(
      {
        productBatchType: productBatchType || 1,
        unitName: materialUnit,
        showMbomOrProcessRouting: selectType,
        outputMaterial: materialCode
          ? {
              unit: { name: materialUnit },
              code: materialCode,
              name: materialName,
              desc: materialDesc,
            }
          : undefined,
      },
      () => {
        setFieldsValue({
          code,
          amount,
          priority,
          selectType,
          productBatch: productBatchType === 2 ? (productBatch ? Number(productBatch) : null) : productBatch,
          productBatchType: productBatchType || 1,
          attachments: attachmentFiles,
          planEndTime: planEndTime ? formatUnixMoment(planEndTime) : undefined,
          purchaseOrderCode: {
            key: purchaseOrderCode,
            label: purchaseOrderCode,
          },
          ebom: ebomVersion ? { key: ebomVersion, label: ebomVersion } : undefined,
          mbom: mbomVersion ? { key: mbomVersion, label: mbomVersion } : undefined,
          planBeginTime: planBeginTime ? formatUnixMoment(planBeginTime) : undefined,
          material: materialCode ? { key: materialCode, label: materialName } : undefined,
          processRoute: processRouteCode
            ? {
                key: processRouteCode,
                label: `${processRouteCode}/${processRouteName}`,
              }
            : null,
          fatherPlannedTicketProcess: parentOrder
            ? {
                label: `${processCode || replaceSign}/${processName || replaceSign}`,
                key: processSeq,
              }
            : undefined,
          remark,
          customFields,
          ...rest,
        });

        const taskAuditConfig = getAuditConfig('taskAudit');
        this.setTaskAuditors(taskAuditors && taskAuditors.map(({ ids }) => ({ id: ids })));

        if (!editing && taskAuditConfig === 'true') {
          // 创建：带入上一次创建时填入的值
          this.setTaskAuditors(taskAuditorIds && taskAuditorIds.map(id => ({ id })));
        }

        if (Array.isArray(planners) && planners.length > 0) {
          this.props.form.setFieldsValue({
            planners: planners.map(({ id, name }) => ({ key: id, label: name })),
          });
        }

        if (Array.isArray(managers) && managers.length > 0) {
          this.props.form.setFieldsValue({
            managers: managers.map(({ id, name }) => ({ key: id, label: name })),
          });
        }

        if (selectType === 'processRoute') {
          this.setProcessRoutingProcessData(processRouteCode);
        }

        if (selectType === 'mbom') {
          this.setMBomProcessData(materialCode, mbomVersion);
        }

        if (selectType === 'processRouteEbom' && ebomVersion) {
          this.setEBomMaterialData(materialCode, ebomVersion);
          this.setProcessRoutingProcessData(processRouteCode);
        }
      },
    );
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

  getAuditorColumns = ({ fieldName, disabled }) => {
    const {
      form: { getFieldDecorator },
    } = this.props;
    const tip = <span style={{ color: 'rgba(0, 0, 0, 0.4)' }}> (最多添加5个)</span>;
    return [
      {
        title: <div>审批人{tip}</div>,
        key: 'id',
        dataIndex: 'id',
        render: (data, record) => {
          return (
            <FormItem style={{ height: 50, margin: 0, marginTop: 6 }}>
              {getFieldDecorator(`${fieldName}[${record.key}]`, {
                initialValue:
                  fieldName === 'taskAuditorIds'
                    ? data &&
                      data.map(({ id, name, key, label }) => ({
                        key: id || key,
                        label: name || label,
                      }))
                    : data,
                rules: [
                  {
                    required: true,
                    message: '审批人必填',
                  },
                ],
              })(
                <UserAndUserGroupSelect
                  disabled={disabled}
                  params={{ roleIds: ROLES_HAS_AUDIT_AUTHORITY.join(',') }}
                />,
              )}
            </FormItem>
          );
        },
      },
    ];
  };

  onChangeForMBom = async (value, code) => {
    const { key: mbomVersion } = value || {};

    if (code && mbomVersion) {
      const res = await getMbomByMaterialCodeAndVersion({
        code,
        version: mbomVersion,
      });
      const { data } = res || {};
      const { data: realData } = data || {};
      const { processList, bindEBomToProcessRouting, ebomVersion } = realData || {};
      formatProcessListForMbom(processList).then(res => {
        this.setState({
          ebomData: [],
          listData: res,
          bindEBomToProcessRouting,
          needTaskAudit: _.find(res, o => o.deliverable),
        });
        if (ebomVersion && bindEBomToProcessRouting === false) this.setEBomMaterialData(code, ebomVersion);
      });
    } else {
      this.setState({
        listData: [],
        needTaskAudit: false,
      });
    }
  };

  onChangeForEBom = async value => {
    if (value) {
      const res = await getEbomDetail(value.key);
      const { data } = res || {};
      const { data: ebom_detail } = data || {};
      const { rawMaterialList, processRoutingCode, processRoutingName } = ebom_detail || {};
      if (processRoutingCode) {
        const processRoute = {
          key: processRoutingCode,
          label: processRoutingName,
        };
        this.props.form.setFieldsValue({ processRoute });
        this.onChangeForProcessRouting(processRoute);
      }

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

  renderProcessRoutingAndEbom = () => {
    const style = { display: 'inline-block' };
    return (
      <React.Fragment>
        <div style={{ ...style, marginRight: 10, marginTop: -20 }}>{this.renderEBom()}</div>
        <div style={{ ...style }}>{this.renderProcessRouting()}</div>
      </React.Fragment>
    );
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
          needTaskAudit: _.find(res, o => o.deliverable),
        });
      });
    } else {
      this.setState({
        listData: [],
        needTaskAudit: false,
      });
    }
  };

  renderProcessRouting = () => {
    const {
      form: { getFieldDecorator },
      disabledList,
    } = this.props;
    return (
      <FormItem>
        {getFieldDecorator('processRoute', {
          rules: [{ required: true, message: '工艺路线编号和名称必填' }],
          onChange: this.onChangeForProcessRouting,
        })(
          <Searchselect
            type="processRouting"
            style={baseFormItemStyle}
            params={{ status: 1 }}
            placeholder={'工艺路线编号／名称'}
            disabled={disabledList && disabledList.craft}
          />,
        )}
      </FormItem>
    );
  };

  getCallBacksForSetDefaultValueForCraft = value => {
    const callBacks = {};
    if (value === 'mbom') {
      callBacks.cbForMbom = this.onChangeForMBom;
    }
    if (value === 'processRouteEbom') {
      callBacks.cbForEbom = this.onChangeForEBom;
      callBacks.cbForProcessRouting = this.onChangeForProcessRouting;
    }
    if (value === 'processRoute') {
      callBacks.cbForProcessRouting = this.onChangeForProcessRouting;
    }

    return callBacks;
  };

  renderMBom = () => {
    const {
      form: { getFieldDecorator },
      disabledList,
    } = this.props;
    const { outputMaterial } = this.state;
    if (!outputMaterial) return null;

    const { code } = outputMaterial;

    // status: 1表示启用
    return (
      <FormItem key={`mbom-${code}`}>
        {getFieldDecorator('mbom', {
          rules: [{ required: true, message: '生产bom编号和名称必填' }],
          onChange: value => this.onChangeForMBom(value, code),
        })(
          <Searchselect
            type="mbom"
            style={baseFormItemStyle}
            params={{ materialCode: code, status: 1 }}
            disabled={disabledList && disabledList.craft}
            placeholder="生产bom版本号"
          />,
        )}
      </FormItem>
    );
  };

  renderEBom = () => {
    const { outputMaterial } = this.state;
    if (!outputMaterial) return null;

    const {
      form: { getFieldDecorator },
      disabledList,
    } = this.props;
    const { code } = outputMaterial || {};

    // status: 1表示启用
    return (
      <FormItem key={`ebom-${code}`}>
        {getFieldDecorator('ebom', {
          rules: [{ required: true, message: '物料清单版本号必填' }],
          onChange: this.onChangeForEBom,
        })(
          <Searchselect
            placeholder="物料清单版本号"
            type="ebomExact"
            params={{ productMaterialCode: code, status: 1 }}
            style={baseFormItemStyle}
            disabled={disabledList && disabledList.craft}
          />,
        )}
      </FormItem>
    );
  };

  render() {
    const { form, editing, fatherPlannedTicketCode, disabledList } = this.props;
    const { changeChineseToLocale } = this.context;
    const taskAuditConfig = getAuditConfig('taskAudit');
    const { getFieldDecorator, getFieldValue, validateFields } = form || {};

    const {
      disabled,
      taskAuditors,
      productBatchType,
      ebomData,
      unitName,
      listData,
      outputMaterial,
      showMbomOrProcessRouting,
      bindEBomToProcessRouting,
      needTaskAudit,
    } = this.state;
    const { planBeginTime, planEndTime } = this.props.fatherPlannedTicketDetail || {};

    return (
      <Form>
        <FormItem label="计划工单编号">
          {getFieldDecorator('code', {
            rules: [
              {
                required: true,
                message: '计划工单编号不能为空',
              },
              {
                max: 50,
                message: '计划工单编号最多50非中文字符',
              },
              {
                validator: chineseValidator('计划工单编号'),
              },
              {
                validator: supportSpecialCharacterValidator('计划工单编号'),
              },
            ],
          })(<Input style={baseFormItemStyle} placerholder="请输入计划工单编号" disabled={editing} />)}
        </FormItem>
        <FormItem label="产出物料">
          {getFieldDecorator('material', {
            rules: [
              {
                required: true,
                message: '产出物料必填',
              },
              {
                validator: (rule, value, cb) => {
                  const status = _.get(value, 'material.status', undefined);
                  if (status !== undefined && status === 0) return cb('产出物料不能选择停用中的物料');
                  cb();
                },
              },
            ],
            onChange: this.handleMaterialSelectChange,
          })(
            <MaterialSelect
              plannedTicketCode={fatherPlannedTicketCode}
              allowClear
              params={{ status: 'enable' }}
              style={{ ...baseFormItemStyle, width: 400 }}
              hideCreateButton
              disabled={disabledList && disabledList.product}
            />,
          )}
        </FormItem>
        <FormItem label="规格">
          <div style={{ width: 560, wordBreak: 'break-all' }}>
            {(outputMaterial && outputMaterial.desc) || replaceSign}
          </div>
        </FormItem>
        <FormItem label="数量">
          {getFieldDecorator('amount', {
            rules: [
              {
                required: true,
                message: '数量必填',
              },
              {
                validator: amountValidator(1000000000, null, null, 6, '数量'),
              },
            ],
          })(
            <InputNumber
              disabled={disabledList && disabledList.amount}
              style={{ width: 200, height: 28, marginRight: 10 }}
            />,
          )}
          <Input
            style={{ width: 90, height: 28, verticalAlign: 'middle' }}
            value={unitName}
            placeholder={null}
            disabled
          />
          <div style={{ width: 620, lineHeight: '20px', wordBreak: 'break-all' }}>
            {this.state.materialAmountTips || replaceSign}
          </div>
        </FormItem>
        <div style={{ display: 'flex' }}>
          <FormItem label="成品批次">
            {getFieldDecorator('productBatchType', {})(
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
            {productBatchType === 1
              ? getFieldDecorator('productBatch', {
                  rules: [
                    {
                      validator: checkStringLength(100),
                    },
                    {
                      validator: checkTwoSidesTrim('成品批次'),
                    },
                  ],
                })(
                  <Input style={{ width: 170 }} placeholder="请输入成品批次" />,
                  // <ProductBatchCodeSelect
                  //   disabled={disabledList && disabledList.productBatch}
                  //   style={{ width: 170 }}
                  //   placeholder="请输入成品批次"
                  // />
                )
              : getFieldDecorator('productBatch')(
                  <ProductBatchCodeRuleSelect
                    disabled={disabledList && disabledList.productBatch}
                    style={{ width: 170 }}
                  />,
                )}
          </FormItem>
        </div>
        <FormItem label={'父工单工序'}>
          {getFieldDecorator('fatherPlannedTicketProcess', {
            rules: [
              {
                required: true,
                message: '父工单工序必选',
              },
            ],
          })(
            <ProcessSelect
              style={baseFormItemStyle}
              plannedTicketCode={fatherPlannedTicketCode}
              materialCode={outputMaterial ? outputMaterial.code : null}
              disabled={outputMaterial ? disabledList && disabledList.parentProcess : true}
            />,
          )}
        </FormItem>
        <UserOrUserGroupSelect form={form} type="planners" label="计划员" />
        <UserOrUserGroupSelect form={form} type="managers" label="生产主管" multiple />
        <FormItem label="优先级">
          {getFieldDecorator('priority', {
            rules: [
              {
                required: true,
                message: '优先级必填',
              },
              {
                validator: amountValidator(null, null, null, null, '优先级'),
              },
              {
                validator: checkPositiveInteger(),
              },
            ],
          })(
            <InputNumber
              min={1}
              step={1}
              placeholder="数字越大优先级越高"
              style={baseFormItemStyle}
              disabled={disabled}
            />,
          )}
        </FormItem>
        <div>
          <div style={{ display: 'flex' }}>
            <div style={{ display: 'inline-block' }}>
              <FormItem label="计划时间">
                {getFieldDecorator('planBeginTime', {
                  rules: [
                    {
                      validator: (rule, value, cb) => {
                        const planEndTime = this.state.planEndTimeForCheck;

                        if (value && planEndTime && moment(value).isAfter(planEndTime, 'day')) {
                          cb('结束时间不得早于计划开始时间');
                        }

                        cb();
                      },
                    },
                    {
                      validator: (rule, value, cb) => {
                        const fatherPlannedTicketDetail = this.props.fatherPlannedTicketDetail;
                        const fatherPlanEndTime = _.get(fatherPlannedTicketDetail, 'planEndTime');
                        const tipText = '计划开始时间晚于父工单的计划结束时间';

                        if (fatherPlanEndTime && moment(value).isAfter(fatherPlanEndTime, 'day')) {
                          this.setState({
                            helpMessageForPlanBeginTime1: tipText,
                          });
                        } else {
                          this.setState({ helpMessageForPlanBeginTime1: null });
                        }

                        cb();
                      },
                    },
                    {
                      validator: (rule, value, cb) => {
                        const materialTargetDate = this.state.materialTargetDate;
                        const tipText = `计划开始时间不得晚于销售订单交货时间${moment(materialTargetDate).format(
                          'YYYY/MM/DD',
                        )}`;

                        if (value && materialTargetDate && moment(value).isAfter(materialTargetDate, 'day')) {
                          this.setState({
                            helpMessageForPlanBeginTime2: tipText,
                          });
                        } else {
                          this.setState({ helpMessageForPlanBeginTime2: null });
                        }

                        cb();
                      },
                    },
                  ],
                })(
                  <DatePicker
                    disabledDate={disabledDateBeforToday}
                    placeholder="开始时间"
                    format="YYYY-MM-DD"
                    style={{ marginRight: 5, width: 145 }}
                  />,
                )}
              </FormItem>
            </div>
            <div style={{ display: 'inline-block' }}>
              <FormItem>
                {getFieldDecorator('planEndTime', {
                  onChange: v => {
                    this.setState(
                      {
                        planEndTimeForCheck: v,
                      },
                      () => {
                        validateFields(['planBeginTime'], { force: true });
                      },
                    );
                  },
                  rules: [
                    {
                      validator: (rule, value, cb) => {
                        const fatherPlannedTicketDetail = this.props.fatherPlannedTicketDetail;
                        const fatherPlanEndTime = _.get(fatherPlannedTicketDetail, 'planEndTime');
                        const tipText = '计划结束时间晚于父工单的计划结束时间';

                        if (fatherPlanEndTime && moment(value).isAfter(fatherPlanEndTime, 'day')) {
                          this.setState({
                            helpMessageForPlanEndTime1: tipText,
                          });
                        } else {
                          this.setState({ helpMessageForPlanEndTime1: null });
                        }

                        cb();
                      },
                    },
                    {
                      validator: (rule, value, cb) => {
                        const materialTargetDate = this.state.materialTargetDate;
                        const tipText = `计划结束时间不得晚于销售订单交货时间${moment(materialTargetDate).format(
                          'YYYY/MM/DD',
                        )}`;

                        if (value && materialTargetDate && moment(value).isAfter(materialTargetDate, 'day')) {
                          this.setState({
                            helpMessageForPlanEndTime2: tipText,
                          });
                        } else {
                          this.setState({ helpMessageForPlanEndTime2: null });
                        }

                        cb();
                      },
                    },
                  ],
                })(
                  <DatePicker
                    disabledDate={disabledDateBeforToday}
                    placeholder="结束时间"
                    format="YYYY-MM-DD"
                    style={{ marginLeft: 5, width: 145 }}
                  />,
                )}
              </FormItem>
            </div>
            {!planEndTime && !planBeginTime ? null : (
              <div style={{ padding: '10px 0 0 10px', color: fontSub }}>
                {changeChineseToLocale('父工单计划时间')}：
                {planBeginTime ? moment(planBeginTime).format('YYYY/MM/DD') : replaceSign}~
                {planEndTime ? moment(planEndTime).format('YYYY/MM/DD') : replaceSign}
              </div>
            )}
          </div>
          {this.state.helpMessageForPlanBeginTime1 ||
          this.state.helpMessageForPlanBeginTime2 ||
          this.state.helpMessageForPlanEndTime1 ||
          this.state.helpMessageForPlanEndTime2 ? (
            <div>
              <FormItem label={' '}>
                {this.state.helpMessageForPlanBeginTime1 ? (
                  <div style={{ color: warning, lineHeight: '16px' }}>{this.state.helpMessageForPlanBeginTime1}</div>
                ) : null}
                {this.state.helpMessageForPlanBeginTime2 ? (
                  <div style={{ color: warning, lineHeight: '16px' }}>{this.state.helpMessageForPlanBeginTime2}</div>
                ) : null}
                {this.state.helpMessageForPlanEndTime1 ? (
                  <div style={{ color: warning, lineHeight: '16px' }}>{this.state.helpMessageForPlanEndTime1}</div>
                ) : null}
                {this.state.helpMessageForPlanEndTime2 ? (
                  <div style={{ color: warning, lineHeight: '16px' }}>{this.state.helpMessageForPlanEndTime2}</div>
                ) : null}
              </FormItem>
            </div>
          ) : null}
        </div>
        {
          // 任务派遣方式为工人非管控领取时没有该字段
          <React.Fragment>
            <div style={{ display: 'inline-block', marginRight: 10 }}>
              <FormItem label="工艺">
                {getFieldDecorator('selectType', {
                  rules: [
                    {
                      required: true,
                      message: '工艺路线或生产bom必须选则一项',
                    },
                    {
                      validator: (rule, value, cb) => {
                        if (value === 'mbom' && !outputMaterial) {
                          cb('生产bom需要产出物料');
                        }
                        if (value === 'processRouteEbom' && !outputMaterial) {
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
                        listData: value === 'mbom' || !getFieldValue('processRoute') ? [] : listData,
                        ebomData: [],
                        needTaskAudit: false,
                      },
                      () => {
                        const callBacks = this.getCallBacksForSetDefaultValueForCraft(value);
                        setDefaultValueForCraft(
                          value,
                          this.props.form,
                          {
                            materialCode: outputMaterial ? outputMaterial.code : null,
                          },
                          callBacks,
                        );
                      },
                    );
                  },
                })(
                  <Select className={styles.select} disabled={disabledList && disabledList.craft}>
                    <Option key="processRoute" value="processRoute">
                      工艺路线
                    </Option>
                    <Option key="mbom" value="mbom">
                      生产bom
                    </Option>
                    <Option key="processRouteEbom" value="processRouteEbom">
                      工艺路线+物料清单
                    </Option>
                  </Select>,
                )}
              </FormItem>
            </div>
            <div style={{ display: 'inline-block' }}>
              {showMbomOrProcessRouting === 'processRoute' ? this.renderProcessRouting() : null}
              {showMbomOrProcessRouting === 'mbom' && outputMaterial ? this.renderMBom() : null}
              {showMbomOrProcessRouting === 'processRouteEbom' && outputMaterial
                ? this.renderProcessRoutingAndEbom()
                : null}
            </div>
          </React.Fragment>
        }
        {!_.get(listData, 'length') && !_.get(ebomData, 'length') ? null : (
          <FormItem label=" ">
            {!arrayIsEmpty(listData) ? (
              <div className={styles['inline-block']} style={{ marginRight: 10 }}>
                <Table
                  rowKey={record => record.seq}
                  bindEBomToProcessRouting={bindEBomToProcessRouting}
                  data={listData}
                  wrapperClassName={styles['inline-block']}
                  style={{ width: 460, margin: 0 }}
                />
              </div>
            ) : null}
            {!arrayIsEmpty(ebomData) ? (
              <div className={styles['inline-block']} style={{ verticalAlign: 'top' }}>
                <EbomTable rowKey={record => record.id} data={ebomData} style={{ width: 300, margin: 0 }} />
              </div>
            ) : null}
          </FormItem>
        )}
        {taskAuditConfig === 'true' && needTaskAudit ? (
          <FormItem label="生产任务审批人" required>
            <AlterableTable
              itemName="后续审批人"
              fieldName="taskAuditorIds"
              atLeastNum={1}
              maxNum={5}
              dataSource={taskAuditors}
              setDataSource={this.setTaskAuditors}
              columns={this.getAuditorColumns({
                fieldName: 'taskAuditorIds',
                disabled: disabledList && disabledList.taskAuditorIds,
              })}
            />
          </FormItem>
        ) : null}
        <CustomFields prefix={'customFields'} form={form} fields={this.state.customFields} />
        <FormItem label="附件">
          {getFieldDecorator('attachments', {
            initialValue: this.state.files || [],
          })(
            <Attachment
              rest
              prompt={
                <div style={AttachmentPromptStyle}>
                  <div>支持扩展名：JPG/PNG/JPEG/PDF，最大不能超过10M，用于执行生产任务时查看</div>
                  {/* <div>{`${getAttachmentTips(this.state.files)}`}</div> */}
                </div>
              }
            />,
          )}
        </FormItem>
        <div style={AttachmentTipStyle}>{`${getAttachmentTips(this.state.files)}`}</div>
        <FormItem label={'备注'}>
          {getFieldDecorator('remark')(<Textarea maxLength={50} style={{ height: 150, width: 300 }} />)}
        </FormItem>
      </Form>
    );
  }
}

PlannedTicketBaseForm.contextTypes = {
  changeChineseToLocale: () => {},
};

export default PlannedTicketBaseForm;
