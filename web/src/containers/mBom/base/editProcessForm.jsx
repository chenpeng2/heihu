import React, { Component } from 'react';
import _ from 'lodash';
import {
  withForm,
  FormItem,
  Form,
  Input,
  Row,
  Col,
  InputNumber,
  DetailPageHeader,
  TreeSelect,
  Select,
  Document,
  message,
  Radio,
  Popover,
  Icon,
  Spin,
  Tooltip,
  Link,
  openModal,
  FormattedMessage,
} from 'components';
import { blacklakeGreen, error } from 'styles/color';
import { getAreaList, getWorkShopChildren, getProdLineChildren } from 'services/knowledgeBase/area';
import { queryDefWorkstations } from 'src/services/workstation';
import { checkStringLength, amountValidator, requiredRule } from 'src/components/form';
import MaterialSelect from 'components/select/materialSelect';
import DefectView from 'src/containers/newProcess/base/defectView';
import QcConfigList from 'containers/qcConfig/qcConfigList';
import { mathJs, formatFraction, isNumber, fraction } from 'src/utils/number';
import {
  isOrganizationUseQrCode,
  getTaskDeliverableOrganizationConfig,
  getToolingOrganizationConfig,
  useFrozenTime,
  configHasSOP,
} from 'src/utils/organizationConfig';
import { replaceSign } from 'constants';
import { WORKSTATION_TYPES } from 'components/select/workstationAndAreaSelect';
import { content } from 'src/styles/color';
import { FIFO_VALUE_DISPLAY_MAP, OUTPUT_FROZEN_CATEGORY } from 'src/views/bom/newProcess/utils';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';
import UnqualifiedProductTip from 'containers/newProcess/base/Form/UnqualifiedProductTip';
import { findMaterial, getProcessFormPayload, findNode, formatNode, getAmountInitialValue } from './util';

import MaterialTable from './materialTable';
import styles from './materialTable/styles.scss';
import WorkstationSelect from './workstationSelect';
import ProduceModeSettingModal from './produceModeSettingModal';
import { START_WHEN_PRE_PROCESS_START, START_WHEN_PRE_PROCESS_STOP, SUCCESSION_MODE_ENUM } from './constant';

const AntRow = Row.AntRow;
const AntCol = Col.AntCol;

const Option = Select.Option;
const RadioGroup = Radio.Group;

const inputWidth = 190;
const FIX_WIDTH = 800;

type Props = {
  form: any,
  relay: {},
  eBom: {
    rawMaterialList: [],
  },
  defNum: Number,
  materialList: [],
  productMaterialCode: String,
  productMaterialCurrentUnitId: Number,
  className: String,
  processContainerNo: number,
  processNo: number,
  initialData: any,
  processRouting: {},
  organization: {},
  bindEBomToProcessRouting: boolean,
  allData: [{}],
  style?: {},
};

class EditProcessForm extends Component {
  props: Props;
  state = {
    isEdit: true,
  };

  lastKey = 0;

  async componentDidMount() {
    await this.setInitialValue(this.props);
  }

  async componentWillReceiveProps(nextProps) {
    const { form } = nextProps;
    this.setState({ isEdit: false });
    if (
      !this.isInitialDataEqual(this.props.initialData, nextProps.initialData) ||
      !_.isEqual(this.props.productMaterialCode, nextProps.productMaterialCode) ||
      !_.isEqual(this.props.processRouting, nextProps.processRouting) ||
      !_.isEqual(this.props.eBom, nextProps.eBom) ||
      !_.isEqual(this.props.bindEBomToProcessRouting, nextProps.bindEBomToProcessRouting)
    ) {
      await this.setInitialValue(nextProps);
    }
    if (!_.isEqual(this.props.initialData.qcConfigs, nextProps.initialData.qcConfigs)) {
      setTimeout(() => {
        form.setFieldsValue({
          qcConfigs: nextProps.initialData.qcConfigs,
        });
      }, 200);
    }
    if (!_.isEqual(this.props.defNum, nextProps.defNum) && this.judgeAutoCompleteOutputMaterial(nextProps)) {
      form.setFieldsValue({
        outputMaterialAmount: nextProps.defNum,
      });
    }
  }

  isInitialDataEqual = (data, nextData) => {
    const { nodeCode, inputMaterials, outputMaterial } = data;
    const { nodeCode: nextNodeCode, inputMaterials: nextInputMaterials, outputMaterial: nextOutputMaterial } = nextData;
    return (
      _.isEqual(nodeCode, nextNodeCode) &&
      _.isEqual(outputMaterial, nextOutputMaterial) &&
      _.isEqual(inputMaterials, nextInputMaterials)
    );
  };

