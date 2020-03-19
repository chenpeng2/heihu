import React, { Component } from 'react';
import { Radio, Modal } from 'antd';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import {
  Select,
  Table,
  message,
  FormItem,
  DatePicker,
  InputNumber,
  DetailPageHeader,
  Input,
  Form,
  Row,
  Col,
  Popover,
  Tooltip,
  FormattedMessage,
} from 'components';
import { amountValidator, checkTwoSidesTrim, requiredRule } from 'components/form';
import MaterialSelect from 'components/select/materialSelect';
import { formatFraction, mathJs, thousandBitSeparator, getFractionString, fraction } from 'src/utils/number';
import SearchSelect from 'components/select/searchSelect';
import { formatProcessRouting, formatMBom } from 'src/containers/mBom/util';
import { addMBom, getMBomById } from 'src/services/bom/mbom';
import { getProcessRoutingByCode } from 'src/services/bom/processRouting';
import { getEbomDetail, getEbomListWithExactSearch } from 'src/services/bom/ebom';
import moment, { formatToUnix } from 'utils/time';
import { error, blacklakeGreen } from 'styles/color';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';
import ProcessListForm from '../base/processListForm';
import styles from './styles.scss';
import { getMbomVersionInLocalStorage } from '../util';

const RadioGroup = Radio.Group;
const Option = Select.Option;
const confirm = Modal.confirm;

const inputWidth = 200;

type props = {
  form: {},
  edit: boolean,
  match: {},
};

class MBomBaseForm extends Component<props> {
  state = {
    eboms: [],
  };
  async componentDidMount() {
    const { match, form } = this.props;
    const mBomId = _.get(match, 'params.mBomId');
    if (mBomId) {
      const {
        data: { data },
      } = await getMBomById(mBomId);
      const mBom = formatMBom(data);
      const {
        material,
        materialCode,
        materialName,
        defNum,
        ebomVersion,
        bindEBomToProcessRouting,
        processRoutingCode,
        processRoutingName,
        validFrom,
        validTo,
        version,
        processList,
        currentUnitId,
      } = mBom;
      const {
        data: { data: eboms },
      } = await getEbomListWithExactSearch({ productMaterialCode: materialCode, status: -1 });
      const {
        data: { data: _processRouting },
      } = await getProcessRoutingByCode({ code: processRoutingCode });
      const processRouting = formatProcessRouting(_processRouting);
      const ebom = eboms.find(e => e.version === ebomVersion);
      const { unitId, unitName, unitConversions } = material;
      const unitSelections = [{ id: unitId, name: unitName }].concat(
        (unitConversions || []).map(({ slaveUnitId, slaveUnitName }) => ({
          id: slaveUnitId,
          name: slaveUnitName,
        })),
      );
      const values = {
        materialCode: {
          key: JSON.stringify(material),
          label: `${materialCode}/${materialName}`,
        },
        defNum,
        currentUnitId: currentUnitId || material.unitId,
        unitSelections,
        validFrom: validFrom && moment(Number(validFrom)),
        validTo: validTo && moment(Number(validTo)),
        version,
        ebomVersion: ebom ? JSON.stringify({ id: ebom.id, version: ebomVersion }) : undefined,
        bindEBomToProcessRouting: ebom && bindEBomToProcessRouting,
        processRoutingCode: { key: processRoutingCode, label: processRoutingName },
        processList: processList.map(({ nodes = [], ...rest }, index) => ({
          ...rest,
          nodes: nodes.map(({ inputMaterials = [], toolings = [], ...rest }) => {
            const preNode = processList[index - 1] && processList[index - 1].nodes[0];
            return {
              ...rest,
              inputMaterials:
                Array.isArray(inputMaterials) &&
                inputMaterials.map(e => ({
                  ...e,
                  produceMode: e.materialProductionMode,
                })),
              preMaterialProductionMode: _.get(preNode, 'outputMaterial.materialProductionMode') || 1,
              toolings:
                Array.isArray(toolings) &&
                toolings.map(e => {
                  const { toolingCode, tooling = {}, count } = e || {};
                  return {
                    toolingCode: { key: toolingCode, label: `${toolingCode}/${tooling.name}` },
                    type: tooling.toolingType,
                    count,
                    unit: tooling.unitName,
                  };
                }),
              toolingMaterials: _(toolings)
                .map(e => _.get(e, 'tooling.outputMaterials'))
                .flattenDeep()
                .uniqBy('outputMaterialCode')
                .value(),
              toolingKeys: toolings.map((value, index) => index),
            };
          }),
        })),
      };
      this.setState({ ebom, eboms, processRouting }, () => {
        form.setFieldsValue(values);
      });
    }
  }

