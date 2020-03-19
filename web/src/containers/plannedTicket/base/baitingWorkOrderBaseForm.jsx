import React, { Component, Fragment } from 'react';
import handsontable from 'handsontable';
import { HotTable } from '@handsontable/react';
import _ from 'lodash';

import 'handsontable/dist/handsontable.full.css';
import 'handsontable/languages/zh-CN';

import {
  Form,
  Searchselect,
  FormItem,
  Select,
  Input,
  InputNumber,
  Textarea,
  Tooltip,
  Icon,
  DatePicker,
  Attachment,
} from 'src/components';
import { disabledDateBeforToday } from 'components/datePicker';
import {
  amountValidator,
  checkPositiveInteger,
  checkTwoSidesTrim,
  chineseValidator,
  supportSpecialCharacterValidator,
  CustomFields,
} from 'src/components/form';
import { getMboms } from 'services/bom/mbom';
import { middleGrey, error } from 'src/styles/color';
import { getWorkOrderCustomProperty } from 'services/cooperate/plannedTicket';
import moment from 'src/utils/time';
import { PLAN_TICKET_INJECTION_MOULDING, replaceSign } from 'src/constants';
import { queryMaterialDetail, queryMaterialList } from 'src/services/bom/material';
import { getPurchaseOrderDetail } from 'src/services/cooperate/purchaseOrder';
import { arrayIsEmpty } from 'utils/array';
import { getAttachments } from 'src/services/attachment';
import { getProcessRoutingByCode } from 'src/services/bom/processRouting';
import Table from 'containers/project/base/table';
import { formatUnixMoment } from 'utils/time';

import { plannedTicket_types, fetchAttachmentFiles } from '../util';
import UserOrUserGroupSelect from './userOrUserGroupSelect';
import ProcessRoutingSelect from './processRoutingSelect';

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
const Option = Select.Option;

