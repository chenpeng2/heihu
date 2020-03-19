import React, { Component } from 'react';
import _ from 'lodash';

import {
  AuditorSelect,
  AlterableTable,
  Textarea,
  Searchselect,
  InputNumber,
  Attachment,
  DatePicker,
  FormItem,
  Select,
  Input,
  Form,
  Link,
} from 'src/components';
import SelectWithIntl from 'components/select/selectWithIntl';
import { disabledDateBeforToday } from 'components/datePicker';
import { arrayIsEmpty } from 'utils/array';
import { thousandBitSeparator, Big } from 'utils/number';
import { getProcessRoutingByCode } from 'services/bom/processRouting';
import { getPurchaseOrderDetail } from 'services/cooperate/purchaseOrder';
import { getMbomByMaterialCodeAndVersion } from 'services/bom/mbom';
import EbomTable from 'containers/project/base/ebomTable';
import { getQcConfigByIds } from 'services/qcConfig';
import { getWorkOrderCustomProperty } from 'services/cooperate/plannedTicket';
import { getEbomDetail, getEbomByMaterialCodeAndVersion } from 'services/bom/ebom';
import Table from 'containers/project/base/table';
import {
  checkTwoSidesTrim,
  amountValidator,
  chineseValidator,
  checkPositiveInteger,
  supportSpecialCharacterValidator,
  checkStringLength,
  CustomFields,
} from 'components/form';
import { middleGrey, fontSub, warning } from 'styles/color';
import moment, { formatUnixMoment } from 'utils/time';
import auth from 'utils/auth';
import { replaceSign, ROLES_HAS_AUDIT_AUTHORITY } from 'constants';
import MaterialSelect from 'containers/project/base/materialSelect';
import { queryMaterialDetail } from 'services/bom/material';
import { getAttachments } from 'services/attachment';
import UserAndUserGroupSelect from 'components/select/UserAndUserGroupSelect';
import { getAvailableAmount } from 'services/cooperate/materialRequest';
import { toMaterialCollectReport } from 'views/stock/materialCollectReport/utils';

import { plannedTicket_types, setDefaultValueForCraft, getAuditConfig } from '../util';
import UserOrUserGroupSelect from './userOrUserGroupSelect';
import ProductBatchCodeRuleSelect from './productBatchCodeRuleSelect';
import styles from '../styles.scss';

const Option = Select.Option;