  checkSave = () => {
    const refComponent = this.processRouteGraphAndEditFormRef;
    if (refComponent) {
      return refComponent.saveFormValue();
    }
  };

  checkEbomCurrentUnit = value => {
    const { form } = this.props;
    const currentUnitId = _.get(value, 'currentUnitId') || form.getFieldsValue().currentUnitId;
    const ebom = _.get(value, 'ebom') || this.state.ebom;
    const { unitId, currentUnitId: eBomCurrentUnitId } = ebom || {};
    if (ebom && currentUnitId !== (eBomCurrentUnitId || unitId)) {
      message.error('生产BOM和物料清单的成品物料单位不一致。');
    }
  };

  checkProcessList = value => {
    const { form } = this.props;
    const { ebom } = this.state;
    const { getFieldValue } = form;
    if (getFieldValue('bindEBomToProcessRouting') && ebom) {
      const { rawMaterialList } = ebom;
      let materialArray = [];
      if (!value) {
        message.error('选择物料清单版本号时所有管控为是的物料都必须配置');
        return false;
      }
      value.forEach(({ inputMaterials, outputMaterial, nodes }, index) => {
        if (inputMaterials && inputMaterials.length) {
          materialArray = materialArray.concat(inputMaterials);
        }
        // 最后一个节点的产出物料为成品物料 且不在MBom中
        if (outputMaterial && index !== value.length - 1) {
          materialArray.push(outputMaterial);
        }
        if (nodes.length) {
          nodes.forEach(({ inputMaterials, outputMaterial }) => {
            if (inputMaterials) {
              materialArray = materialArray.concat(inputMaterials);
            }
            if (outputMaterial && index !== value.length - 1) {
              materialArray.push(outputMaterial);
            }
          });
        }
      });
      // 过滤undefined
      materialArray = materialArray.filter(e => e && e.material);
      // 用来记录多配置的物料
      const otherMaterialList = [];
      const materialList = _.cloneDeep(rawMaterialList.filter(e => e.regulatoryControl))
        .map(i => {
          if (i.amountFraction) {
            i.amount = getFractionString(i.amountFraction);
          }
          return i;
        })
        .reduce((res, ele) => {
          const material = _.find(res, e => _.isEqual(e.material.code, ele.material.code));
          if (material) {
            material.amount = formatFraction(mathJs.add(fraction(material.amount), fraction(ele.amount)));
          } else {
            res.push(ele);
          }
          return res;
        }, []);
      materialArray.forEach(ele => {
        const id = materialList.findIndex(e => _.isEqual(e.material.code, ele.material.code));
        if (id !== -1) {
          materialList[id].amount = formatFraction(
            mathJs.subtract(fraction(materialList[id].amount), fraction(ele.amount)),
          );
          if (mathJs.smallerEq(fraction(materialList[id].amount), 0)) {
            materialList.splice(id, 1);
          }
        } else {
          otherMaterialList.push(ele);
        }
      });
      const list = materialList.concat(otherMaterialList);
      if (list.length) {
        const materialNames = list.map(({ material }) => `${material.code}/${material.name}`).join(',');

        message.error(
          `选择物料清单版本号时已配置的物料总数量需等于物料清单内投料管控为“是”的物料数量,物料${materialNames}数量校验失败。`,
        );
        return false;
      }
    }
    return true;
  };

  checkEbomCurrentUnit = () => {
    const { form } = this.props;
    const { currentUnitId } = form.getFieldsValue();
    const { ebom } = this.state;
    const { unitId, currentUnitId: ebomCurrentUnitId } = ebom || {};
    if (currentUnitId !== (ebomCurrentUnitId || unitId)) {
      message.error('生产BOM和物料清单的成品物料单位不一致。');
    }
  };