  setInitialValue = async props => {
    const currentKey = this.lastKey + 1;
    this.lastKey = currentKey;
    const {
      bindEBomToProcessRouting,
      processContainerNo,
      processNo,
      form,
      processRouting,
      initialData,
      productMaterialCode,
      productMaterialCurrentUnitId,
      materialList,
    } = props;
    if (!processRouting && !initialData) {
      return;
    }
    const {
      nodeCode,
      inputMaterials,
      outputMaterial,
      primaryMaterialCode,
      attachments: _attachments,
      productDesc,
      successionMode,
      preparationTime,
      preparationTimeCategory,
      workstations,
      workstationGroups,
      deliverable,
      preMaterialProductionMode,
      process: {
        outputFrozenCategory,
        code,
        name,
        fifo,
        codeScanNum,
        attachments,
        productDesc: processProductDesc,
        processDefects: defects,
      },
      toolings,
      toolingKeys,
      qcConfigs,
    } = initialData || processRouting.processList[processContainerNo].nodes[processNo];
    let treeData;
    if (initialData || (processRouting && processRouting.processList[processContainerNo].nodes[processNo])) {
      const node = processRouting ? processRouting.processList[processContainerNo].nodes[processNo] : initialData;
      treeData = await this.getWorkStationTreeData(node).catch(e => this.setState({ loading: false }));
    }
    // 并不能保证最后的调用的函数最后执行, 所以需要保证不是最后执行的函数不能setState
    if (currentKey < this.lastKey) {
      return;
    }
    this.setState({ loading: false, treeData });
    if (bindEBomToProcessRouting) {
      // 需要把上一次填写的投入产出物料的数量加回去
      const rawMaterialList = _.cloneDeep(materialList);
      if (Array.isArray(inputMaterials)) {
        inputMaterials.forEach(inputMaterial => {
          const { material, amount, amountFraction } = inputMaterial;
          const rawMaterial = findMaterial(material.code, rawMaterialList);
          if (rawMaterial) {
            // 用分数计算是为了校验ebom的数量的时候也是用的分数
            rawMaterial.amount = formatFraction(mathJs.add(fraction(rawMaterial.amount), fraction(amount)));
          }
        });
      }
      if (outputMaterial && outputMaterial.material) {
        const { material, amount } = outputMaterial;
        const rawMaterial = findMaterial(material.code, rawMaterialList);
        if (rawMaterial) {
          // 用分数计算是为了校验ebom的数量的时候也是用的分数
          rawMaterial.amount = formatFraction(
            mathJs.add(fraction(rawMaterial.amount.toString()), fraction(amount.toString())),
          );
        }
      }
      this.setState({ rawMaterialList });
    } else {
      this.setState({ rawMaterialList: null });
    }
    let _workstations;
    if ((workstations && workstations.length) || (workstationGroups && workstationGroups.length)) {
      _workstations = workstations;
    } else {
      const { workstations: processRoutingWorkstations } = processRouting.processList[processContainerNo].nodes[
        processNo
      ];
      _workstations = processRoutingWorkstations;
    }

    let _outputMaterial = outputMaterial &&
      outputMaterial.material && {
        key: JSON.stringify({
          code: outputMaterial.material.code,
          name: outputMaterial.material.name,
          unitId: outputMaterial.material.unitId,
          unitName: outputMaterial.material.unitName,
          unitConversions: outputMaterial.material.unitConversions,
        }),
        label: `${outputMaterial.material.code}/${outputMaterial.material.name}`,
      };
    let outputMaterialCurrentUnitId =
      outputMaterial && outputMaterial.material && (outputMaterial.currentUnitId || outputMaterial.material.unitId);
    if (this.judgeAutoCompleteOutputMaterial(this.props)) {
      _outputMaterial = productMaterialCode;
      outputMaterialCurrentUnitId = productMaterialCurrentUnitId;
    }
    if (!outputMaterial) {
      form.resetFields(['outputMaterialCode', 'outputMaterialAmount']);
    }
    const _inputMaterials = Array.isArray(inputMaterials)
      ? inputMaterials.map(i => {
          i.amount = getAmountInitialValue(i);
          return i;
        })
      : [{}];
    form.setFieldsValue({
      nodeCode,
      primaryMaterialCode,
      codeOrName: `${code}/${name}`,
      productDesc: productDesc || processProductDesc,
      workstations: [].concat(
        _workstations
          ? _workstations.filter(e => e).map(({ id, name }) => ({ value: `WORKSTATION-${id}`, label: name }))
          : [],
      ),
      inputMaterials: _inputMaterials,
      defects: Array.isArray(defects)
        ? defects.map(({ defect }) => {
            return { name: replaceSign, ...defect };
          })
        : [],
      deliverable,
      outputFrozen: outputFrozenCategory,
      successionMode,
      preMaterialProductionMode,
      preparationTimeValue: preparationTime,
      preparationTimeCategory,
      outputMaterialCode: this.judgeAutoCompleteOutputMaterial(this.props) ? productMaterialCode : _outputMaterial,
      outputMaterialAmount: this.judgeAutoCompleteOutputMaterial(this.props)
        ? this.props.defNum
        : getAmountInitialValue(outputMaterial),
      outputMaterialCurrentUnitId,
      fifo,
      codeScanNum,
      attachments: _attachments || attachments,
      toolings,
      toolingKeys,
      qcConfigs,
    });
    setTimeout(() => {
      form.setFieldsValue({
        inputMaterials: _inputMaterials,
        outputMaterialCode: this.judgeAutoCompleteOutputMaterial(this.props) ? productMaterialCode : _outputMaterial,
        outputMaterialAmount: this.judgeAutoCompleteOutputMaterial(this.props)
          ? this.props.defNum
          : getAmountInitialValue(outputMaterial),
        outputMaterialCurrentUnitId,
        qcConfigs,
        toolings,
        toolingKeys,
      });
    }, 200);
  };