type Props = {
  form: any,
  data: {},
  disabledList: any,
  editing: boolean,
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

class BaitingWorkOrderBaseForm extends Component {
  props: Props;
  constructor(props) {
    super(props);
    this.state = {
      outMaterials: [],
      inMaterials: [],
      listData: [],
      bindEBomToProcessRouting: false,
    };
  }

  async componentDidMount() {
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
    if (this.props.type === 'baiting') {
      this.setInitialTableData({});
    }
    this.setInitialData(this.props.data);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (!_.isEqual(nextProps.data, this.props.data)) {
      this.setInitialData(nextProps.data);
    }
    return true;
  }

  onSubmit = () => {
    const { outMaterials, inMaterials } = this.state;
    return { outMaterials, inMaterials };
  };

  setInitialData = async data => {
    const { category } = this.props;
    if (category === PLAN_TICKET_INJECTION_MOULDING && !_.isEmpty(data)) {
      const { planners, managers } = data;
      if (Array.isArray(planners) && planners.length > 0) {
        this.props.form.setFieldsValue({ planners: planners.map(({ id, name }) => ({ key: id, label: name })) });
      }

      if (Array.isArray(managers) && managers.length > 0) {
        this.props.form.setFieldsValue({ managers: managers.map(({ id, name }) => ({ key: id, label: name })) });
      }
      return;
    }
    if (!_.isEmpty(data)) {
      const {
        plannerId,
        managerId,
        planners,
        managers,
        inMaterial,
        outMaterial,
        planBeginTime,
        planEndTime,
        purchaseOrderCode,
        attachments,
        type,
        fieldDTO,
        ...rest
      } = data;
      const { processRouteCode } = rest || {};
      this.onChangeForProcessRouting(processRouteCode);
      if (purchaseOrderCode) {
        this.onChangeForPurchaseOrder(purchaseOrderCode, true);
      }

      if (!arrayIsEmpty(attachments)) {
        const attachmentFiles = await fetchAttachmentFiles(attachments);
        this.props.form.setFieldsValue({ attachments: attachmentFiles });
      }

      if (Array.isArray(planners) && planners.length > 0) {
        this.props.form.setFieldsValue({ planners: planners.map(({ id, name }) => ({ key: id, label: name })) });
      } else {
        this.props.form.resetFields('planners');
      }

      if (Array.isArray(managers) && managers.length > 0) {
        this.props.form.setFieldsValue({ managers: managers.map(({ id, name }) => ({ key: id, label: name })) });
      } else {
        this.props.form.resetFields('managers');
      }

      const customFields = {};
      if (!arrayIsEmpty(fieldDTO)) {
        fieldDTO.forEach(e => (customFields[e.name] = e.content));
      }

      this.setInitialTableData({ inMaterials: inMaterial, outMaterials: outMaterial });
      this.props.form.setFieldsValue({
        type,
        planEndTime: planEndTime ? formatUnixMoment(planEndTime) : undefined,
        planBeginTime: planBeginTime ? formatUnixMoment(planBeginTime) : undefined,
        customFields,
        ...rest,
      });
      setTimeout(() => {
        this.props.form.setFieldsValue({
          purchaseOrder: purchaseOrderCode ? { key: purchaseOrderCode, label: purchaseOrderCode } : undefined,
          customFields,
        });
      });
    }
  };

  setInitialTableData = ({ inMaterials, outMaterials }) => {
    if (!inMaterials && !outMaterials) {
      // 投入物料初始化
      const outRows = 2;
      const outColCount = 6;
      const outMaterials = [];
      for (let i = 0; i < outRows; i += 1) {
        const row = {};
        const headers = ['code', 'name', 'desc', 'unitName', 'totalAmount', 'perAmount'];
        for (let j = 0; j < outColCount; j += 1) {
          row[headers[j]] = '';
        }
        outMaterials.push(row);
      }
      // 产出物料初始化
      const inRows = 1;
      const inColCount = 5;
      const inMaterials = [];
      for (let i = 0; i < inRows; i += 1) {
        const headers = ['code', 'name', 'unitName', 'totalAmount', 'perAmount'];
        const row = {};
        for (let j = 0; j < inColCount; j += 1) {
          row[headers[j]] = '';
        }
        inMaterials.push(row);
      }
      this.setState({
        outMaterials,
        inMaterials,
      });
    } else {
      this.setState({
        outMaterials,
        inMaterials,
      });
    }
  };

  handleMateriaSearch = async (query, process) => {
    const { outMaterials } = this.state;
    let selected = [];
    if (outMaterials && outMaterials.length > 0) {
      selected = outMaterials.map(({ code }) => code);
    }
    let materials = [];
    try {
      const {
        data: { data },
      } = await queryMaterialList({ search: query, size: 50 });
      if (data && data.length > 0) {
        materials = data.map(({ code }) => code);
        materials = materials && materials.filter(x => selected.indexOf(x) === -1);
      }
    } catch (error) {
      console.log(error);
    }
    return process(materials);
  };

  getOutMaterialColHeaders = () => {
    const { changeChineseToLocale } = this.context;
    return ['物料编码', '物料名称', '规格', '单位', '总数量', '单次产出数量'].map(e => changeChineseToLocale(e));
  };

  getInMaterialColHeaders = () => {
    const { changeChineseToLocale } = this.context;
    return ['物料编码', '物料名称', '规格', '单位', '总数量', '单次产出用料量'].map(e => changeChineseToLocale(e));
  };

  amountValidator = (value, callback) => {
    setTimeout(() => {
      const str = value.toString();
      const arr = str.split('.');
      const integer = _.get(arr, '[0].length', 0);
      const decimal = _.get(arr, '[1].length', 0);
      if (typeof value !== 'number') {
        callback(false);
      } else if (value <= 0) {
        callback(false);
      } else if (integer > 9 || decimal > 6) {
        callback(false);
      } else {
        callback(true);
      }
    }, 100);
  };

  getOutMaterialColumns = () => {
    const { editing, data } = this.props;
    const { changeChineseToLocale } = this.context;
    const { status } = data || {};
    return [
      {
        data: 'code',
        type: 'dropdown',
        filter: true,
        source: this.handleMateriaSearch,
        placeholder: '请选择物料编号',
        readOnly: editing,
      },
      {
        data: 'name',
        type: 'text',
        editor: false,
        readOnly: true,
        placeholder: '物料名称',
      },
      {
        data: 'desc',
        type: 'text',
        editor: false,
        readOnly: true,
        placeholder: '规格',
      },
      {
        data: 'unitName',
        type: 'text',
        editor: false,
        readOnly: true,
        placeholder: '单位',
      },
      {
        data: 'totalAmount',
        type: 'numeric',
        placeholder: '请输入总数量',
        readOnly: editing && status !== 1,
        validator: this.amountValidator,
      },
      {
        data: 'perAmount',
        type: 'numeric',
        placeholder: '请输入单次产出数量',
        readOnly: editing && status !== 1,
        validator: this.amountValidator,
      },
    ].map(e => ({
      ...e,
      placeholder: changeChineseToLocale(e.placeholder),
    }));
  };

  getInMaterialColumns = () => {
    const { editing, data } = this.props;
    const { changeChineseToLocale } = this.context;
    const { status } = data || {};
    return [
      {
        data: 'code',
        type: 'dropdown',
        source: this.handleMateriaSearch,
        placeholder: '请选择物料编号',
        readOnly: editing,
      },
      {
        data: 'name',
        type: 'text',
        editor: false,
        readOnly: true,
        placeholder: '物料名称',
      },
      {
        data: 'desc',
        type: 'text',
        editor: false,
        readOnly: true,
        placeholder: '规格描述',
      },
      {
        data: 'unitName',
        type: 'text',
        editor: false,
        readOnly: true,
        placeholder: '单位',
      },
      {
        data: 'totalAmount',
        type: 'numeric',
        placeholder: '请输入总数量',
        readOnly: editing && status !== 1,
        validator: this.amountValidator,
      },
      {
        data: 'perAmount',
        type: 'numeric',
        placeholder: '请输入单次产出用料量',
        readOnly: editing && status !== 1,
        validator: this.amountValidator,
      },
    ].map(e => ({
      ...e,
      placeholder: changeChineseToLocale(e.placeholder),
    }));
  };

  setTableData = (target, rowNum, values) => {
    const { outMaterials, inMaterials } = this.state;
    const preValue = _.get(this.state, `${target}[${rowNum}]`, {});
    if (target === 'inMaterials') {
      // 下料工单投入物料只有一个
      _.set(inMaterials, `[${rowNum}]`, { ...preValue, ...values });
      this.setState({ inMaterials });
    } else {
      _.set(outMaterials, `[${rowNum}]`, { ...preValue, ...values });
      this.setState({ outMaterials });
    }
  };

  afterChange = (changes, source, target) => {
    if (changes && changes.length > 0) {
      changes.forEach(async ([row, prop, oldValue, newValue]) => {
        try {
          if (prop === 'code') {
            const {
              data: { data },
            } = await queryMaterialDetail(newValue);
            const { unitName, name, desc } = data || {};
            this.setTableData(target, row, {
              unitName,
              name,
              desc: desc || replaceSign,
            });
            if (target === 'outMaterials' && row === _.get(this.state, 'outMaterials.length') - 1) {
              this.setTableData(target, row + 1, {});
            }
          }
        } catch (error) {
          console.log(error);
        }
      });
    }
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
        this.props.form.validateFields(['planEndTime', 'planBeginTime'], { force: true });
      });
    });
  };

  onChangeForProcessRouting = async code => {
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

  onChangeForTooling = (code, _tooling) => {
    const { form } = this.props;
    const tooling = _tooling;
    // 自动带出模具中维护的序号最大的物料组
    const outputMaterials = !arrayIsEmpty(tooling.outputMaterials)
      ? tooling.outputMaterials[tooling.outputMaterials.length - 1].filter(e => e.outputMaterial)
      : [];
    Promise.all(
      outputMaterials.map(async (e, index) => {
        const { outputMaterialPrimaryUnitName, outputAmount, outputMaterialCode, outputMaterial } = e;
        const {
          data: { data: mboms },
        } = await getMboms({ materialCode: outputMaterialCode, status: 1 });
        return {
          ...e,
          key: index,
          unitName: outputMaterialPrimaryUnitName,
          desc: (outputMaterial && outputMaterial.desc) || replaceSign,
          maxPerAmount: outputAmount,
          mboms,
        };
      }),
    ).then(values => {
      const outAmount = form.getFieldValue('outAmount');
      this.props.onChangeForTooling(
        {
          dataSource: values,
          materialOptions: outputMaterials.map(e => e.outputMaterial),
        },
        () => {
          form.setFieldsValue({
            outMaterials: values.map(e => ({
              code: {
                key: e.outputMaterialCode,
                label: `${e.outputMaterialCode}/${e.outputMaterialName}`,
              },
              perAmount: e.outputAmount,
              totalAmount: outAmount && e.outputAmount ? outAmount * e.outputAmount : undefined,
              mbomVersion: e.mboms.length === 1 ? e.mboms[0].version : undefined,
            })),
          });
        },
      );
    });
    this.setState({ tooling });
  };

  render() {
    const {
      form,
      form: { getFieldDecorator, getFieldValue },
      disabledList,
      editing,
      type,
      outputMaterialsFormItem,
      inputMaterialsFormItem,
      processRoutingFormItem,
    } = this.props;
    const { changeChineseToLocale } = this.context;
    const { listData, bindEBomToProcessRouting, tooling } = this.state;
    const showPurchaseOrderSelect = getFieldValue('type') === plannedTicket_types.purchaseOrderType.value;

    const outputTooltip = (
      <Tooltip
        title={
          <div style={{ padding: 10 }}>
            <div style={{ color: 'black', fontSize: 14, marginBottom: 8 }}>{changeChineseToLocale('产出物料')}</div>
            <div style={{ color: 'rgba(0, 0, 0, 0.4)', marginBottom: 12 }}>
              {changeChineseToLocale('至少添加两种，支持从EXCEL中复制内容后直接粘贴至此列表。')}
            </div>
            <div style={{ color: 'black', fontSize: 14, marginBottom: 8 }}>{changeChineseToLocale('单次产出数量')}</div>
            <div style={{ color: 'rgba(0, 0, 0, 0.4)' }}>
              {changeChineseToLocale(
                '同一生产过程，不同物料同时产出时，单次产出的数量。例如：一块木板裁切成多种形状的半成品物料，每种半成品物料的数量。所有产出物料（单次产出数量/总数量）的比值须一致。',
              )}
            </div>
          </div>
        }
      >
        <Icon type="exclamation-circle-o" color={'rgba(0, 0, 0, 0.4)'} />
      </Tooltip>
    );
    const outputLabel = (
      <div>
        <span style={{ marginRight: 6 }}>
          <span style={{ color: error, marginRight: 4 }}>*</span>
          {changeChineseToLocale('产出物料')}
        </span>
        {outputTooltip}
      </div>
    );
    const inputTooltip = (
      <Tooltip
        title={
          <div style={{ padding: 10 }}>
            <div style={{ color: 'black', fontSize: 14, marginBottom: 8 }}>
              {changeChineseToLocale('单次产出用料量')}
            </div>
            <div style={{ color: 'rgba(0, 0, 0, 0.4)' }}>
              {changeChineseToLocale(
                '同一生产过程，不同物料同时产出时，产出“单次产出数量”的物料时，所用的投入物料数量。例如：投入一块木板裁切成多种形状的半成品物料，单次产出用料量为1块。',
              )}
            </div>
          </div>
        }
      >
        <Icon type="exclamation-circle-o" color={'rgba(0, 0, 0, 0.4)'} />
      </Tooltip>
    );
    const inputLabel = (
      <div>
        <span style={{ marginRight: 6 }}>
          <span style={{ color: error, marginRight: 4 }}>*</span>
          {changeChineseToLocale('投入物料')}
        </span>
        {inputTooltip}
      </div>
    );
    const processRoutingTooltip = (
      <Tooltip
        title={
          <div style={{ padding: 10 }}>
            <div style={{ color: 'black', fontSize: 14, marginBottom: 8 }}>{changeChineseToLocale('工艺')}</div>
            <div style={{ color: 'rgba(0, 0, 0, 0.4)' }}>
              {changeChineseToLocale('下料计划工单的工艺限制为工艺路线，不可更改。所选择的工艺路线有且仅有一道工序。')}
            </div>
          </div>
        }
      >
        <Icon type="exclamation-circle-o" color={'rgba(0, 0, 0, 0.4)'} />
      </Tooltip>
    );
    const processRoutingLable = (
      <div style={{ display: 'inline-block' }}>
        <span style={{ marginRight: 6 }}>{changeChineseToLocale('工艺')}</span>
        {processRoutingTooltip}
      </div>
    );

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
              this.onChangeForPurchaseOrder();
              // if (v === plannedTicket_types.purchaseOrderType.value) {
              //   this.setState(
              //     {
              //       showPurchaseOrderSelect: true,
              //     },
              //     () => {
              //       this.onChangeForPurchaseOrder();
              //     },
              //   );
              // } else {
              //   this.setState({ showPurchaseOrderSelect: false }, () => {
              //     this.onChangeForPurchaseOrder();
              //   });
              // }
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
        {showPurchaseOrderSelect && (
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
          </FormItem>
        )}
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
          })(<Input style={baseFormItemStyle} placerholder="请输入计划工单编号" disabled={editing} />)}
        </FormItem>
        {type === 'inject' ? (
          <Fragment>
            <FormItem label="模具定义">
              {getFieldDecorator('toolCode', {
                onChange: (value, option) => {
                  this.onChangeForTooling(value, option && option.props.data);
                },
              })(
                <Searchselect
                  disabled={editing}
                  style={baseFormItemStyle}
                  type="machiningMaterial"
                  params={{ status: 1 }}
                />,
              )}
            </FormItem>
            <FormItem label="产出次数">
              {getFieldDecorator('outAmount', {
                rules: [
                  {
                    required: true,
                    message: '产出次数必填',
                  },
                  {
                    validator: amountValidator(1e8, null, null, null, '产出次数'),
                  },
                ],
                onChange: value => {
                  const outMaterials = form.getFieldValue('outMaterials');
                  form.setFieldsValue({
                    outMaterials: outMaterials.map(
                      e =>
                        e && {
                          ...e,
                          totalAmount: value * e.perAmount || undefined,
                        },
                    ),
                  });
                },
              })(<InputNumber disabled={editing} style={baseFormItemStyle} />)}
            </FormItem>
          </Fragment>
        ) : null}
        {outputMaterialsFormItem || (
          <FormItem label={outputLabel}>
            <HotTable
              settings={{
                data: this.state.outMaterials,
                colHeaders: this.getOutMaterialColHeaders(),
                columns: this.getOutMaterialColumns(),
                rowHeaders: true,
                licenseKey: '7cc61-f2b0e-11070-b4335-ad80a',
                width: 900,
                height: 180,
                colWidths: 130,
                stretchH: 'all',
                beforePaste: (data, coords) => {
                  // 编辑时禁止粘贴
                  return !editing;
                },
                afterChange: (changes, source) => this.afterChange(changes, source, 'outMaterials'),
                manualRowMove: !editing,
                manualColumnResize: true,
                contextMenu: !editing
                  ? ['row_above', 'row_below', 'remove_row', 'alignment', 'undo', 'copy', 'cut']
                  : false,
                language: 'zh-CN',
              }}
            />
          </FormItem>
        )}
        {inputMaterialsFormItem || (
          <FormItem label={inputLabel}>
            <HotTable
              settings={{
                data: this.state.inMaterials,
                colHeaders: this.getInMaterialColHeaders(),
                columns: this.getInMaterialColumns(),
                copyRowsLimit: 1,
                beforePaste: (data, coords) => {
                  // 下料工单投入物料只有一个（粘贴时默认取第一条记录）,编辑时禁止粘贴
                  return editing ? false : data.splice(1, 1);
                },
                afterChange: (changes, source) => this.afterChange(changes, source, 'inMaterials'),
                manualColumnResize: true,
                colWidths: 130,
                width: 900,
                height: 100,
                stretchH: 'all',
                licenseKey: '7cc61-f2b0e-11070-b4335-ad80a',
                language: 'zh-CN',
              }}
            />
          </FormItem>
        )}
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
        <React.Fragment>
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
                ],
              })(
                <DatePicker
                  placeholder="开始时间"
                  disabledDate={disabledDateBeforToday}
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
                      this.props.form.validateFields(['planBeginTime'], { force: true });
                    },
                  );
                },
              })(
                <DatePicker
                  placeholder="结束时间"
                  disabledDate={disabledDateBeforToday}
                  format="YYYY-MM-DD"
                  style={{ marginLeft: 5, width: 145 }}
                />,
              )}
            </FormItem>
          </div>
        </React.Fragment>
        <UserOrUserGroupSelect form={form} type="planners" label="计划员" />
        <UserOrUserGroupSelect form={form} type="managers" label="生产主管" multiple />
        {processRoutingFormItem || (
          <FormItem label={processRoutingLable}>
            <div style={{ display: 'inline-block' }}>
              <Input style={{ width: 90, marginRight: 10 }} value={changeChineseToLocale('工艺路线')} disabled />
            </div>
            <div style={{ display: 'inline-block' }}>
              {getFieldDecorator('processRouteCode', {
                rules: [
                  {
                    required: true,
                    message: '工艺不能为空',
                  },
                ],
                onChange: this.onChangeForProcessRouting,
              })(<ProcessRoutingSelect style={{ width: 300 }} disabled={disabledList && disabledList.craft} />)}
            </div>
          </FormItem>
        )}
        <div style={!_.get(listData, 'length') ? { display: 'none' } : {}}>
          <div style={{ display: 'inline-block', width: 610, verticalAlign: 'top', marginLeft: 120, marginBottom: 20 }}>
            {Array.isArray(listData) && listData.length > 0 ? (
              <Table
                rowKey={record => record.seq}
                bindEBomToProcessRouting={bindEBomToProcessRouting}
                data={listData}
                style={{ width: 610 }}
              />
            ) : null}
          </div>
        </div>
        <CustomFields prefix={'customFields'} form={form} fields={this.state.customFields} />
        <FormItem label="备注">
          {getFieldDecorator('remark')(<Textarea style={{ height: 120, width: 300 }} maxLength={500} />)}
        </FormItem>
        <FormItem label="附件">
          {getFieldDecorator('attachments', {
            initialValue: this.state.files || [],
          })(
            <Attachment
              rest
              prompt={
                <div style={AttachmentPromptStyle}>
                  <div>支持扩展名：JPG/PNG/JPEG/PDF，最大不能超过10M。</div>
                  {/* <div>{`${getAttachmentTips(this.state.files)}`}</div> */}
                </div>
              }
            />,
          )}
        </FormItem>
      </Form>
    );
  }
}
BaitingWorkOrderBaseForm.contextTypes = {
  changeChineseToLocale: () => {},
};

export default BaitingWorkOrderBaseForm;