  checkVirtualMaterial = (value, callback) => {
    const { form } = this.props;
    const { ebom } = this.state;
    const { getFieldValue } = form;
    const { processList } = value;
    const processNames = [];
    if ((getFieldValue('bindEBomToProcessRouting') && ebom) || !ebom) {
      processList.forEach(({ inputMaterials, outputMaterial, nodes, name }, index) => {
        // 并行工序组
        if (index === processList.length - 1) {
          return;
        }
        if (nodes.length > 1) {
          if (!outputMaterial || !outputMaterial.material) {
            processNames.push(name);
          }
        } else if (nodes.length) {
          // 其他工序
          nodes.forEach(({ outputMaterial, process }) => {
            if (!outputMaterial || !outputMaterial.material) {
              processNames.push(process.name);
            }
          });
        }
      });
    }
    if (processNames.length) {
      confirm({
        title: changeChineseToLocaleWithoutIntl('提示'),
        content: changeChineseToLocaleWithoutIntl(
          '{processNames}没有配置产出物料，系统会按照输入的数量配比自动生成虚拟物料，如果未输入数量则会与成品1:1的配比，确认保存吗？',
          { processNames: processNames.join(',') },
        ),
        cancelText: changeChineseToLocaleWithoutIntl('返回重新填写'),
        okText: changeChineseToLocaleWithoutIntl('保存'),
        iconType: 'exclamation-circle',
        onOk: () => {
          callback(value);
        },
        onCancel: () => {},
      });
    } else {
      return callback(value);
    }
  };

  renderEbomPreview = ebom => {
    const rawMaterialList = ebom.rawMaterialList;
    const columns = [
      {
        title: '物料编号/名称',
        width: 180,
        dataIndex: 'material',
        render: material => {
          return <Tooltip overlayStyle={{ zIndex: 10001 }} text={`${material.code}/${material.name}`} length={15} />;
        },
      },
      {
        title: '单位',
        dataIndex: 'currentUnit.name',
        key: 'unit',
        maxWidth: { C: 4 },
        render: (currentUnitName, record) => currentUnitName || record.material.unitName,
      },
      {
        title: '数量',
        key: 'amount',
        render: (__, record) => {
          const { amount, amountFraction } = record || {};

          return amountFraction ? getFractionString(amountFraction) : thousandBitSeparator(amount);
        },
      },
      {
        title: '物料管控',
        dataIndex: 'regulatoryControl',
        render: regulatoryControl => {
          return regulatoryControl ? '是' : '否';
        },
      },
    ];
    return <Table dataSource={rawMaterialList} columns={columns} pagination={false} />;
  };

  handleSetProcessRouting = async code => {
    const {
      data: { data },
    } = await getProcessRoutingByCode({ code });
    const processRouting = formatProcessRouting(data);
    this.setState({ processRouting });
  };

  setProcessRoutingByEbom = async ({ processRoutingName, processRoutingCode, form }) => {
    if (processRoutingCode) {
      form.setFieldsValue({
        processRoutingCode: {
          key: processRoutingCode,
          label: `${processRoutingCode}/${processRoutingName}`,
        },
      });
      await this.handleSetProcessRouting(processRoutingCode);
    }
  };