  judgeAutoCompleteOutputMaterial = props => {
    const { processContainerNo, allData } = props;
    const processGroup = allData[processContainerNo];
    return processContainerNo === allData.length - 1 && processGroup.nodes.length === 1;
  };

  checkMaterial = value => {
    const { inputMaterials, outputMaterialAmount, outputMaterialCode } = value;
    let res = true;
    if (inputMaterials) {
      inputMaterials.forEach(material => {
        if ((material.material && !material.amount) || (!material.material && material.amount)) {
          message.error('投入物料的物料和数量必填!');
          res = false;
        }
      });
    }
    if (outputMaterialCode && !outputMaterialAmount) {
      message.error('产出物料必须填写数量!');
      res = false;
    }
    return res;
  };

  checkMaterialProductionMode = value => {
    const { inputMaterials, preMaterialProductionMode, workstations } = value;
    // materialProductionMode === 2 表示是线边仓投产
    const hasStorageProductionMode = inputMaterials.reduce(
      (a, b) => a === 2 || b.materialProductionMode === 2,
      preMaterialProductionMode === 2,
    );
    if (hasStorageProductionMode) {
      // TODO: 增加工位是否全部配置了投料仓位的检查
      console.log(workstations);
    }
    return true;
  };

  getPayload() {
    let payload;
    const { bindEBomToProcessRouting, processContainerNo, allData } = this.props;
    const processGroup = allData[processContainerNo];
    this.props.form.validateFieldsAndScroll((err, val) => {
      if (err) {
        message.error('基本信息填写有误');
        throw new Error('基本信息填写有误');
      }
      const { codeScanNum, alwaysOneCode, primaryMaterialCode } = val || {};
      // 组件分配的值有true/false/undefined
      // 填写主物料的逻辑： 组件分配不为否 首道序 单次扫码为是
      // or 单次扫码 为 否 且 一码到底 为 是
      if (
        ((bindEBomToProcessRouting !== false && codeScanNum === 1) || (codeScanNum === 2 && alwaysOneCode === 1)) &&
        processContainerNo === 0 &&
        !this.isParallelProcessGroup(processGroup) &&
        !primaryMaterialCode
      ) {
        message.error('必须填写主物料!');
        throw new Error('必须填写主物料');
      }
      if (!this.checkMaterial(val)) {
        // message.error('物料填写有误!');
        throw new Error('物料填写有误');
      }
      // const qcConfigs = this.qcConfigListRef.wrappedInstance.getPayload();
      const getWorkstationGroupsAndWorkStations = data => {
        const { treeData } = this.state;

        let workstationIds = [];

        if (data) {
          data.forEach(({ label, value }) => {
            const [type, id] = value.split('-');
            if (type === 'WORKSTATION') {
              workstationIds.push({ id, name: label });
            } else if (type === 'PRODUCTION_LINE') {
              const node = findNode(treeData, value);
              workstationIds = workstationIds.concat(node.children.map(e => ({ id: e.id, name: e.name })));
            } else if (type === 'WORKSHOP') {
              const node = findNode(treeData, value);
              workstationIds = workstationIds.concat(
                _.flattenDeep(node.children.map(e => e.children.map(e => ({ id: e.id, name: e.name })))),
              );
            }
          });
        }

        return {
          workstations: workstationIds,
          // 清空历史的工位组
          workstationGroups: [],
        };
      };
      payload = getProcessFormPayload({ ...val, ...getWorkstationGroupsAndWorkStations(val.workstations) });
    });

    return payload;
  }

  isParallelProcessGroup = processGroup => processGroup && processGroup.nodes.length > 1;