type propTypes = {
  form: any,
  status: Number,
  data: {},
  editing: boolean,
  disabledList: any,
  locationState: {},
  match: {},
  location: {},
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
          inputMaterials,
          outputMaterial,
          nodeCode: nodes[j].nodeCode,
          qcConfigDetails: realData,
          deliverable,
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
        // const { qcConfigs } = nodes[j];
        // const qcConfigsData = Array.isArray(qcConfigs) && qcConfigs.length ? await getQcConfigByIds(qcConfigs) : null;
        // const { data } = qcConfigsData || {};
        // const { data: realData } = data || {};
        res.push({
          ...nodes[j],
          name: nodes[j].processName,
          // qcConfigs: realData,
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
    productUnits: [],
    initialFormData: {},
    unitName: null,
    curUser: null,
    auditors: [],
    taskAuditors: [],
    showPurchaseOrderSelect: false,
    productBatchType: 1,
    needTaskAudit: false,
    materialTargetDate: null,
    issueWarehouse: null,
    availableInventory: 0,
  };

  async componentDidMount() {
    const { data } = this.props;
    const res = await getWorkOrderCustomProperty({ size: 1000 });
    const customFields = _.get(res, 'data.data');
    this.setState({
      customFields: !arrayIsEmpty(customFields)
        ? customFields.map(e => ({
            maxLength: e.maxLen,
            name: e.name,
          }))
        : [],
    });
    this.setInitialData(data);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (!_.isEqual(nextProps.data, this.props.data)) {
      this.setInitialData(nextProps.data);
    }
    return true;
  }

  disabledEndDate = endValue => {
    const { startValue } = this.state;
    if (!endValue || !startValue) {
      return false;
    }
    return endValue.valueOf() <= startValue.valueOf();
  };

  queryAvailableInventory = (materialCode, warehouseCode) => {
    getAvailableAmount({
      materialCode,
      warehouseCode,
    })
      .then(res => {
        const availableInventory = _.get(res, 'data.data');
        this.setState({
          availableInventory,
        });
      })
      .catch(err => console.log(err));
  };

  handleMaterialSelectChange = (value, option) => {
    this.props.form.resetFields(['orderMaterialId']);
    this.setState({
      listData: [],
      ebomData: [],
      needTaskAudit: false,
      issueWarehouse: null,
    });
    if (!value) {
      this.props.form.resetFields(['ebom', 'processRoute', 'mbom', 'selectType', 'orderMaterialId']);

      this.setState({
        showMbomOrProcessRouting: false,
        outputMaterial: null,
        unitName: null,
        productUnits: [],
        needTaskAudit: false,
      });

      return;
    }

    if (!_.isEmpty(option)) {
      this.setState({ materialTargetDate: _.get(option, 'props.targetDate') });
      this.props.form.setFieldsValue({
        orderMaterialId: _.get(option, 'props.orderMaterialId', null),
      });
      this.props.form.resetFields(['ebom', 'processRoute', 'mbom', 'selectType']);
    }

    const { form } = this.props;
    const { key } = value || {};
    let materialCode = key;
    if (key.indexOf('@')) {
      materialCode = key.split('@') && key.split('@')[0];
    }

    queryMaterialDetail(materialCode).then(res => {
      const data = _.get(res, 'data.data');
      const { unitConversions, unitName, unitId, issueWarehouseCode, issueWarehouseId, issueWarehouseName } =
        data || {};
      const _unitConversions =
        _.get(unitConversions, 'length') > 0
          ? unitConversions.map(({ slaveUnitId, slaveUnitName }) => ({
              key: slaveUnitId,
              label: slaveUnitName,
              master: false,
            }))
          : [];
      const productUnits = _unitConversions.concat({
        key: unitId,
        label: unitName,
        master: true,
      });
      const issueWarehouse = issueWarehouseCode
        ? {
            id: issueWarehouseId,
            name: issueWarehouseName,
            code: issueWarehouseCode,
          }
        : null;

      this.setState(
        {
          productUnits,
          outputMaterial: data,
          unitName,
          issueWarehouse,
        },
        () => {
          if (issueWarehouse) {
            this.queryAvailableInventory(materialCode, issueWarehouse.code);
          }
          // 只有一个物料类型时 填入工艺路线
          if (_.get(data, 'materialTypes.length') > 0) {
            const materialTypes = data.materialTypes.filter(type => type.processRouting && type.processRouting.status);
            if (materialTypes && materialTypes.length === 1) {
              this.setState(
                {
                  listData: [],
                  ebomData: [],
                  bindEBomToProcessRouting: false,
                  showMbomOrProcessRouting: 'processRoute',
                },
                async () => {
                  const { processRoutingCode } = materialTypes[0];
                  const processRouting = await this.setProcessRoutingProcessData(processRoutingCode);
                  const { code: processRouteCode, name: processRouteName } = processRouting;
                  form.setFieldsValue({
                    selectType: 'processRoute',
                    processRoute: processRouteCode
                      ? {
                          key: processRouteCode,
                          label: `${processRouteCode}/${processRouteName}`,
                        }
                      : null,
                  });
                },
              );
            } else {
              this.setState({
                listData: [],
                ebomData: [],
                bindEBomToProcessRouting: false,
                showMbomOrProcessRouting: false,
              });
            }
          }
        },
      );
    });
  };

  setProcessRoutingProcessData = async (processRoutingCode, initialData) => {
    const res = await getProcessRoutingByCode({ code: processRoutingCode });

    const { data } = res || {};
    const { data: realData } = data || {};
    const { processList } = realData || {};
    const { taskAuditors } = initialData || {};
    const { editing } = this.props;

    formatProcessList(processList).then(res => {
      this.setState({
        listData: res,
        needTaskAudit: _.find(res, o => o.deliverable),
      });
      if (editing) {
        // bugfix: GC-6379
        this.setState({
          needTaskAudit: _.find(res, o => o.deliverable) && _.get(taskAuditors, 'length') > 0,
        });
      }
    });
    return realData;
  };

  setMBomProcessData = async (code, mbomVersion, initialData) => {
    const res = await getMbomByMaterialCodeAndVersion({
      code,
      version: mbomVersion,
    });
    const { data } = res || {};
    const { data: realData } = data || {};
    const { processList, bindEBomToProcessRouting, ebomVersion } = realData || {};
    const { taskAuditors } = initialData || {};
    const { editing } = this.props;

    formatProcessListForMbom(processList).then(res => {
      this.setState({
        ebomData: [],
        listData: res,
        bindEBomToProcessRouting,
        needTaskAudit: _.find(res, o => o.deliverable),
      });
      if (ebomVersion && bindEBomToProcessRouting === false) this.setEBomMaterialData(code, ebomVersion);
      if (editing) {
        // bugfix: GC-6379
        this.setState({
          needTaskAudit: _.find(res, o => o.deliverable) && _.get(taskAuditors, 'length') > 0,
        });
      }
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

  getAuthorities = fieldName => {
    switch (fieldName) {
      case 'taskAuditorIds':
        return [auth.WEB_AUDIT_MANUFACTURE_TASK];
      case 'auditorIds':
        return [auth.WEB_AUDIT_PLAN_WORK_ORDER];
      default:
        return [];
    }
  };

  getAuditorColumns = ({ fieldName, disabled = false }) => {
    const { form } = this.props;
    const { changeChineseToLocale } = this.context;
    const { getFieldDecorator } = form || {};
    const tip = <span style={{ color: 'rgba(0, 0, 0, 0.4)' }}>{changeChineseToLocale('(最多添加5个)')}</span>;
    const FieldDom = fieldName === 'taskAuditorIds' ? UserAndUserGroupSelect : AuditorSelect;
    const authorities = this.getAuthorities(fieldName);
    return [
      {
        title: (
          <div>
            {changeChineseToLocale('审批人')}
            {tip}
          </div>
        ),
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
                    required: !disabled,
                    message: changeChineseToLocale('审批人必填'),
                  },
                ],
              })(
                <FieldDom
                  userSelectParams={{
                    params: { authorities: authorities.join(','), active: true },
                  }}
                  userGroupSelectParams={{
                    params: {
                      authorities: authorities.join(','),
                      active: true,
                      fake: false,
                    },
                  }}
                  form={form}
                  disabled={disabled}
                  params={{ authorities: authorities.join(',') }}
                />,
              )}
            </FormItem>
          );
        },
      },
    ];
  };

  setAuditors = data => {
    this.setState({ auditors: data });
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
      attachments,
      processRouteName,
      processRouteCode,
      purchaseOrderCode,
      type,
      remark,
      auditProcessDTO,
      needAudit,
      auditorIds,
      productBatch,
      productBatchType,
      taskAuditors,
      taskAuditorIds,
      orderMaterialId,
      targetDate,
      fieldDTO,
      ...rest
    } = data || {};

    const { workOrderAuditConfig, taskAuditConfig } = getAuditConfig();
    const customFields = {};
    if (!arrayIsEmpty(fieldDTO)) {
      fieldDTO.forEach(e => (customFields[e.name] = e.content));
    }

    this.setState(
      {
        productBatchType: productBatchType || 1,
        initialFormData: data,
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
        showPurchaseOrderSelect: type === plannedTicket_types.purchaseOrderType.value,
        materialTargetDate: targetDate,
      },
      async () => {
        // 设置附件，订单交货日期
        if (purchaseOrderCode) {
          setFieldsValue({
            purchaseOrder: { key: purchaseOrderCode, label: purchaseOrderCode },
          });
          this.onChangeForPurchaseOrder(purchaseOrderCode, true);
        }

        if (!_.isEmpty(this.state.outputMaterial)) {
          try {
            const { code, name } = this.state.outputMaterial;
            const res = await queryMaterialDetail(code);
            const detail = _.get(res, 'data.data');
            const { issueWarehouseCode, issueWarehouseId, issueWarehouseName } = detail || {};
            const issueWarehouse = issueWarehouseCode
              ? {
                  id: issueWarehouseId,
                  name: issueWarehouseName,
                  code: issueWarehouseCode,
                }
              : null;
            this.setState({ issueWarehouse });
            if (issueWarehouseCode) {
              this.queryAvailableInventory(code, issueWarehouseCode);
            }
          } catch (error) {
            console.log(error);
          }
        }

        if (!arrayIsEmpty(attachments)) {
          getAttachments(attachments)
            .then(res => {
              const attachmentFiles = _.get(res, 'data.data');
              setFieldsValue({ attachments: attachmentFiles });
            })
            .catch(err => console.log(err));
        }

        setFieldsValue({
          type,
          code,
          amount,
          priority,
          selectType,
          orderMaterialId,
          productBatch: productBatchType === 2 ? (productBatch ? Number(productBatch) : null) : productBatch,
          productBatchType: productBatchType || 1,
          planEndTime: planEndTime ? formatUnixMoment(planEndTime) : undefined,
          ebom: ebomVersion ? { key: ebomVersion, label: ebomVersion } : undefined,
          mbom: mbomVersion ? { key: mbomVersion, label: mbomVersion } : undefined,
          planBeginTime: planBeginTime ? formatUnixMoment(planBeginTime) : undefined,
          processRoute: processRouteCode
            ? {
                key: processRouteCode,
                label: `${processRouteCode}/${processRouteName}`,
              }
            : null,
          remark,
          material: materialCode ? { key: materialCode, label: `${materialCode}/${materialName}` } : undefined,
          customFields,
          ...rest,
        });

        if (Array.isArray(taskAuditorIds) && !editing) {
          this.setTaskAuditors(taskAuditorIds && taskAuditorIds.map(id => ({ id })));
        }

        if (taskAuditors && taskAuditConfig === 'true' && editing) {
          this.setTaskAuditors(taskAuditors && taskAuditors.map(({ ids }) => ({ id: ids })));
        }

        if (!editing && workOrderAuditConfig === 'true' && auditorIds) {
          // 创建：带入上一次创建时填入的值
          this.setAuditors(auditorIds && auditorIds.map(id => ({ id })));
        }

        if (editing && workOrderAuditConfig === 'true' && needAudit) {
          // 编辑
          const { auditors } = auditProcessDTO || {};
          const _auditors = Array.isArray(auditors) ? auditors.map(({ id }, i) => id && id.toString()) : null;
          this.props.form.setFieldsValue({ auditors: _auditors });
          this.setAuditors(auditors);
        }

        if (Array.isArray(planners) && planners.length > 0) {
          this.props.form.setFieldsValue({
            planners: planners.map(({ id, name }) => ({ key: id, label: name })),
          });
        } else {
          this.props.form.resetFields('planners');
        }
        if (Array.isArray(managers) && managers.length > 0) {
          this.props.form.setFieldsValue({
            managers: managers.map(({ id, name }) => ({ key: id, label: name })),
          });
        } else {
          this.props.form.resetFields('managers');
        }

        if (selectType === 'processRoute') {
          this.setProcessRoutingProcessData(processRouteCode, data);
        }

        if (selectType === 'mbom') {
          this.setMBomProcessData(materialCode, mbomVersion, data);
        }

        if (selectType === 'processRouteEbom' && ebomVersion) {
          this.setEBomMaterialData(materialCode, ebomVersion);
          this.setProcessRoutingProcessData(processRouteCode, data);
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

  // 销售订单改变的回调
  onChangeForPurchaseOrder = (purchaseOrderCode, isSetInitialValue) => {
    // 清除的时候
    if (!purchaseOrderCode) {
      this.setState({
        materialTargetDate: null,
        files: null,
        purchaseOrderCode: null,
      });
      return;
    }

    // 设置附件，订单交货日期
    getPurchaseOrderDetail(purchaseOrderCode).then(async res => {
      const materialList = _.get(res, 'data.data.materialList');
      const { data } = this.props;
      const { orderMaterialId } = data || {};

      if (orderMaterialId) {
        const materialLine = _.find(materialList, o => o.id === orderMaterialId);
        const materialTargetDate = materialLine && materialLine.targetDate;
        this.setState({ materialTargetDate });
      }
      const fileIds = _.get(res, 'data.data.attachments');
      const filesRes = Array.isArray(fileIds) ? await getAttachments(fileIds) : null;
      const files = _.get(filesRes, 'data.data');

      const newState = {
        // purchaseOrderTargetDate: moment(purchaseOrderTargetDate).format('YYYY/MM/DD'),
        purchaseOrderCode,
      };

      // 设置初始值的时候不需要设置附件
      if (!isSetInitialValue || orderMaterialId) {
        newState.files =
          Array.isArray(files) && files.length > 0
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
        this.props.form.validateFields(['planEndTime', 'planBeginTime'], {
          force: true,
        });
      });
    });
  };

  onChangeForMBom = async (value, code) => {
    const { key: mbomVersion } = value || {};

    if (code && mbomVersion) {
      try {
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
      } catch (error) {
        console.log(error);
      }
    } else {
      this.setState({
        listData: [],
        needTaskAudit: false,
      });
    }
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
            disabled={disabledList && disabledList.craft}
            type="mbom"
            style={baseFormItemStyle}
            params={{ materialCode: code, status: 1 }}
            placeholder="生产bom版本号"
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
      const { rawMaterialList, processRoutingCode, processRoutingName } = ebom_detail || {};
      if (processRoutingCode) {
        const processRoute = {
          key: processRoutingCode,
          label: `${processRoutingCode}/${processRoutingName}`,
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
            disabled={disabledList && disabledList.craft}
            placeholder="物料清单版本号"
            type="ebomExact"
            params={{ productMaterialCode: code, status: 1 }}
            style={baseFormItemStyle}
          />,
        )}
      </FormItem>
    );
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
            disabled={disabledList && disabledList.craft}
            type="processRouting"
            style={baseFormItemStyle}
            params={{ status: 1 }}
            placeholder={'工艺路线编号／名称'}
          />,
        )}
      </FormItem>
    );
  };

  renderProductBatchComp = (productBatchType, disabledList) => {
    return productBatchType === 1 ? (
      <Input style={{ width: 170 }} placeholder="请输入成品批次" disabled={disabledList && disabledList.productBatch} />
    ) : (
      <ProductBatchCodeRuleSelect disabled={disabledList && disabledList.productBatch} style={{ width: 170 }} />
    );
  };

  render() {
    const { workOrderAuditConfig, taskAuditConfig } = getAuditConfig();
    const { form, editing, disabledList, data } = this.props;
    const { orderMaterialId } = data || {};
    const { getFieldDecorator, getFieldValue, validateFields } = form;
    const {
      ebomData,
      unitName,
      listData,
      outputMaterial,
      auditors,
      taskAuditors,
      showMbomOrProcessRouting,
      bindEBomToProcessRouting,
      showPurchaseOrderSelect,
      helpMessageForPlanEndTime,
      helpMessageForPlanBeginTime,
      initialFormData,
      productUnits,
      productBatchType,
      needTaskAudit,
      materialTargetDate,
      issueWarehouse,
      availableInventory,
    } = this.state;

    const { needAudit } = initialFormData || {};

    return (
      <Form>
        <FormItem label={'计划工单类型'}>
          {getFieldDecorator('type', {
            rules: [
              {
                required: true,
                message: '计划工单类型',
              },
            ],
            onChange: v => {
              if (v === plannedTicket_types.purchaseOrderType.value) {
                this.setState(
                  {
                    showPurchaseOrderSelect: true,
                  },
                  () => {
                    this.onChangeForPurchaseOrder();
                  },
                );
              } else {
                this.setState({ showPurchaseOrderSelect: false }, () => {
                  this.onChangeForPurchaseOrder();
                });
              }
            },
          })(
            <Select style={baseFormItemStyle} disabled={disabledList && disabledList.plannedTicketType}>
              {Object.values(plannedTicket_types).map(i => {
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

                this.onChangeForPurchaseOrder(purchaseOrderCode, editing);
              },
            })(
              <Searchselect
                type="purchaseOrder"
                style={baseFormItemStyle}
                disabled={disabledList && disabledList.purchaseOrder}
              />,
            )}
            {/* <span style={{ marginLeft: 10, color: fontSub }}>{`订单交期：${this.state.purchaseOrderTargetDate || replaceSign}`}</span> */}
          </FormItem>
        ) : null}
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
              {
                validator: checkTwoSidesTrim('计划工单编号'),
              },
            ],
          })(
            <Input
              style={baseFormItemStyle}
              className={styles.baseFormItem}
              placerholder="请输入计划工单编号"
              disabled={editing || (disabledList && disabledList.code)}
            />,
          )}
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
              purchaseOrderCode={this.state.purchaseOrderCode}
              allowClear
              params={{ status: 'enable' }}
              style={{ width: 400 }}
              hideCreateButton
              showTargetDate={!orderMaterialId && !editing}
              disabled={disabledList && disabledList.product}
            />,
          )}
          {orderMaterialId ? (
            <span style={{ marginLeft: 10 }}>
              {`物料交货日期：${materialTargetDate ? moment(materialTargetDate).format('YYYY-MM-DD') : replaceSign}`}
            </span>
          ) : null}
        </FormItem>
        <FormItem label="" style={{ display: 'none' }}>
          {getFieldDecorator('orderMaterialId')(<Input />)}
        </FormItem>
        <FormItem label="规格">
          <div style={{ width: 560, wordBreak: 'break-all' }}>
            {(outputMaterial && outputMaterial.desc) || replaceSign}
          </div>
        </FormItem>
        <FormItem label="数量">
          <div>
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
            {getFieldDecorator('materialUnit', {
              initialValue: unitName,
              rule: [
                {
                  required: true,
                  message: '单位必填',
                },
              ],
            })(
              <Select style={{ width: 90, height: 32, verticalAlign: 'middle' }} placeholder={null} disabled="true">
                {productUnits &&
                  productUnits.map(({ key, label }) => (
                    <Option key={key} value={key}>
                      {label}
                    </Option>
                  ))}
              </Select>,
            )}
          </div>
          {issueWarehouse ? (
            <div>
              发料仓库 {issueWarehouse.name || replaceSign} 可用库存为
              <Link.NewTagLink
                href={toMaterialCollectReport({
                  filter: { material: getFieldValue('material') },
                })}
              >
                {' '}
                {thousandBitSeparator(availableInventory)}{' '}
              </Link.NewTagLink>
              {unitName}
            </div>
          ) : null}
        </FormItem>
        <div style={{ display: 'flex' }}>
          <FormItem label="成品批次">
            {getFieldDecorator('productBatchType', {})(
              <SelectWithIntl
                style={{ width: 120, marginRight: 10 }}
                disabled={disabledList && disabledList.productBatch}
                onChange={v => {
                  this.setState({ productBatchType: v });
                  this.props.form.resetFields(['productBatch']);
                }}
              >
                <Option value={1}>手动输入</Option>
                <Option value={2}>按规则生成</Option>
              </SelectWithIntl>,
            )}
          </FormItem>
          <FormItem>
            {getFieldDecorator('productBatch', {
              rules: [
                {
                  validator: productBatchType === 1 ? checkStringLength(100) : (rule, value, cb) => cb(),
                },
                {
                  validator: productBatchType === 1 ? checkTwoSidesTrim('成品批次') : (rule, value, cb) => cb(),
                },
              ],
            })(this.renderProductBatchComp(productBatchType, disabledList))}
          </FormItem>
        </div>
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
              disabled={disabledList && disabledList.priority}
            />,
          )}
        </FormItem>
        <div>
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
                      const materialTargetDate = this.state.materialTargetDate;

                      if (value && materialTargetDate && moment(value).isAfter(materialTargetDate, 'day')) {
                        this.setState({
                          helpMessageForPlanBeginTime: `计划开始时间不得晚于销售订单交期时间${moment(
                            materialTargetDate,
                          ).format('YYYY/MM/DD')}`,
                        });
                      } else {
                        this.setState({ helpMessageForPlanBeginTime: null });
                      }

                      cb();
                    },
                  },
                ],
              })(
                <DatePicker
                  disabled={disabledList && disabledList.planBeginTime}
                  placeholder="开始时间"
                  format="YYYY-MM-DD"
                  disabledDate={disabledDateBeforToday}
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
                      const materialTargetDate = this.state.materialTargetDate;

                      if (value && materialTargetDate && moment(value).isAfter(materialTargetDate, 'day')) {
                        this.setState({
                          helpMessageForPlanEndTime: `计划结束时间不得晚于销售订单交期时间${moment(
                            materialTargetDate,
                          ).format('YYYY/MM/DD')}`,
                        });
                      } else {
                        this.setState({ helpMessageForPlanEndTime: null });
                      }

                      cb();
                    },
                  },
                ],
              })(
                <DatePicker
                  disabled={disabledList && disabledList.planEndTime}
                  placeholder="结束时间"
                  disabledDate={disabledDateBeforToday}
                  format="YYYY-MM-DD"
                  style={{ marginLeft: 5, width: 145 }}
                />,
              )}
            </FormItem>
          </div>
          {helpMessageForPlanBeginTime || helpMessageForPlanEndTime ? (
            <div>
              <FormItem label={' '}>
                {helpMessageForPlanBeginTime ? (
                  <div
                    style={{
                      color: warning,
                      marginRight: 10,
                      lineHeight: '16px',
                    }}
                  >
                    {helpMessageForPlanBeginTime}
                  </div>
                ) : null}
                {helpMessageForPlanEndTime ? (
                  <div style={{ color: warning, lineHeight: '16px' }}>{helpMessageForPlanEndTime}</div>
                ) : null}
              </FormItem>
            </div>
          ) : null}
        </div>
        <UserOrUserGroupSelect
          disabled={disabledList && disabledList.planners}
          form={form}
          type="planners"
          label="计划员"
        />
        <UserOrUserGroupSelect
          disabled={disabledList && disabledList.managers}
          form={form}
          type="managers"
          label="生产主管"
          multiple
        />

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
                  this.props.form.setFieldsValue({
                    processRoute: { key: null, label: null },
                    ebomVersion: { key: null, label: null },
                    mbomVersion: { key: null, label: null },
                  });
                  this.setState(
                    {
                      showMbomOrProcessRouting: value,
                      needTaskAudit: false,
                      listData: value === 'mbom' || !_.get(getFieldValue('processRoute'), 'key') ? [] : listData,
                      ebomData: [],
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
                <SelectWithIntl disabled={disabledList && disabledList.craft} className={styles.select}>
                  <Option key="processRoute" value="processRoute">
                    工艺路线
                  </Option>
                  <Option key="mbom" value="mbom">
                    生产bom
                  </Option>
                  <Option key="processRouteEbom" value="processRouteEbom">
                    工艺路线+物料清单
                  </Option>
                </SelectWithIntl>,
              )}
            </FormItem>
          </div>
          <div className={styles['inline-block']}>
            {showMbomOrProcessRouting === 'processRoute' ? this.renderProcessRouting() : null}
            {showMbomOrProcessRouting === 'mbom' && outputMaterial ? this.renderMBom() : null}
            {showMbomOrProcessRouting === 'processRouteEbom' && outputMaterial
              ? this.renderProcessRoutingAndEbom()
              : null}
          </div>
        </React.Fragment>
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
              dataSource={taskAuditors}
              atLeastNum={1}
              maxNum={5}
              setDataSource={this.setTaskAuditors}
              columns={this.getAuditorColumns({
                fieldName: 'taskAuditorIds',
                disabled: disabledList && disabledList.taskAuditorIds,
              })}
            />
          </FormItem>
        ) : null}
        {(workOrderAuditConfig === 'true' && !editing) || (workOrderAuditConfig === 'true' && editing && needAudit) ? (
          <FormItem label="工单审批人" required>
            <AlterableTable
              itemName="后续审批人"
              fieldName="auditorIds"
              dataSource={auditors}
              atLeastNum={1}
              maxNum={5}
              setDataSource={this.setAuditors}
              columns={this.getAuditorColumns({ fieldName: 'auditorIds' })}
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
                  <div>支持扩展名：JPG/PNG/JPEG/PDF，最大不能超过10M，用于执行生产任务时查看。</div>
                  {/* <div>{`${getAttachmentTips(this.state.files)}`}</div> */}
                </div>
              }
            />,
          )}
        </FormItem>
        <div style={AttachmentTipStyle}>{`${getAttachmentTips(this.state.files)}`}</div>
        <FormItem label={'备注'}>
          {getFieldDecorator('remark')(<Textarea style={{ height: 120, width: 300 }} maxLength={500} />)}
        </FormItem>
      </Form>
    );
  }
}

PlannedTicketBaseForm.contextTypes = {
  changeChineseToLocale: () => {},
};

export default PlannedTicketBaseForm;