  render() {
    const { form, edit } = this.props;
    const { getFieldDecorator, getFieldValue, setFieldsValue } = form;
    const { helpMessageForTime, eboms, ebom, processRouting, mBom, confirmType } = this.state;
    getFieldDecorator('bindEBomToProcessRouting');
    getFieldDecorator('unitSelections', {
      initialValue: [],
    });
    const unitSelections = getFieldValue('unitSelections');
    return (
      <div className={styles.MBomBaseFormContainer} style={{ padding: 20 }}>
        <DetailPageHeader
          style={{ marginLeft: -20, paddingTop: 0 }}
          title={
            <div style={{ fontSize: 22 }}>
              <FormattedMessage defaultMessage={edit ? '编辑生产BOM' : '创建生产BOM'} />
            </div>
          }
        />
        <Form>
          <Row>
            <Col>
              <FormItem label="成品物料编号/名称">
                {getFieldDecorator('materialCode', {
                  rules: [requiredRule('成品物料编码/名称')],
                  onChange: async value => {
                    const { key } = value;
                    const material = JSON.parse(key);
                    const { unitId, unitName, unitConversions } = material;
                    const unitSelections = [{ id: unitId, name: unitName }].concat(
                      (unitConversions || []).map(({ slaveUnitId, slaveUnitName }) => ({
                        id: slaveUnitId,
                        name: slaveUnitName,
                      })),
                    );
                    const oldValue = getFieldValue('materialCode');
                    if (oldValue && !_.isEqual(oldValue.key, value && value.key)) {
                      confirm({
                        title: changeChineseToLocaleWithoutIntl('提示'),
                        content: changeChineseToLocaleWithoutIntl(
                          '选择成品物料{materialName}后，生产的BOM中已有的物料清单版本号和物料信息会被覆盖，确认选择吗？',
                          { materialName: material.name },
                        ),
                        cancelText: changeChineseToLocaleWithoutIntl('暂不选择'),
                        okText: changeChineseToLocaleWithoutIntl('确认选择'),
                        iconType: 'exclamation-circle',
                        onOk: async () => {
                          form.resetFields(['processList', 'ebomVersion']);
                          const {
                            data: { data },
                          } = await getEbomListWithExactSearch({ productMaterialCode: material.code, status: -1 });
                          this.setState({ eboms: data, ebom: undefined });
                          setFieldsValue({ currentUnitId: unitId, unitSelections });
                        },
                        onCancel: () => {
                          setTimeout(() => {
                            form.setFieldsValue({ materialCode: oldValue });
                          });
                        },
                      });
                    } else {
                      if (unitId) {
                        setFieldsValue({ currentUnitId: unitId });
                      } else {
                        form.resetFields(['currentUnitId']);
                      }
                      setFieldsValue({ unitSelections });
                      const {
                        data: { data },
                      } = await getEbomListWithExactSearch({ productMaterialCode: material.code, status: -1 });
                      this.setState({ eboms: data });
                    }
                  },
                })(<MaterialSelect disabled={edit} params={{ status: 1 }} />)}
              </FormItem>
            </Col>
            <Col>
              <FormItem label="数量">
                {getFieldDecorator('defNum', {
                  initialValue: 1,
                  rules: [requiredRule('数量'), { validator: amountValidator(1e6) }],
                })(<InputNumber disabled={ebom} />)}
              </FormItem>
            </Col>
            <Col>
              <FormItem label="单位">
                {getFieldDecorator('currentUnitId', {
                  getValueFromEvent: currentUnitId => {
                    const unit = unitSelections.find(e => e.id === currentUnitId);
                    confirm({
                      title: changeChineseToLocaleWithoutIntl('提示'),
                      content: changeChineseToLocaleWithoutIntl(
                        '选择单位{unitName}后，生产的BOM中已有的物料清单版本号和物料信息会被覆盖，确认选择吗？',
                        { unitName: unit.name },
                      ),
                      cancelText: changeChineseToLocaleWithoutIntl('暂不选择'),
                      okText: changeChineseToLocaleWithoutIntl('确认选择'),
                      iconType: 'exclamation-circle',
                      onOk: async () => {
                        form.resetFields(['processList', 'ebomVersion']);
                        this.setState({ ebom: undefined });
                        form.setFieldsValue({ currentUnitId });
                      },
                    });
                    return getFieldValue('currentUnitId');
                  },
                })(
                  <Select disabled={edit} style={{ width: inputWidth }} placeholder={null}>
                    {unitSelections.map(({ id, name }) => (
                      <Option id={id} value={id}>
                        <FormattedMessage defaultMessage={name} />
                      </Option>
                    ))}
                  </Select>,
                )}
              </FormItem>
            </Col>
            <Col>
              <FormItem label="版本号">
                {getFieldDecorator('version', {
                  rules: [requiredRule('版本号'), { validator: checkTwoSidesTrim('版本号') }],
                  initialValue: getMbomVersionInLocalStorage(),
                })(<Input disabled={edit} style={{ width: inputWidth }} placeholder="请输入生产BOM版本号" />)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col>
              <FormItem
                label="有效期"
                validateStatus={helpMessageForTime ? 'error' : undefined}
                help={
                  helpMessageForTime ? (
                    <div style={{ color: error }}>
                      <FormattedMessage defaultMessage={helpMessageForTime} />
                    </div>
                  ) : null
                }
              >
                {getFieldDecorator('validFrom', {
                  rules: [
                    {
                      validator: (rule, value, cb) => {
                        const endTime = getFieldValue('validTo');
                        if (value && endTime && moment(value).isAfter(endTime)) {
                          this.setState(
                            {
                              helpMessageForTime: '结束时间不可早于开始时间',
                            },
                            () => {
                              cb(changeChineseToLocaleWithoutIntl('结束时间不可早于开始时间'));
                            },
                          );
                          return;
                        }
                        this.setState(
                          {
                            helpMessageForTime: null,
                          },
                          () => {
                            cb();
                          },
                        );
                      },
                    },
                  ],
                })(
                  <DatePicker
                    style={{ width: inputWidth / 1.5, marginRight: 5 }}
                    format="YYYY-MM-DD"
                    placeholder="开始时间"
                  />,
                )}
                ~
                {getFieldDecorator('validTo', {
                  rules: [
                    {
                      validator: (rule, value, cb) => {
                        const startTime = getFieldValue('validFrom');
                        if (value && startTime && moment(value).isBefore(startTime)) {
                          this.setState(
                            {
                              helpMessageForTime: '结束时间不可早于开始时间',
                            },
                            () => {
                              cb(changeChineseToLocaleWithoutIntl('结束时间不可早于开始时间'));
                            },
                          );
                          return;
                        }
                        this.setState(
                          {
                            helpMessageForTime: null,
                          },
                          () => {
                            cb();
                          },
                        );
                      },
                    },
                  ],
                })(
                  <DatePicker
                    style={{ width: inputWidth / 1.5, marginLeft: 5 }}
                    format="YYYY-MM-DD"
                    placeholder="结束时间"
                  />,
                )}
              </FormItem>
            </Col>
            <Col>
              <FormItem label="工艺路线">
                {getFieldDecorator('processRoutingCode', {
                  rules: [requiredRule('工艺路线')],
                  onChange: async value => {
                    const { key: code, label } = value || {};
                    const oldValue = getFieldValue('processRoutingCode');
                    if (oldValue && !_.isEqual(oldValue, value)) {
                      if (!value) {
                        const { key: code, label } = oldValue;
                        confirm({
                          title: changeChineseToLocaleWithoutIntl('提示'),
                          content: changeChineseToLocaleWithoutIntl(
                            '工艺路线{label}删除后，生产的BOM中已有的物料信息会被清空，确认选择吗？',
                            { label },
                          ),
                          cancelText: changeChineseToLocaleWithoutIntl('暂不选择'),
                          okText: changeChineseToLocaleWithoutIntl('确认选择'),
                          iconType: 'exclamation-circle',
                          onOk: async () => {
                            form.resetFields(['processList', 'bindEBomToProcessRouting']);
                            this.setState({ processRouting: undefined });
                          },
                          onCancel: () => {
                            setTimeout(() => {
                              form.setFieldsValue({ processRoutingCode: oldValue });
                            });
                          },
                        });
                      } else {
                        confirm({
                          title: changeChineseToLocaleWithoutIntl('提示'),
                          content: changeChineseToLocaleWithoutIntl(
                            '导入工艺路线{label}后，生产的BOM中已有的工艺路线和物料信息会被覆盖，确认选择吗？',
                            { label },
                          ),
                          cancelText: changeChineseToLocaleWithoutIntl('暂不选择'),
                          okText: changeChineseToLocaleWithoutIntl('确认选择'),
                          iconType: 'exclamation-circle',
                          onOk: async () => {
                            form.resetFields(['processList', 'bindEBomToProcessRouting']);
                            await this.handleSetProcessRouting(code);
                          },
                          onCancel: () => {
                            setTimeout(() => {
                              form.setFieldsValue({ processRoutingCode: oldValue });
                            });
                          },
                        });
                      }
                    } else {
                      await this.handleSetProcessRouting(code);
                    }
                  },
                })(
                  <SearchSelect
                    allClear
                    style={{ width: inputWidth }}
                    placeholder="请选择工艺路线"
                    type="processRouting"
                    params={{ status: 1 }}
                  />,
                )}
              </FormItem>
            </Col>
            <Col>
              <FormItem label="物料清单版本号">
                {getFieldDecorator('ebomVersion', {
                  onChange: async (value, option) => {
                    const { processRoutingCode, processRoutingName } = _.get(option, 'props.otherInfo', {});
                    const oldValue = getFieldValue('ebomVersion');
                    const oldBindEBomToProcessRouting = getFieldValue('bindEBomToProcessRouting');
                    const { version, id } = value ? JSON.parse(value) : {};
                    const { version: oldVersion } = oldValue ? JSON.parse(oldValue) : {};
                    if (oldValue && oldValue !== value) {
                      if (!value) {
                        confirm({
                          title: changeChineseToLocaleWithoutIntl('提示'),
                          content: changeChineseToLocaleWithoutIntl(
                            '物料清单{version}删除后，生产的BOM中已有的物料信息会被清空，确认选择吗？',
                            { version: oldVersion },
                          ),
                          cancelText: changeChineseToLocaleWithoutIntl('暂不选择'),
                          okText: changeChineseToLocaleWithoutIntl('确认选择'),
                          iconType: 'exclamation-circle',
                          onOk: async () => {
                            form.resetFields(['bindEBomToProcessRouting', 'ebomVersion', 'defNum']);
                            const processList = getFieldValue('processList');
                            form.setFieldsValue({
                              processList:
                                processList &&
                                processList.map(({ inputMaterials, outputMaterial, nodes, ...rest }) => ({
                                  ...rest,
                                  nodes: nodes.map(({ inputMaterials, outputMaterial, ...rest }) => ({
                                    ...rest,
                                  })),
                                })),
                            });
                            this.setState({ ebom: undefined });
                          },
                          onCancel: () => {
                            setTimeout(() => {
                              form.setFieldsValue({ ebomVersion: oldValue });
                            });
                            setTimeout(() => {
                              form.setFieldsValue({ bindEBomToProcessRouting: oldBindEBomToProcessRouting });
                            }, 200);
                          },
                        });
                      } else {
                        confirm({
                          title: changeChineseToLocaleWithoutIntl('提示'),
                          content: changeChineseToLocaleWithoutIntl(
                            '导入物料清单{version}后，生产的BOM中已有的物料信息会被覆盖，确认选择吗？',
                            { version },
                          ),
                          cancelText: changeChineseToLocaleWithoutIntl('暂不选择'),
                          okText: changeChineseToLocaleWithoutIntl('确认选择'),
                          iconType: 'exclamation-circle',
                          onOk: async () => {
                            form.resetFields(['bindEBomToProcessRouting', 'defNum']);
                            let ebom;
                            if (id) {
                              const {
                                data: { data: _ebom },
                              } = await getEbomDetail(id);
                              ebom = _ebom;
                            }
                            const processList = getFieldValue('processList');
                            const { defNum } = ebom;
                            form.setFieldsValue({
                              defNum,
                              processList:
                                processList &&
                                processList.map(
                                  ({
                                    inputMaterials,
                                    outputMaterial,
                                    outputMaterialCode,
                                    outputMaterialName,
                                    nodes,
                                    ...rest
                                  }) => ({
                                    ...rest,
                                    nodes: nodes.map(
                                      ({
                                        inputMaterials,
                                        outputMaterial,
                                        outputMaterialCode,
                                        outputMaterialName,
                                        ...rest
                                      }) => ({
                                        ...rest,
                                      }),
                                    ),
                                  }),
                                ),
                            });
                            this.setState({ ebom }, () => this.checkEbomCurrentUnit());
                            this.setProcessRoutingByEbom({
                              processRoutingCode,
                              processRoutingName,
                              form,
                            });
                          },
                          onCancel: () => {
                            setTimeout(() => {
                              form.setFieldsValue({ ebomVersion: oldValue });
                            });
                          },
                        });
                      }
                    } else {
                      let ebom;
                      form.resetFields(['bindEBomToProcessRouting', 'defNum']);
                      if (id) {
                        const {
                          data: { data: _ebom },
                        } = await getEbomDetail(id);
                        ebom = _ebom;
                      }
                      const { defNum } = ebom;
                      form.setFieldsValue({ defNum });
                      await this.setProcessRoutingByEbom({ processRoutingCode, processRoutingName, form });
                      this.setState({ ebom }, () => this.checkEbomCurrentUnit());
                    }
                  },
                })(
                  <Select
                    allowClear
                    disabled={!getFieldValue('materialCode')}
                    style={{ width: inputWidth }}
                    placeholder="请选择物料清单版本号"
                  >
                    {eboms &&
                      eboms.map(node => (
                        <Option
                          disabled={!node.rawMaterialList.reduce((a, b) => a || b.regulatoryControl, false)}
                          value={JSON.stringify({ id: node.id, version: node.version })}
                          otherInfo={node}
                        >
                          {node.version}
                          <Popover
                            overlayStyle={{ zIndex: 10000 }}
                            placement="bottom"
                            content={this.renderEbomPreview(node)}
                          >
                            <FormattedMessage
                              defaultMessage={'预览'}
                              style={{ float: 'right', color: blacklakeGreen }}
                            />
                          </Popover>
                        </Option>
                      ))}
                  </Select>,
                )}
              </FormItem>
            </Col>
          </Row>
          {getFieldValue('ebomVersion') ? (
            <FormItem label="组件分配">
              {getFieldDecorator('bindEBomToProcessRouting', {
                rules: [requiredRule('组件分配')],
                onChange: e => {
                  const value = e.target.value;
                  const oldValue = getFieldValue('bindEBomToProcessRouting');
                  const processList = getFieldValue('processList');
                  if (oldValue === true && value === false) {
                    confirm({
                      title: changeChineseToLocaleWithoutIntl('提示'),
                      content: changeChineseToLocaleWithoutIntl(
                        '切换组件分配时，生产的BOM中已有的物料信息会被覆盖，确认选择吗',
                      ),
                      cancelText: changeChineseToLocaleWithoutIntl('暂不选择'),
                      okText: changeChineseToLocaleWithoutIntl('确认选择'),
                      iconType: 'exclamation-circle',
                      onOk: () => {
                        setFieldsValue({
                          processList:
                            processList &&
                            processList.map(({ inputMaterials, outputMaterial, nodes, ...rest }) => ({
                              ...rest,
                              nodes: nodes.map(({ inputMaterials, outputMaterial, ...rest }) => ({
                                ...rest,
                              })),
                            })),
                        });
                      },
                      onCancel: () => {
                        setTimeout(() => {
                          form.setFieldsValue({ bindEBomToProcessRouting: oldValue });
                        });
                      },
                    });
                  } else {
                    setFieldsValue({
                      processList:
                        processList &&
                        processList.map(({ inputMaterials, outputMaterial, nodes, ...rest }) => ({
                          ...rest,
                          nodes: nodes.map(({ inputMaterials, outputMaterial, ...rest }) => ({
                            ...rest,
                          })),
                        })),
                    });
                  }
                },
              })(<RadioGroup options={[{ label: '是', value: true }, { label: '否', value: false }]} />)}
            </FormItem>
          ) : null}
          <FormItem label={'工序列表'} labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('processList', {
              initialValue: undefined,
            })(
              <ProcessListForm
                value={getFieldValue('processList')}
                bindEBomToProcessRouting={getFieldValue('bindEBomToProcessRouting')}
                defNum={getFieldValue('defNum')}
                productMaterialCode={getFieldValue('materialCode')}
                productMaterialCurrentUnitId={getFieldValue('currentUnitId')}
                eBom={ebom}
                form={form}
                processRouting={processRouting || (mBom ? mBom.processRouting : null)}
                ref={ref => {
                  if (ref) {
                    this.processRouteGraphAndEditFormRef = ref;
                  }
                }}
              />,
            )}
          </FormItem>
        </Form>
      </div>
    );
  }
}

export default MBomBaseForm;