  getWorkStationTreeData = async process => {
    if (!process) {
      return [];
    }
    const { workstationDetails } = process;
    const { data } = await getAreaList({ enabled: true });
    let treeData;
    if (Array.isArray(data.data.children)) {
      treeData = data.data.children.map(node => {
        return formatNode(node);
      });
    }

    if (workstationDetails.length) {
      const workstationIds = workstationDetails.filter(e => e.status === 1).map(e => e.id);
      const {
        data: { data: _workstations },
      } = await queryDefWorkstations({ ids: workstationIds.join(',') });
      const productionLineIds = _.uniq(_workstations.map(e => e.productionLineId)).filter(e => e);
      const workshopIds = _.uniq(_workstations.map(e => e.workshopId)).filter(e => e);

      treeData = treeData.filter(e => workshopIds.includes(e.id));

      for (const id of workshopIds) {
        const treeNode = findNode(treeData, `${WORKSTATION_TYPES.WORKSHOP}-${id}`);
        if (treeNode) {
          const {
            data: { data },
          } = await getWorkShopChildren(id, { enabled: true });
          if (Array.isArray(data)) {
            treeNode.children = data
              .filter(
                e =>
                  (e.type === WORKSTATION_TYPES.PRODUCTION_LINE && productionLineIds.includes(e.id)) ||
                  (e.type === WORKSTATION_TYPES.WORKSTATION && workstationIds.includes(e.id)),
              )
              .map(node => {
                return formatNode(node, treeNode, node => {
                  node.isSearched = true;
                });
              });
          }
        }
      }
      for (const id of productionLineIds) {
        const treeNode = findNode(treeData, `${WORKSTATION_TYPES.PRODUCTION_LINE}-${id}`);
        if (treeNode) {
          const {
            data: { data },
          } = await getProdLineChildren(id, { enabled: true });
          treeNode.children = data
            .filter(e => workstationIds.includes(e.id))
            .map(node => {
              return formatNode(node, treeNode, node => {
                node.isSearched = true;
              });
            });
        }
      }
    }
    return treeData;
  };

  checkToolingMaterials = material => {
    const { form } = this.props;
    const toolingMaterials = form.getFieldValue('toolingMaterials');
    if (Array.isArray(toolingMaterials) && toolingMaterials.length) {
      return toolingMaterials.map(e => e.outputMaterialCode).includes(material.code);
    }
    return true;
  };

  renderCodeScanNumContent = () => {
    return (
      <div>
        <div>
          <FormattedMessage
            defaultMessage={'选择【是】后，执行该工序的生产任务时一次扫码即完成原料投产和物料产出的操作'}
          />
        </div>
        <div>
          <FormattedMessage defaultMessage={'选择【否】后，执行该工序的任务需要分别扫码执行原料投产和物料产出'} />
        </div>
        <div>
          <FormattedMessage
            defaultMessage={
              '老黑建议：如果该工序不需要使用新二维码绑定产出物料，建议你选择【是】，否则建议你选择【否】'
            }
          />
        </div>
      </div>
    );
  };

  renderFifoContent = () => {
    return (
      <div style={{ padding: 20, color: content }}>
        <p>
          <div>
            <FormattedMessage defaultMessage={'【用料追溯关系】用于配置产出物料与投入物料的追溯关系。'} />
          </div>
          <div>
            <FormattedMessage defaultMessage={'示例：某生产任务投入物料为A、B，产出物料为C。'} />
          </div>
          <div>
            <FormattedMessage defaultMessage={'实际生产的投入产出记录如下：'} />
          </div>
          <ul>
            <li>
              <FormattedMessage defaultMessage={'第一次投入 1单位的A、1单位的B；第一次产出C'} />
            </li>
            <li>
              <FormattedMessage defaultMessage={'第二次投入 2单位的A'} />
            </li>
            <li>
              <FormattedMessage defaultMessage={'第三次投入 3单位的A；第二次产出C'} />
            </li>
          </ul>
        </p>
        <p>
          <FormattedMessage defaultMessage={'若选【单件顺序生产自动更新】，指产出用料追溯默认取最近一次投产记录；'} />
          <ul>
            <li>
              <FormattedMessage defaultMessage={'即第一次产出C，追溯时会追溯到【第一次投入 1单位的A、1单位的B】'} />
            </li>
            <li>
              <FormattedMessage
                defaultMessage={'第二次产出C，追溯时会追溯到【第二次投入 2单位的A】&【第一次投入 1单位的B】'}
              />
            </li>
          </ul>
        </p>
        <p>
          <FormattedMessage defaultMessage={'若选【批量生产手动更新】，指用料追溯默认与上次产出选择的用料一致；'} />
          <ul>
            <li>
              <FormattedMessage
                defaultMessage={'即第一次产出C ，追溯内容为第一次投入，追溯时会追溯到【第一次投入 1单位的A、1单位的B】'}
              />
            </li>
            <li>
              <FormattedMessage
                defaultMessage={'第二次产出C，没有手动切换追溯关系，追溯时会追溯到【第一次投入 1单位的A、1单位的B】'}
              />
            </li>
          </ul>
        </p>
        <p>
          <FormattedMessage
            defaultMessage={
              '若选【批量生产自动更新】，指产出用料追溯时默认取上次产出后物料的所有最新投产记录，若某物料没有最新投产记录则与上次追溯内容一致'
            }
          />
          <ul>
            <li>
              <FormattedMessage defaultMessage={'即第一次产出C，追溯时会追溯到【第一次投入 1单位的A、1单位的B】'} />
            </li>
            <li>
              <FormattedMessage
                defaultMessage={
                  '第二次产出C，追溯时会追溯到 【第二次投入 2单位的A】& 【第三次投入 3单位的A】&【第一次投入 1单位的B】'
                }
              />
            </li>
          </ul>
        </p>
      </div>
    );
  };

  render() {
    const {
      form,
      className,
      initialData,
      allData,
      processContainerNo,
      productMaterialCode,
      processNo,
      eBom,
      defNum = replaceSign,
      processRouting,
      bindEBomToProcessRouting,
      style,
    } = this.props;
    const { treeData, loading, rawMaterialList } = this.state;
    const { getFieldDecorator, getFieldValue } = form;
    const isFirstNode = processContainerNo === 0;
    const {
      process: { codeScanNum, alwaysOneCode },
    } = initialData || processRouting.processList[processContainerNo].nodes[processNo] || {};
    getFieldDecorator('preMaterialProductionMode', {
      initialValue: isFirstNode ? undefined : 1,
    });
    getFieldDecorator('outputMaterialCode');
    const showMaterial = !eBom || bindEBomToProcessRouting;
    const processGroup = allData[processContainerNo];
    const preProcessGroup = processContainerNo ? allData[processContainerNo - 1] : null;
    const autoComleteOutputMaterial = this.judgeAutoCompleteOutputMaterial(this.props);
    if (autoComleteOutputMaterial) {
      getFieldDecorator('outputMaterialAmount', { initialValue: defNum });
    }
    getFieldDecorator('inputMaterials');
    const outputMaterial =
      form.getFieldValue('outputMaterialCode') &&
      form.getFieldValue('outputMaterialCode').key &&
      JSON.parse(form.getFieldValue('outputMaterialCode').key);
    let unitSelections = [];
    if (outputMaterial) {
      const { unitId, unitName, unitConversions } = outputMaterial;
      unitSelections = [{ id: unitId, name: unitName }].concat(
        (unitConversions || []).map(({ slaveUnitId, slaveUnitName }) => ({
          id: slaveUnitId,
          name: slaveUnitName,
        })),
      );
    }

    const inputMaterials = getFieldValue('inputMaterials');
    const primaryMaterialCode = getFieldValue('primaryMaterialCode');
    let outputRawMaterialList = [];
    if (rawMaterialList && rawMaterialList.length) {
      outputRawMaterialList = _.cloneDeep(rawMaterialList);
      if (inputMaterials && inputMaterials.length) {
        inputMaterials.forEach(inputMaterial => {
          const material = findMaterial(inputMaterial.code, outputRawMaterialList);
          if (material && material.amount) {
            material.amount = formatFraction(
              mathJs.subtract(fraction(material.amount.toString()), fraction(inputMaterial.amount.toString())),
            );
          }
        });
      }
      if (productMaterialCode && productMaterialCode.key && autoComleteOutputMaterial) {
        outputRawMaterialList = outputRawMaterialList.concat({
          material: JSON.parse(productMaterialCode.key),
          amount: defNum,
        });
      }
    }
    const inputRawMaterialList = _.cloneDeep(rawMaterialList) || [];
    if (outputMaterial && !autoComleteOutputMaterial) {
      const material = findMaterial(outputMaterial.code, inputRawMaterialList);
      if (material && material.amount && isNumber(getFieldValue('outputMaterialAmount'))) {
        material.amount = formatFraction(
          mathJs.subtract(fraction(material.amount), fraction(getFieldValue('outputMaterialAmount'))),
        );
      }
    }
    const rawOutputMaterial = findMaterial(_.get(outputMaterial, 'code'), outputRawMaterialList);

    const useQrCode = isOrganizationUseQrCode();
    const useProduceTaskDeliverable = getTaskDeliverableOrganizationConfig();
    const hasSop = configHasSOP();
    return (
      <Spin spinning={loading}>
        <Form key={`${processContainerNo}-${processNo}`} className={className} style={style}>
          <DetailPageHeader
            title={
              <div style={{ fontSize: 22 }}>
                <FormattedMessage defaultMessage={'基础信息'} />
              </div>
            }
          />
          <Row>
            <Col>
              <FormItem label={'序号'}>
                {getFieldDecorator('nodeCode', {})(<Input style={{ width: inputWidth }} disabled />)}
              </FormItem>
            </Col>
            <Col>
              <FormItem label={'编码／名称'}>
                {getFieldDecorator('codeOrName', {})(<Input style={{ width: inputWidth }} disabled />)}
              </FormItem>
            </Col>
            <Col>
              <FormItem label={'接续方式'}>
                {getFieldDecorator('successionMode', {
                  rules: [requiredRule('接续方式')],
                })(
                  <Select style={{ width: inputWidth }} disabled>
                    <Option value={START_WHEN_PRE_PROCESS_START}>
                      <FormattedMessage defaultMessage={SUCCESSION_MODE_ENUM[START_WHEN_PRE_PROCESS_START]} />
                    </Option>
                    <Option value={START_WHEN_PRE_PROCESS_STOP}>
                      <FormattedMessage defaultMessage={SUCCESSION_MODE_ENUM[START_WHEN_PRE_PROCESS_STOP]} />
                    </Option>
                  </Select>,
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            {useQrCode ? (
              <Col>
                <FormItem
                  label={
                    <span>
                      <Popover
                        placement="right"
                        title={<FormattedMessage style={{ fontSize: 18 }} defaultMessage={'单次扫码'} />}
                        content={this.renderCodeScanNumContent()}
                      >
                        <Icon color={blacklakeGreen} type="exclamation-circle-o" style={{ paddingLeft: 5 }} />
                      </Popover>
                      <FormattedMessage defaultMessage={'单次扫码'} />
                    </span>
                  }
                >
                  {getFieldDecorator('codeScanNum', {
                    initialValue: initialData && initialData.codeScanNum,
                  })(
                    <Select style={{ width: inputWidth }} disabled>
                      {[{ label: '是', value: 1 }, { label: '否', value: 2 }].map(({ value, label }) => (
                        <Select.Option value={value}>
                          <FormattedMessage defaultMessage={label} />
                        </Select.Option>
                      ))}
                    </Select>,
                  )}
                </FormItem>
              </Col>
            ) : null}
            {useQrCode && !hasSop ? (
              <Col>
                <FormItem label="一码到底">
                  {getFieldDecorator('alwaysOneCode', {
                    initialValue: _.get(initialData, 'process.alwaysOneCode', 0),
                  })(
                    <Select disabled style={{ width: inputWidth }}>
                      <Select.Option value={1}>{changeChineseToLocaleWithoutIntl('是')}</Select.Option>
                      <Select.Option value={0}>{changeChineseToLocaleWithoutIntl('否')}</Select.Option>
                    </Select>,
                  )}
                </FormItem>
              </Col>
            ) : null}
            {useQrCode ? (
              <Col>
                <FormItem
                  label={
                    <span>
                      <Popover placement="right" content={this.renderFifoContent()}>
                        <Icon color={blacklakeGreen} type="exclamation-circle-o" style={{ paddingLeft: 5 }} />
                      </Popover>
                      {changeChineseToLocaleWithoutIntl('用料追溯关系')}
                    </span>
                  }
                >
                  {getFieldDecorator('fifo', {
                    initialValue: initialData && initialData.fifo,
                  })(
                    <Select style={{ width: inputWidth }} disabled>
                      {_.map(FIFO_VALUE_DISPLAY_MAP, (display, value) => (
                        <Select.Option key={value} value={Number(value)}>
                          <FormattedMessage defaultMessage={display} />
                        </Select.Option>
                      ))}
                    </Select>,
                  )}
                </FormItem>
              </Col>
            ) : null}
            {useQrCode && (
              <Col>
                <FormItem label={<UnqualifiedProductTip />}>
                  {getFieldDecorator('unqualifiedProducts', {
                    initialValue: _.get(initialData, 'process.unqualifiedProducts', 0),
                  })(
                    <Select style={{ width: inputWidth }} disabled>
                      <Option value={1}>
                        <FormattedMessage defaultMessage={'允许'} />
                      </Option>
                      <Option value={0}>
                        <FormattedMessage defaultMessage={'不允许'} />
                      </Option>
                    </Select>,
                  )}
                </FormItem>
              </Col>
            )}
            <Col>
              <FormItem label={'准备时间'}>
                {getFieldDecorator('preparationTimeValue', {
                  rules: [
                    requiredRule('时间'),
                    {
                      validator: amountValidator(10000, {
                        value: 0,
                        equal: true,
                        message: <FormattedMessage defaultMessage={'准备时间必须大于等于0'} />,
                      }),
                    },
                  ],
                })(<InputNumber />)}{' '}
                {getFieldDecorator('preparationTimeCategory', {
                  initialValue: 0,
                })(
                  <Select
                    style={{ width: 100 }}
                    options={[{ label: '小时', value: 1 }, { label: '分钟', value: 0 }]}
                  />,
                )}
              </FormItem>
            </Col>
          </Row>
          <FormItem label={'工位'} labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}>
            {getFieldDecorator('workstations', {
              rules: [requiredRule('工位')],
            })(<WorkstationSelect treeData={treeData} style={{ width: FIX_WIDTH }} />)}
          </FormItem>
          {useProduceTaskDeliverable ? (
            <FormItem label="任务下发审批" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}>
              {getFieldDecorator('deliverable', {
                initialValue: true,
                rules: [
                  { required: useProduceTaskDeliverable, message: <FormattedMessage defaultMessage={'请选择'} /> },
                ],
              })(<RadioGroup options={[{ label: '是', value: true }, { label: '否', value: false }]} />)}
            </FormItem>
          ) : null}
          {useFrozenTime() ? (
            <FormItem label="产出是否冻结" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}>
              {getFieldDecorator('outputFrozen', {
                initialValue: true,
                rules: [{ required: useFrozenTime(), message: <FormattedMessage defaultMessage={'请选择'} /> }],
              })(
                <RadioGroup
                  disabled
                  options={[
                    { label: '是', value: OUTPUT_FROZEN_CATEGORY.frozen.value },
                    { label: '否', value: OUTPUT_FROZEN_CATEGORY.notFrozen.value },
                  ]}
                />,
              )}
            </FormItem>
          ) : null}
          <FormItem label={'次品项列表'}>{getFieldDecorator('defects')(<DefectView />)}</FormItem>
          <FormItem label="附件：">
            {getFieldDecorator('attachments', {})(
              <Document extraText={changeChineseToLocaleWithoutIntl('（用于执行生产任务时查看）')} />,
            )}
          </FormItem>
          <FormItem label={'生产描述'}>
            {getFieldDecorator('productDesc', {
              rules: [{ validator: checkStringLength(100) }],
            })(
              <Input.TextArea
                style={{ width: 600 }}
                placeholder={changeChineseToLocaleWithoutIntl('请输入生产描述（用于执行生产任务时查看）')}
              />,
            )}
          </FormItem>
          {showMaterial ? (
            <DetailPageHeader title={<FormattedMessage style={{ fontSize: 22 }} defaultMessage={'物料信息'} />} />
          ) : null}
          {showMaterial ? (
            <FormItem
              label={
                <span>
                  <FormattedMessage defaultMessage={'投入物料'} />
                  <Tooltip
                    title={
                      <div style={{ display: 'flex' }}>
                        <div>
                          <FormattedMessage
                            defaultMessage={
                              '提示：上一道工序的产出物料系统自动默认为下一道序的投入物料，请勿重复配置。'
                            }
                          />
                        </div>
                      </div>
                    }
                  >
                    <Icon type="exclamation-circle-o" color={'rgba(0, 0, 0, 0.4)'} />
                  </Tooltip>
                </span>
              }
              wrapperCol={{ span: 16 }}
            >
              {getFieldDecorator('inputMaterials', {})(
                <MaterialTable
                  outerForm={form}
                  wrappedComponentRef={ref => (this.materialTable = ref)}
                  hasPrimaryMaterial={
                    (codeScanNum === 1 || alwaysOneCode === 1) &&
                    processContainerNo === 0 &&
                    !this.isParallelProcessGroup(processGroup)
                  }
                  materialList={inputRawMaterialList}
                  processGroup={processGroup}
                  preProcessGroup={preProcessGroup}
                  isAlwaysOneCode={alwaysOneCode === 1}
                />,
              )}
              {useQrCode ? (
                <Link
                  style={{ paddingLeft: 10 }}
                  onClick={() => {
                    openModal({
                      title: '设置投产方式',
                      children: (
                        <ProduceModeSettingModal
                          materials={form.getFieldValue('inputMaterials')}
                          preMaterialProductionMode={form.getFieldValue('preMaterialProductionMode')}
                          isFirstNode={isFirstNode}
                          primaryMaterialCode={primaryMaterialCode}
                          isAlwaysOneCode={alwaysOneCode === 1}
                        />
                      ),
                      footer: null,
                      onOk: value => {
                        form.setFieldsValue(value);
                      },
                    });
                  }}
                >
                  设置投产方式
                </Link>
              ) : null}
            </FormItem>
          ) : null}
          {processGroup.nodes.length && processGroup.nodes.length === 1 && showMaterial ? (
            <FormItem label={'产出物料'} validateStatus={undefined} help="" labelCol={8} wrapperCol={{ span: 16 }}>
              <div className={styles.materialTableContainer}>
                <AntRow gutter={24} className={styles.tableHeader}>
                  <AntCol span={12}>
                    <FormattedMessage defaultMessage={'物料编码/名称'} />
                  </AntCol>
                  <AntCol span={6}>
                    <FormattedMessage defaultMessage={'单位'} />
                  </AntCol>
                  <AntCol span={6}>
                    <FormattedMessage defaultMessage={'数量'} />
                  </AntCol>
                </AntRow>
                <AntRow gutter={24} className={styles.row}>
                  <AntCol span={12}>
                    {eBom && eBom.rawMaterialList && eBom.rawMaterialList.length ? (
                      <Select
                        allowClear
                        disabled={autoComleteOutputMaterial && processGroup.nodes.length === 1}
                        value={
                          outputMaterial
                            ? JSON.stringify({
                                code: _.get(outputMaterial, 'code'),
                                name: _.get(outputMaterial, 'name'),
                              })
                            : undefined
                        }
                        onChange={v => {
                          if (!v) {
                            form.resetFields([
                              'outputMaterialCode',
                              'outputMaterialAmount',
                              'outputMaterialCurrentUnitId',
                            ]);
                          } else {
                            const { material, amount, currentUnitId } = findMaterial(
                              _.get(JSON.parse(v), 'code'),
                              outputRawMaterialList,
                            );
                            const { unitId } = material;
                            if (!this.checkToolingMaterials(material)) {
                              form.resetFields(['toolings']);
                            }
                            form.setFieldsValue({
                              outputMaterialCode: {
                                key: JSON.stringify(material),
                                label: `${material.code}/${material.name}`,
                              },
                              outputMaterialAmount: amount,
                              outputMaterialCurrentUnitId: currentUnitId || unitId,
                            });
                          }
                        }}
                      >
                        {outputRawMaterialList.map(({ material: { code, name }, amount }) => {
                          return (
                            <Option
                              key={code}
                              disabled={isNumber(amount) ? mathJs.smallerEq(fraction(amount), 0) : false}
                              value={JSON.stringify({ code, name })}
                            >{`${code} / ${name}`}</Option>
                          );
                        })}
                      </Select>
                    ) : (
                      getFieldDecorator('outputMaterialCode', {
                        onChange: v => {
                          if (!v) {
                            form.resetFields(['outputMaterialAmount', 'outputMaterialCurrentUnitId']);
                          } else {
                            const material = JSON.parse(v.key);
                            if (!this.checkToolingMaterials(material)) {
                              form.resetFields(['toolings']);
                            }
                            form.setFieldsValue({ outputMaterialCurrentUnitId: material.unitId });
                          }
                        },
                      })(
                        <MaterialSelect
                          allowClear
                          disabled={autoComleteOutputMaterial && processGroup.nodes.length === 1}
                        />,
                      )
                    )}
                  </AntCol>
                  <AntCol span={6}>
                    {/* <Input disabled value={outputMaterial && outputMaterial.unitName} placeholder="单位" /> */}
                    <FormItem>
                      {form.getFieldDecorator('outputMaterialCurrentUnitId')(
                        <Select
                          disabled={
                            autoComleteOutputMaterial || (eBom && eBom.rawMaterialList && eBom.rawMaterialList.length)
                          }
                          style={{ width: 100 }}
                          placeholder={null}
                        >
                          {unitSelections.map(({ id, name }) => (
                            <Option id={id} value={id}>
                              {name}
                            </Option>
                          ))}
                        </Select>,
                      )}
                    </FormItem>
                  </AntCol>
                  <AntCol span={6}>
                    <FormItem
                      style={{ marginBottom: 0 }}
                      validateStatus={form.getFieldError('outputMaterialAmount') ? 'error' : undefined}
                      help=""
                    >
                      {getFieldDecorator('outputMaterialAmount', {
                        rules: [
                          {
                            validator: amountValidator(
                              autoComleteOutputMaterial ? defNum : rawOutputMaterial ? rawOutputMaterial.amount : 10e6,
                              null,
                              'fraction',
                              6,
                            ),
                          },
                        ],
                        initialValue: autoComleteOutputMaterial
                          ? defNum
                          : rawOutputMaterial && rawOutputMaterial.amount,
                      })(
                        <Input
                          disabled={autoComleteOutputMaterial && processGroup.nodes.length === 1}
                          placeholder={'支持小数和分数'}
                        />,
                      )}
                      {form.getFieldError('outputMaterialAmount') ? (
                        <div style={{ color: error, lineHeight: '20px' }}>
                          {form.getFieldError('outputMaterialAmount')}
                        </div>
                      ) : null}
                    </FormItem>
                  </AntCol>
                </AntRow>
              </div>
            </FormItem>
          ) : null}
          <DetailPageHeader
            title={
              <div style={{ fontSize: 22 }}>
                <FormattedMessage defaultMessage={'质检方案'} />
              </div>
            }
          />
          <FormItem label={' '} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('qcConfigs', { initialValue: [] })(
              <QcConfigList type="mbom" style={{ marginRight: 20 }} />,
            )}
          </FormItem>
        </Form>
      </Spin>
    );
  }
}

export default withForm({}, EditProcessForm);
