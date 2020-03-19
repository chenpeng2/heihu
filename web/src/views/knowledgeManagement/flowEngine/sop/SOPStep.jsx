import React from 'react';
import {
  Input,
  Tree,
  Dropdown,
  Menu,
  Link,
  withForm,
  FormItem,
  Radio,
  Select,
  Button,
  Textarea,
  Spin,
  Icon,
  Tooltip,
  message,
  openModal,
  Collapse,
  InputNumber,
  FormattedMessage,
} from 'components';
import PropTypes from 'prop-types';
import { Modal } from 'antd';
import { getMBomByIdForSop } from 'services/bom/mbom';
import _ from 'lodash';
import { updateSOPStepFromTemplate } from 'services/knowledgeBase/sop';
import Big from 'big.js';
import { setLocation, getParams } from 'utils/url';
import { defaultGetValueFromEvent, requiredRule, amountValidator } from 'components/form';
import { getEbomListWithExactSearch } from 'services/bom/ebom';
import { swapArray, arrayIsEmpty } from 'utils/array';
import Color from 'styles/color';
import style from './index.scss';
import ControlComponent from './ControlComponent';
import CONSTANT from '../common/SOPConstant';
import PrivilegeSelect from './PrivilegeSelect';
import PrivilegeTypeSelect from './PrivilegeTypeSelect';
import CopyStep from './component/copyStep';

const {
  NextLogic,
  SopStepGroupType,
  NEXT_LOGIC_IF_JUDGE,
  NEXT_LOGIC_NEXT,
  NEXT_LOGIC_PERSON_SELECT,
  SOP_STEP_GROUP_TYPE_SERIAL,
  LOGIC_FIXED_FILE,
  CREATE_BY_SOP_TEMPLATE,
} = CONSTANT;
const Search = Input.Search;
const { TreeNode } = Tree;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const width = 200;
const { Panel } = Collapse;

const UpDownCaret = ({ onUp, onDown, upStyle, downStyle }) => (
  <div className={style.orderWrapper}>
    <Icon type="caret-up" style={{ height: 8, ...upStyle }} onClick={onUp} className={style.up} title="上移" />
    <Icon type="caret-down" onClick={onDown} className={style.down} title="下移" style={downStyle} />
  </div>
);

const handleSopStep = (sopList = [], { key, type }) => {
  let result = [];
  let findIndex = -2;
  sopList.forEach(({ step, subStepList }, index) => {
    if (step.id === key) {
      result.push({ step, subStepList });
      findIndex = index;
      if (type === 'up') {
        result = swapArray(result, index, index - 1);
      }
    } else if (type === 'down' && findIndex === index - 1) {
      result.push({ step, subStepList });
      result = swapArray(result, index, index - 1);
    } else {
      result.push({ step, subStepList: handleSopStep(subStepList, { key, type }) });
    }
  });
  return result;
};

const convertToStepNode = (stepList = []) => {
  return stepList.map(({ step: { id }, subStepList }) => ({ id, nodeList: convertToStepNode(subStepList) }));
};

export const getSiblingSteps = (stepList = [], key) => {
  let result = null;
  stepList.forEach(({ step: { id }, subStepList }, index, siblingSteps) => {
    if (id === key) {
      result = siblingSteps;
    }
    const childResult = getSiblingSteps(subStepList, key);
    if (childResult) {
      result = childResult;
    }
  });
  return result;
};

const getParentStep = (id, tree) => {
  let parentStep = null;
  for (let i = 0; i < tree.length; i += 1) {
    const node = tree[i];
    if (node.subStepList) {
      if (node.subStepList.some(item => item.step.id === id)) {
        parentStep = node.step;
      } else if (getParentStep(id, node.subStepList)) {
        parentStep = getParentStep(id, node.subStepList);
      }
    }
  }
  return parentStep;
};

const removeNewStep = stepList => {
  const result = [];
  stepList.forEach(({ step, subStepList }) => {
    if (!step.isNew) {
      result.push({
        step,
        subStepList: removeNewStep(subStepList),
      });
    }
  });
  return result;
};

export const encodeMaterialCode = code => code.replace(/\./g, '$');
export const decodeMaterialCode = code => code.replace(/\$/g, '.');

class SOPStep extends React.PureComponent {
  constructor(props) {
    super(props);
    this.copyStepRef = React.createRef();
    this.state = {
      nextOptionStepListKeys: [0],
      SOPStepList: null,
      SOPDetail: null,
      controllerComponents: [0],
      isStepGroup: false, // form that create a step group
      loading: false,
      parentGroupType: SOP_STEP_GROUP_TYPE_SERIAL,
      lastKey: 0,
      editMode: true,
      selectedKeys: [],
      siblingSteps: [], // 给后续步骤的选择用
      searchValue: '',
      expandedKeys: [],
      hasModified: false, // 是否有修改
      inputMaterials: [],
      initInputMaterials: {}, // 编辑时候传入控件可投产物料的初始值
      isSyncInputMaterial: false, // 是否同步
      syncInputMaterialLoading: false, // 同步时候loading
      isCreatedByTemplate: false,
      activeKey: [], // 展开的控件key
      controlList: [],
      errorControllers: [],
      mBomData: null,
      hiddenStepList: false,
      hiddenDetail: false,
    };
  }
  parentId = '';
  prevId = '';
  stepNodeVersion = '';

  handleModifyState = hasModified => this.setState({ hasModified });

  isSopTemplate = () => this.props.mode === 'sopTemplate';

  componentDidMount = async () => {
    const {
      queryObj: { stepId },
    } = getParams();
    this.SOPId = this.props.match.params.id;
    const stepList = await this.setSOPStepList();
    const selectedKey = stepId || _.get(stepList, '[0].step.id');
    this.setSOPDetail();
    if (selectedKey) {
      this.setState({ selectedKeys: [selectedKey] });
      this.setInitialValue(selectedKey);
    }
  };

  setSOPDetail = async () => {
    const { mode } = this.props;
    const {
      data: { data },
    } = await this.props.SOPStepApi.getSOPDetail(this.SOPId);
    const _inputMaterials = [];
    if (mode !== 'sopTemplate') {
      const {
        sop: { mbomId, nodeCode, sopTemplate },
      } = data;
      if (sopTemplate) {
        this.setState({ isCreatedByTemplate: true });
      }
      const {
        data: { data: mBomData },
      } = await getMBomByIdForSop(mbomId);
      this.setState({ mBomData });
      const { bindEBomToProcessRouting, processList, materialCode } = mBomData;
      const primaryMaterialCode = processList[0].nodes[0].primaryMaterialCode;
      let inputMaterials = [];
      if (bindEBomToProcessRouting === false) {
        const {
          data: { data: _inputMaterials },
        } = await getEbomListWithExactSearch({ productMaterialCode: materialCode });
        if (Array.isArray(_inputMaterials) && _inputMaterials.length > 0) {
          inputMaterials = _inputMaterials[0].rawMaterialList.map(
            ({ material, material: { fifo }, amount, materialProductionMode }) => ({
              fifo,
              material,
              enable: true,
              fifoRule: null,
              amount,
              materialProductionMode,
            }),
          );
        }
      } else {
        const nodeIndex = processList.findIndex(({ nodes }) => {
          if (nodes[0].nodeCode === nodeCode) {
            inputMaterials = nodes[0].inputMaterials || [];
            return true;
          }
          return false;
        });
        if (nodeIndex > 0 && processList[nodeIndex].nodes[0].process.codeScanNum !== 1) {
          inputMaterials.push(processList[nodeIndex - 1].nodes[0].outputMaterial);
        }
        inputMaterials = inputMaterials.map(({ material, amount, materialProductionMode }) => ({
          fifoRule: null,
          enable: true,
          material,
          fifo: material ? material.fifo : false,
          amount,
          materialProductionMode,
        }));
      }
      inputMaterials
        .filter(({ material }) => !!material)
        .filter(({ material }) => material.code !== primaryMaterialCode) // 过滤掉主物料
        .forEach(node => {
          const { material, amount } = node;
          const findIndex = _inputMaterials.findIndex(node => node.material.code === material.code);
          if (findIndex !== -1) {
            _inputMaterials[findIndex] = {
              ..._inputMaterials[findIndex],
              amount: (_inputMaterials[findIndex].amount || 0) + amount,
            };
          } else {
            _inputMaterials.push(node);
          }
        });
    }
    this.setState({
      SOPDetail: data,
      inputMaterials: _inputMaterials.map(node => ({
        ...node,
        material: { ...node.material, code: encodeMaterialCode(node.material.code) },
      })),
    });
  };

  getSOPDetail = () => {
    const { SOPDetail } = this.state;
    if (!SOPDetail) {
      return null;
    }
    return SOPDetail.sopTemplate || SOPDetail.sop;
  };

  setSOPStepList = async () => {
    const { mode } = this.props;
    this.setState({ loading: true });
    const {
      data: { data },
    } = await this.props.SOPStepApi.getSOPSteps(this.SOPId);
    const { stepList } = data;
    this.stepNodeVersion = data[mode].stepNodeVersion;
    this.setState({ SOPStepList: stepList, loading: false });
    return stepList;
  };

  handleClickMenuItem = async ({ item, key, step, parentStep, subStepList = [], siblingStep }) => {
    const {
      form: { resetFields },
      sopTemplateId,
      mode,
    } = this.props;
    const { selectedKeys, SOPStepList } = this.state;
    const { id, groupType, type } = step;
    this.setState({ loading: true, initInputMaterials: [] });
    let isStepGroup = false;
    let parentGroupType = groupType;
    this.parentId = '';
    this.prevId = '';
    if (key.startsWith('create')) {
      const createId = `new_${key}_${step.id}`;
      const createStep = {
        step: { name: key.endsWith('Step') ? '新建步骤' : '新建步骤组', id: createId, isNew: true },
      };
      this.setState({ editMode: false, nextOptionStepListKeys: [0], controllerComponents: [0], controlList: [] });
      resetFields();
      if (key.startsWith('createChild')) {
        subStepList.unshift(createStep);
        // create child
        this.parentId = id;
        this.setState({
          siblingSteps: subStepList && subStepList.map(({ step: { name, id } }) => ({ name, id })),
        });
        if (key === 'createChildStepGroup') {
          isStepGroup = true;
        }
      } else if (key.startsWith('createNext')) {
        siblingStep.splice(siblingStep.findIndex(e => e.step.id === id) + 1, 0, createStep);
        // create next
        this.parentId = _.get(parentStep, 'id');
        this.prevId = id;
        parentGroupType = _.get(parentStep, 'groupType', SOP_STEP_GROUP_TYPE_SERIAL);
        this.setState({
          siblingSteps: getSiblingSteps(this.state.SOPStepList, id).map(({ step: { id, name } }) => ({ id, name })),
        });
        if (key === 'createNextStepGroup') {
          isStepGroup = true;
        }
      }
      this.setState({
        selectedKeys: [createId],
        isStepGroup,
        parentGroupType,
        hasModified: true,
        activeKey: [`${createId}-0`],
      });
    } else if (key === 'delete') {
      Modal.confirm({
        title: `确定要删除${step.name}吗?`,
        onOk: async () => {
          if (selectedKeys.includes(id)) {
            // fix:在编辑之后对当前步骤进行删除,切换步骤会提示是否保存
            this.setState({ hasModified: false });
          }
          this.setState({ selectedKeys: selectedKeys.filter(n => n !== id) });
          await this.props.SOPStepApi.deleteSOPStep({ id, stepNodeVersion: this.stepNodeVersion, sopTemplateId });
          await this.setSOPStepList();
        },
        okText: '确定',
        cancelText: '取消',
      });
    } else if (key === 'copy') {
      openModal({
        title: '复制步骤',
        autoClose: false,
        children: (
          <CopyStep
            SOPStepList={SOPStepList}
            type={type}
            stepId={id}
            sopId={this.SOPId}
            wrappedComponentRef={this.copyStepRef}
            mode={mode}
            copyCallback={async copyId => {
              await this.setSOPStepList();
              this.setState({ selectedKeys: [copyId] });
              this.setInitialValue(copyId);
            }}
          />
        ),
        okButton: (
          <Button
            onClick={async () => {
              await this.copyStepRef.current.wrappedInstance.handleCopy();
            }}
          >
            确定
          </Button>
        ),
      });
    }
    this.setState({ loading: false });
  };

  handleStepOrder = async ({ type, id }) => {
    const handleFunc = async () => {
      this.setState({ loading: true });
      await this.props.SOPStepApi.updateStepOrder(
        this.SOPId,
        this.stepNodeVersion,
        convertToStepNode(handleSopStep(removeNewStep(this.state.SOPStepList), { type, key: id })),
      );
      await this.setSOPStepList();
      this.setState({ loading: false });
    };
    if (this.state.hasModified) {
      this.unSaveWarning({
        onCancel: handleFunc,
        onOk: () => this.handleSubmit(handleFunc),
      });
    } else {
      handleFunc();
    }
  };

  renderMenu = ({ step, parentStep, subStepList, siblingStep }) => {
    const { type } = step;
    let baseMenus = [
      { title: '复制', key: 'copy' },
      { title: '创建后续步骤', key: 'createNextStep' },
      { title: '创建后续步骤组', key: 'createNextStepGroup' },
      { title: '删除', key: 'delete' },
    ];
    if (type === CONSTANT.SOP_STEP_TYPE_GROUP) {
      baseMenus = [
        { title: '创建子步骤', key: 'createChildStep' },
        { title: '创建子步骤组', key: 'createChildStepGroup' },
        ...baseMenus,
      ];
    }
    return (
      <Menu
        onClick={({ item, key }) => this.handleClickMenuItem({ item, key, step, parentStep, subStepList, siblingStep })}
      >
        {baseMenus.map(({ title, key }) => (
          <Menu.Item key={key}>
            <FormattedMessage defaultMessage={title} />
          </Menu.Item>
        ))}
      </Menu>
    );
  };

  unSaveWarning = ({ onOk, onCancel }) => {
    Modal.confirm({
      title: '请先保存',
      content: '您当前步骤编辑的内容仍未保存,要保存吗?',
      okText: '保存',
      cancelText: '取消',
      onOk,
      onCancel,
    });
  };

  renderTitle = ({
    step: { id, name, groupType, type, isNew = false },
    parentStep,
    step,
    isFirst,
    isLast,
    subStepList,
    siblingStep,
  }) => {
    const { searchValue, hasModified, isCreatedByTemplate } = this.state;
    const isGroupType = type === CONSTANT.SOP_STEP_TYPE_GROUP;
    const getName = value => {
      const index = name.indexOf(searchValue);
      const beforeStr = name.substr(0, index);
      const afterStr = name.substr(index + searchValue.length);
      if (index > -1) {
        return (
          <React.Fragment>
            {isGroupType && (
              <Icon
                iconType="gc"
                type={groupType === SOP_STEP_GROUP_TYPE_SERIAL ? 'chuan' : 'bing'}
                style={{ fontSize: 12, marginRight: 2 }}
              />
            )}
            {beforeStr}
            <span style={{ color: Color.red }}>{searchValue}</span>
            {afterStr}
          </React.Fragment>
        );
      }
      return value;
    };
    const handleClick = () => {
      this.setState({ selectedKeys: [id], SOPStepList: removeNewStep(this.state.SOPStepList) });
      this.setInitialValue(id);
    };
    return (
      <div style={{ display: 'flex' }}>
        <Tooltip title={getName(name)} mouseEnterDelay={2}>
          <span
            style={{ flex: 1, width: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}
            onClick={e => {
              e.preventDefault();
              if (isNew) {
                return;
              }
              if (!hasModified) {
                return handleClick();
              }
              this.unSaveWarning({ onCancel: handleClick, onOk: () => this.handleSubmit(handleClick) });
            }}
          >
            {getName(name)}
          </span>
        </Tooltip>
        {!isNew && !isCreatedByTemplate && (
          <div
            style={{
              width: 30,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <UpDownCaret
              onUp={() => {
                this.handleStepOrder({ type: 'up', id });
              }}
              onDown={() => {
                this.handleStepOrder({ type: 'down', id });
              }}
              upStyle={isFirst ? { display: 'none' } : {}}
              downStyle={isLast ? { display: 'none' } : {}}
            />
            <Dropdown overlay={this.renderMenu({ step, parentStep, subStepList, siblingStep })}>
              <Icon type="ellipsis" style={{ transform: 'rotate(90deg)' }} />
            </Dropdown>
          </div>
        )}
      </div>
    );
  };

  renderTreeNodes = (data, parentStep) => {
    return data.map(({ step, subStepList }, index, siblingStep) => {
      const props = {
        title: this.renderTitle({
          step,
          parentStep,
          isFirst: index === 0,
          isLast: index === data.length - 1,
          subStepList,
          siblingStep,
        }),
        key: step.id,
        icon: () => <Icon type="minus-circle" />,
      };
      if (subStepList && subStepList.length > 0) {
        return <TreeNode {...props}>{this.renderTreeNodes(subStepList, step)}</TreeNode>;
      }
      return <TreeNode {...props} />;
    });
  };

  setInitialValue = async id => {
    this.setState({ loading: true });
    const { SOPStepList } = this.state;
    const {
      form: { setFieldsValue, resetFields, setFields },
      sopTemplateId,
    } = this.props;
    const {
      data: { data },
    } = await this.props.SOPStepApi.getSOPStepDetail(id, this.SOPId);
    if (!data) {
      this.setState({ loading: false });
      return;
    }
    const { step, controlList } = data;
    resetFields();
    setLocation(this.props, { stepId: id }, { type: 'replace' });
    const {
      groupType,
      nextOptionalStepList,
      nextTrigger,
      privilegeType,
      privilegeValue,
      digitalSignatureValue,
      digitalSignatureType,
      nextLogic,
      frequency,
      maxTimes,
      ...rest
    } = step;
    const getSelectValue = obj => {
      if (!obj) {
        return null;
      }
      if (obj.display) {
        return obj.display;
      }
      return obj;
    };
    const handleInputStandard = (inputStandard, standardLogic) => {
      if (!inputStandard) {
        return inputStandard;
      }
      const { logic, max, min, base } = inputStandard;
      if (logic === CONSTANT.TOLERANCE && standardLogic === CONSTANT.INPUT_STANDARD_LOGIC_FIXED) {
        return {
          ...inputStandard,
          max: parseFloat(new Big(max).minus(base)),
          min: parseFloat(new Big(min).minus(base)),
        };
      }
      return inputStandard;
    };
    const initInputMaterials = {};
    controlList.forEach(({ type, inputMaterialLists, receiveMaterialLists, moveMaterialLists }, index) => {
      let materialLists;
      if (type === CONSTANT.TYPE_INPUT) {
        materialLists = inputMaterialLists;
      } else if (type === CONSTANT.TYPE_RECEIVE_SCAN) {
        materialLists = receiveMaterialLists;
      } else if (type === CONSTANT.TYPE_MATERIAL_LOT_TRANSFER) {
        materialLists = moveMaterialLists;
      }
      initInputMaterials[index] =
        materialLists &&
        materialLists.map(node => ({
          ...node,
          material: {
            ...node.material,
            code: encodeMaterialCode(node.material.code),
          },
        }));
    });
    this.setState(
      {
        controlList,
        parentGroupType: _.get(getParentStep(id, SOPStepList), 'groupType', SOP_STEP_GROUP_TYPE_SERIAL),
        hasModified: false,
        editMode: true,
        controllerComponents: controlList && controlList.map((n, index) => index),
        activeKey: controlList && controlList.map((n, index) => `${id}-${index}`),
        isStepGroup: !!groupType,
        nextOptionStepListKeys: arrayIsEmpty(nextOptionalStepList)
          ? [0]
          : nextOptionalStepList.map((n, index) => index),
        lastKey: controlList.length,
        loading: false,
        initInputMaterials,
        siblingSteps: getSiblingSteps(SOPStepList, id).map(({ step: { id, name } }) => ({ id, name })),
        errorControllers: [],
      },
      () => {
        setFieldsValue({
          ...rest,
          groupType,
          privilegeType,
          controlList: controlList.map(node => {
            const { showValue, showLogic, inputOptionList } = node;
            return {
              ...node,
              showValue:
                showValue &&
                (showLogic === LOGIC_FIXED_FILE ? [showValue && showValue.display] : getSelectValue(showValue)),

              inputOptionListKeys: inputOptionList ? inputOptionList.map((i, index) => index) : [0],
            };
          }),
        });
        setTimeout(() => {
          setFieldsValue({
            frequency,
            maxTimes,
            nextLogic,
            privilegeValue: privilegeValue && (privilegeValue.display || privilegeValue),
            digitalSignatureType,
            controlList: controlList.map(
              ({
                inputOptionList,
                inputTextType,
                inputUnit,
                verifyType,
                verifyValue,
                inputWeightObject,
                inputDefaultLogic,
                inputStandard,
                updatedFieldId,
                agvCallProperty,
                triggerException,
                report,
                standardLogic,
              }) => ({
                standardLogic,
                inputOptionList,
                inputTextType,
                inputUnit: inputUnit ? { key: inputUnit, label: inputUnit } : undefined,
                verifyType,
                updatedFieldId: getSelectValue(updatedFieldId),
                verifyValue: verifyValue || undefined,
                inputDefaultLogic,
                inputStandard: handleInputStandard(inputStandard, standardLogic),
                inputWeightObject: inputWeightObject && { key: inputWeightObject.id, label: inputWeightObject.name },
                agvCallProperty,
                triggerException: triggerException || false,
                reportId: report,
              }),
            ),
          });
          setTimeout(() => {
            setFieldsValue({
              nextTrigger,
              nextOptionalStepList,
              digitalSignatureValue: digitalSignatureValue && (digitalSignatureValue.display || digitalSignatureValue),
              controlList: controlList.map(({ inputDefaultValue, inputStandard, standardLogic }) => ({
                inputDefaultValue: getSelectValue(inputDefaultValue),
                inputStandard: handleInputStandard(inputStandard, standardLogic),
              })),
            });
          }, 0);
        }, 0);
      },
    );
  };

  handleSubmit = callback => {
    const { isStepGroup, controllerComponents, editMode, selectedKeys, isCreatedByTemplate, activeKey } = this.state;
    const {
      form: { validateFieldsAndScroll, getFieldValue },
      sopTemplateId,
    } = this.props;
    const handleStorage = value => {
      if (!value) {
        return undefined;
      }

      return value.split(',')[0];
    };
    validateFieldsAndScroll(
      async (err, values) => {
        this.setState({
          errorControllers: [],
        });
        if (err) {
          console.log('err', err);
          if (!arrayIsEmpty(err.controlList)) {
            const errorControllers = err.controlList.map((n, index) => `${selectedKeys[0]}-${index}`);
            this.setState({
              errorControllers,
              activeKey: [...activeKey, ...errorControllers],
            });
          }
          if (Object.keys(err).filter(key => key !== 'controlList').length > 0) {
            this.setState({ hiddenDetail: false });
          }
          return;
        }
        console.log('submitValue', values);
        this.setState({ loading: true });
        try {
          const { nextOptionalStepList, privilegeValue, digitalSignatureValue } = values;
          const submitValues = {
            ...values,
            nextOptionalStepList: nextOptionalStepList && nextOptionalStepList.filter(n => n).map(({ key }) => key),
            digitalSignatureValue: digitalSignatureValue && digitalSignatureValue.key,
            controlList: [],
          };

          if (!isStepGroup) {
            submitValues.controlList = controllerComponents.map((key, index) => {
              const controller = getFieldValue(`controlList[${key}]`);
              const {
                showValue,
                inputStandard,
                showLogic,
                updatedFieldId,
                inputOptionList,
                inputDefaultValue,
                inputUnit,
                verifyValue,
                inputWeightObject,
                inputMaterialLists = {},
                type,
                reportId,
                standardLogic,
              } = controller;
              let _inputStandard = null;
              const inputMaterialMap = new Map([
                [CONSTANT.TYPE_INPUT, 'inputMaterialLists'],
                [CONSTANT.TYPE_RECEIVE_SCAN, 'receiveMaterialLists'],
                [CONSTANT.TYPE_MATERIAL_LOT_TRANSFER, 'moveMaterialLists'],
              ]);
              if (inputMaterialMap.get(type)) {
                controller[inputMaterialMap.get(type)] = Object.keys(inputMaterialLists)
                  .map(key => inputMaterialLists[key])
                  .map(node => {
                    if (!node.enable) {
                      return { enable: false, materialCode: decodeMaterialCode(node.materialCode) };
                    }
                    return {
                      ...node,
                      materialCode: decodeMaterialCode(node.materialCode),
                      storageId: handleStorage(node.storageId),
                      originStorageId: handleStorage(node.originStorageId),
                      targetStorageId: handleStorage(node.targetStorageId),
                    };
                  });
                if (type !== CONSTANT.TYPE_INPUT) {
                  controller.inputMaterialLists = undefined;
                }
              }
              if (Object.values(inputStandard || {}).filter(n => n).length > 0) {
                _inputStandard = inputStandard;
                const { logic, base, max, min } = _inputStandard;
                if (
                  logic === CONSTANT.TOLERANCE &&
                  typeof base === 'number' &&
                  standardLogic === CONSTANT.INPUT_STANDARD_LOGIC_FIXED
                ) {
                  _inputStandard.max = new Big(base).plus(max);
                  _inputStandard.min = new Big(base).plus(min);
                }
              }
              return {
                ...controller,
                standardLogic: typeof standardLogic === 'number' ? standardLogic : null,
                sequence: index,
                showValue:
                  showValue &&
                  (showLogic === LOGIC_FIXED_FILE ? showValue[0].id || showValue[0] : showValue.key || showValue),
                inputStandard: _inputStandard,
                updatedFieldId: updatedFieldId && updatedFieldId.key,
                inputOptionList: inputOptionList && inputOptionList.filter(n => n),
                inputDefaultValue: inputDefaultValue && (inputDefaultValue.key || inputDefaultValue),
                inputUnit: inputUnit && inputUnit.label,
                verifyValue: verifyValue && verifyValue.key,
                inputWeightObject: inputWeightObject && inputWeightObject.key,
                reportId: reportId && reportId.key,
              };
            });
            submitValues.privilegeValue = privilegeValue && privilegeValue.key;
          }
          if (editMode) {
            let editApi = isStepGroup ? this.props.SOPStepApi.updateSOPStepGroup : this.props.SOPStepApi.updateSOPStep;
            editApi = isCreatedByTemplate ? updateSOPStepFromTemplate : editApi;
            await editApi(selectedKeys[0], submitValues, this.SOPId);
            await this.setSOPStepList();
          } else {
            const submitApi = isStepGroup
              ? this.props.SOPStepApi.createSOPStepGroup
              : this.props.SOPStepApi.createSOPStep;
            const {
              data: { data },
            } = await submitApi(
              { sopId: this.SOPId, parentId: this.parentId, prevId: this.prevId, sopTemplateId: this.SOPId },
              submitValues,
            );
            await this.setSOPStepList();
            this.setState({ selectedKeys: [data], editMode: true, activeKey: [`${data}-0`] }, () => {
              this.setInitialValue(data);
            });
          }
          if (this.isSopTemplate()) {
            message.success('保存成功并同步至通过该模板创建的所有 SOP 中');
          } else {
            message.success('操作成功！');
          }

          this.setState({ loading: false, hasModified: false });
          if (callback && typeof callback === 'function') {
            callback();
          }
        } catch (e) {
          console.log(e);
          this.setState({ loading: false });
        }
      },
      { force: true },
    );
  };

  insertController = key => {
    const { lastKey, controllerComponents, selectedKeys, activeKey } = this.state;
    const addKey = lastKey + 1;
    const _controllerComponents = [...controllerComponents];
    const findIndex = _controllerComponents.findIndex(i => key === i);
    _controllerComponents.splice(findIndex + 1, 0, addKey);
    this.setState({
      controllerComponents: _controllerComponents,
      lastKey: addKey,
      activeKey: [...activeKey, `${selectedKeys[0]}-${addKey}`],
    });
  };

  renderControllerList = () => {
    const {
      isStepGroup,
      controllerComponents,
      loading,
      SOPDetail,
      lastKey,
      SOPStepList,
      hasModified,
      selectedKeys,
      inputMaterials,
      initInputMaterials,
      isSyncInputMaterial,
      editMode,
      isCreatedByTemplate,
      activeKey,
      errorControllers,
      mBomData,
    } = this.state;
    const { mode } = this.props;
    const hasStepList = SOPStepList && SOPStepList.length > 0;
    const hasSelectedKeys = selectedKeys && selectedKeys.length > 0;
    const showUnsavedIcon = hasModified ? '*' : null;
    if (!hasStepList) {
      return <div className={style.notAllowAddController}>请新建步骤(组)</div>;
    }
    if (!hasSelectedKeys) {
      return <div className={style.notAllowAddController}>请选择步骤(组)</div>;
    }
    if (isStepGroup) {
      return (
        <div className={style.notAllowAddController}>
          <span className={style.notAllowAddControllerTip}>步骤组不能添加控件</span>
          <Button onClick={this.handleSubmit}>保存{showUnsavedIcon}</Button>
        </div>
      );
    }
    return (
      <div>
        <Spin spinning={loading}>
          <Collapse
            bordered={false}
            activeKey={activeKey}
            onChange={value => {
              this.setState({ activeKey: value });
            }}
          >
            {controllerComponents.map((key, index) => {
              const panelKey = `${selectedKeys[0]}-${key}`;
              return (
                <Panel
                  style={{
                    border: `1px solid ${errorControllers.includes(panelKey) ? Color.errorRed : Color.border}`,
                    marginBottom: 4,
                  }}
                  id={key}
                  key={panelKey}
                  header={
                    <div className={style.controllerHeader}>
                      <span style={{ flex: 1 }}>
                        {this.props.form.getFieldValue(`controlList[${key}].showName`) || '控件'}
                      </span>
                      {!isCreatedByTemplate && (
                        <div className="child-gap" onClick={e => e.stopPropagation()} style={{ width: 160 }}>
                          <Link
                            onClick={e => {
                              this.insertController(key);
                            }}
                          >
                            插入控件
                          </Link>
                          <Link
                            onClick={e => {
                              this.setState({
                                controllerComponents: swapArray(controllerComponents, index, index - 1),
                                hasModified: true,
                              });
                            }}
                            disabled={index === 0}
                          >
                            上移
                          </Link>
                          <Link
                            onClick={e => {
                              this.setState({
                                controllerComponents: swapArray(controllerComponents, index, index + 1),
                                hasModified: true,
                              });
                            }}
                            disabled={index === controllerComponents.length - 1}
                          >
                            下移
                          </Link>
                          <Link
                            type="error"
                            onClick={e => {
                              this.setState({
                                controllerComponents: controllerComponents.filter(n => n !== key),
                                hasModified: true,
                              });
                            }}
                          >
                            删除
                          </Link>
                        </div>
                      )}
                    </div>
                  }
                >
                  <div style={{ position: 'relative' }}>
                    <div>
                      <ControlComponent
                        mode={mode}
                        className={style.controller}
                        prefix={`controlList[${key}].`}
                        SOPDetail={SOPDetail}
                        form={this.props.form}
                        setSOPDetail={this.setSOPDetail}
                        handleModifyState={this.handleModifyState}
                        inputMaterials={initInputMaterials[key]}
                        latestInputMaterials={inputMaterials}
                        isSyncInputMaterial={isSyncInputMaterial}
                        editMode={editMode}
                        isCreatedByTemplate={isCreatedByTemplate}
                        sopId={this.SOPId}
                        mBomData={mBomData}
                      />
                    </div>
                  </div>
                </Panel>
              );
            })}
          </Collapse>
          <div>
            {!isCreatedByTemplate && (
              <Button
                icon="plus-circle-o"
                type="dashed"
                style={{ width: '100%', marginTop: 10 }}
                onClick={() => this.insertController(controllerComponents[controllerComponents.length - 1])}
              >
                添加控件
              </Button>
            )}
          </div>
          <div className={style.controllersFooter}>
            <Button style={{ width: 150 }} onClick={this.handleSubmit}>
              <FormattedMessage defaultMessage={'保存'} />
              {showUnsavedIcon}
            </Button>
          </div>
        </Spin>
      </div>
    );
  };

  renderNotTree = () => {
    const { isCreatedByTemplate } = this.state;
    const handleNew = type => {
      this.handleClickMenuItem({
        key: type === 'step' ? 'createChildStep' : 'createChildStepGroup',
        step: { groupType: SOP_STEP_GROUP_TYPE_SERIAL },
      });
      this.setState({
        SOPStepList: [{ step: { id: 1, name: type === 'step' ? '新建步骤' : '新建步骤组', isNew: true } }],
      });
    };
    return (
      <div className={style.stepListNotData}>
        <Button style={{ marginRight: 10 }} onClick={() => handleNew('step')} disabled={isCreatedByTemplate}>
          新建步骤
        </Button>
        <Button onClick={() => handleNew('stepGroup')} disabled={isCreatedByTemplate}>
          新建步骤组
        </Button>
      </div>
    );
  };

  toggleStepListHidden = hiddenStepList => {
    this.setState({ hiddenStepList });
  };

  toggleDetailHidden = hiddenDetail => {
    this.setState({ hiddenDetail });
  };

  render() {
    const {
      form: { getFieldValue, resetFields, getFieldsValue, setFieldsValue },
      form,
      type,
      mode,
    } = this.props;
    const {
      nextOptionStepListKeys,
      SOPStepList,
      SOPDetail,
      isStepGroup,
      loading,
      parentGroupType,
      selectedKeys,
      siblingSteps,
      expandedKeys,
      syncInputMaterialLoading,
      isCreatedByTemplate,
      controllerComponents,
      hiddenStepList,
      hiddenDetail,
    } = this.state;
    const getFieldDecorator = (name, options) => component => {
      return form.getFieldDecorator(name, {
        getValueFromEvent: e => {
          this.setState({ hasModified: true });
          return defaultGetValueFromEvent(e);
        },
        ...options,
      })(React.cloneElement(component, { disabled: isCreatedByTemplate }));
    };
    const hasStepList = SOPStepList && SOPStepList.length > 0;
    const hasSelectedKeys = selectedKeys && selectedKeys.length > 0;
    const isSerialParent = parentGroupType === SOP_STEP_GROUP_TYPE_SERIAL;
    const { nextLogic, digitalSignatureType, digitalSignature, last, selfLoop } = getFieldsValue();
    const showOptionField = isSerialParent && !last && nextLogic === NEXT_LOGIC_PERSON_SELECT;
    const optionField = (
      <FormItem label="可选步骤">
        {nextOptionStepListKeys.map(key => (
          <div key={key} style={{ display: 'flex', marginBottom: 10 }} className="vertical-center child-gap">
            <FormItem style={{ margin: 0, marginRight: 4 }}>
              {getFieldDecorator(`nextOptionalStepList[${key}]`, {
                rules: [{ required: true, message: '可选步骤必填' }],
                hidden: !showOptionField,
              })(
                <Select style={{ width }} labelInValue>
                  {siblingSteps &&
                    siblingSteps
                      .filter(({ id }) => id.toString().indexOf('create') === -1)
                      .map(({ id, name }) => (
                        <Option key={id} value={id}>
                          {name}
                        </Option>
                      ))}
                </Select>,
              )}
            </FormItem>
            {nextOptionStepListKeys.length > 1 && !isCreatedByTemplate && (
              <Icon
                type="minus-circle"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  this.setState({
                    nextOptionStepListKeys: nextOptionStepListKeys.filter(value => value !== key),
                  });
                }}
              />
            )}
          </div>
        ))}
        {!isCreatedByTemplate && (
          <Link
            icon="plus-circle-o"
            onClick={() => {
              this.setState({
                nextOptionStepListKeys: [
                  ...nextOptionStepListKeys,
                  (nextOptionStepListKeys[nextOptionStepListKeys.length - 1] || 0) + 1,
                ],
              });
            }}
          >
            添加可选步骤
          </Link>
        )}
      </FormItem>
    );
    const stepName = `步骤${isStepGroup ? '组' : ''}`;
    const title = mode === 'sopTemplate' ? '编辑SOP模板步骤' : '编辑SOP步骤';
    return (
      <div className={style.sopStep}>
        <h2>
          <FormattedMessage defaultMessage={title} /> ({_.get(this.getSOPDetail(), 'code')})
        </h2>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div className={hiddenStepList ? style.sopStepListHidden : style.sopStepList}>
            <div className={style.sopStepListHeader}>
              <FormattedMessage defaultMessage={'步骤列表'} />
              {loading ? (
                <Icon type="loading" />
              ) : (
                <Icon type="reload" className={style.reloadIcon} title="刷新步骤列表" onClick={this.setSOPStepList} />
              )}
            </div>
            <Search
              onSearch={value => {
                const dataList = [];
                const flatTree = data => {
                  for (let i = 0; i < data.length; i += 1) {
                    const node = data[i];
                    const key = node.step.id;
                    const name = node.step.name;
                    dataList.push({ name, key });
                    if (node.subStepList) {
                      flatTree(node.subStepList);
                    }
                  }
                };
                flatTree(SOPStepList);
                const expandedKeys = dataList
                  .map(({ name, key }) => {
                    if (name.indexOf(value) > -1) {
                      const parentStep = getParentStep(key, SOPStepList);
                      return parentStep && parentStep.id.toString();
                    }
                    return null;
                  })
                  .filter((item, i, self) => item && self.indexOf(item) === i);
                this.setState({ searchValue: value, expandedKeys });
              }}
            />
            <Spin spinning={loading}>
              <div className={style.stepListTree}>
                {_.get(SOPStepList, 'length') ? (
                  <Tree
                    showLine
                    expandedKeys={expandedKeys}
                    defaultExpandedKeys={expandedKeys}
                    onExpand={expandedKeys => this.setState({ expandedKeys })}
                    selectedKeys={selectedKeys.map(key => key.toString())}
                  >
                    {this.renderTreeNodes(SOPStepList.length > 0 ? SOPStepList : [])}
                  </Tree>
                ) : (
                  this.renderNotTree()
                )}
              </div>
            </Spin>
          </div>
          <div className={style.controllers}>
            <div className={style.leftCollapse} onClick={() => this.toggleStepListHidden(!hiddenStepList)}>
              <Tooltip.AntTooltip title={hiddenStepList ? '展开列表' : '收起列表'}>
                <Icon type={hiddenStepList ? 'double-right' : 'double-left'} />
              </Tooltip.AntTooltip>
            </div>
            <div className={style.rightCollapse} onClick={() => this.toggleDetailHidden(!hiddenDetail)}>
              <Tooltip.AntTooltip title={hiddenDetail ? '展开详情' : '收起详情'}>
                <Icon type={hiddenDetail ? 'double-left' : 'double-right'} />
              </Tooltip.AntTooltip>
            </div>
            <div className={style.listHeader}>
              <FormattedMessage className={style.title} defaultMessage={'控件列表'} />
              <div className="child-gap">
                {!isStepGroup && (
                  <React.Fragment>
                    <Button onClick={() => this.setState({ activeKey: [] })}>全部收起</Button>
                    <Button
                      onClick={() =>
                        this.setState({
                          activeKey:
                            controllerComponents && controllerComponents.map(key => `${selectedKeys[0]}-${key}`),
                        })
                      }
                    >
                      全部展开
                    </Button>
                  </React.Fragment>
                )}
                {mode !== 'sopTemplate' && !isStepGroup && (
                  <Button
                    loading={syncInputMaterialLoading}
                    onClick={async () => {
                      try {
                        this.setState({ syncInputMaterialLoading: true });
                        await this.setSOPDetail();
                        this.setState({ isSyncInputMaterial: true, syncInputMaterialLoading: false });
                        message.success('投产、收料投产、物料转移控件可投产物料同步完成!');
                      } catch (e) {
                        console.log(e);
                        message.success('同步失败!');
                        this.setState({ syncInputMaterialLoading: false });
                      }
                    }}
                  >
                    同步投产物料
                  </Button>
                )}
              </div>
            </div>
            {this.renderControllerList()}
          </div>
          <div className={hiddenDetail ? style.stepDetailHidden : style.stepDetail}>
            <FormattedMessage className={style.detailTitle} defaultMessage={`${stepName}详情`} />
            {hasStepList && hasSelectedKeys ? (
              <React.Fragment>
                <FormItem label={`${stepName}名称`}>
                  {getFieldDecorator('name', {
                    rules: [requiredRule(`${stepName}名称`)],
                  })(<Input style={{ width }} />)}
                </FormItem>
                <FormItem label="显示名称">
                  {getFieldDecorator('showName', {
                    rules: [requiredRule('显示名称')],
                  })(<Input style={{ width }} />)}
                </FormItem>
                {isStepGroup && (
                  <FormItem label="类型">
                    {getFieldDecorator('groupType', {
                      rules: [requiredRule('类型')],
                    })(
                      <Select style={{ width }}>
                        {Array.from(SopStepGroupType, ([key, value]) => (
                          <Option value={key}>{value}</Option>
                        ))}
                      </Select>,
                    )}
                  </FormItem>
                )}
                {!isStepGroup && (
                  <React.Fragment>
                    <FormItem label="执行权限">
                      {getFieldDecorator('privilegeType', {
                        rules: [{ required: !isStepGroup, message: '执行权限不能为空' }],
                      })(<PrivilegeTypeSelect style={{ width }} onChange={() => resetFields(['privilegeValue'])} />)}
                    </FormItem>
                    {getFieldValue('privilegeType') && (
                      <FormItem label=" " required={false}>
                        {getFieldDecorator('privilegeValue', {
                          rules: [requiredRule('执行权限')],
                        })(<PrivilegeSelect privilegeType={getFieldValue('privilegeType')} SOPDetail={SOPDetail} />)}
                      </FormItem>
                    )}
                  </React.Fragment>
                )}
                {isSerialParent && (
                  <FormItem label="起始步骤">
                    {getFieldDecorator('first', {
                      initialValue: false,
                      rules: [requiredRule('起始步骤')],
                    })(<RadioGroup options={[{ value: true, label: '是' }, { value: false, label: '否' }]} />)}
                  </FormItem>
                )}
                {isSerialParent && (
                  <FormItem label="终止步骤">
                    {getFieldDecorator('last', {
                      initialValue: false,
                      rules: [requiredRule('终止步骤')],
                    })(
                      <RadioGroup
                        onChange={e =>
                          setFieldsValue({ nextLogic: e.target.value ? CONSTANT.NEXT_LOGIC_NONE : NEXT_LOGIC_NEXT })
                        }
                        options={[{ value: true, label: '是' }, { value: false, label: '否' }]}
                      />,
                    )}
                  </FormItem>
                )}
                {!isStepGroup && (
                  <FormItem label="电子签名">
                    {getFieldDecorator('digitalSignature', {
                      rules: [requiredRule('电子签名')],
                      initialValue: false,
                    })(<RadioGroup options={[{ value: true, label: '是' }, { value: false, label: '否' }]} />)}
                  </FormItem>
                )}
                {!isStepGroup && (
                  <FormItem label="自循环">
                    {getFieldDecorator('selfLoop', {
                      initialValue: false,
                    })(<RadioGroup options={[{ value: true, label: '是' }, { value: false, label: '否' }]} />)}
                  </FormItem>
                )}
                {selfLoop && (
                  <React.Fragment>
                    <FormItem label="循环频数">
                      {getFieldDecorator('frequency', {
                        rules: [requiredRule('循环频数'), { validator: amountValidator(null, null) }],
                        hidden: !selfLoop,
                      })(<InputNumber style={{ width: 100, marginRight: 5 }} />)}
                      <span>分钟循环一次</span>
                    </FormItem>
                    <FormItem label="最大循环次数">
                      {getFieldDecorator('maxTimes', {
                        rules: [requiredRule('最大循环次数'), { validator: amountValidator(100, null) }],
                        hidden: !selfLoop,
                      })(<InputNumber style={{ width }} />)}
                    </FormItem>
                  </React.Fragment>
                )}
                {!isStepGroup && digitalSignature && (
                  <FormItem label="签名权限">
                    {getFieldDecorator('digitalSignatureType', {
                      rules: [requiredRule('签名权限')],
                    })(
                      <PrivilegeTypeSelect
                        types={[
                          CONSTANT.SOP_STEP_PRIVILEGE_TYPE_ROLE,
                          CONSTANT.SOP_STEP_PRIVILEGE_TYPE_USER,
                          CONSTANT.SOP_STEP_PRIVILEGE_TYPE_USERTYPE,
                        ]}
                        style={{ width }}
                        onChange={() => {
                          resetFields(['digitalSignatureValue']);
                        }}
                      />,
                    )}
                    <div>
                      {getFieldDecorator('digitalSignatureValue', {
                        rules: [requiredRule('签名权限')],
                      })(
                        <PrivilegeSelect
                          style={{ width }}
                          SOPDetail={SOPDetail}
                          privilegeType={digitalSignatureType}
                        />,
                      )}
                    </div>
                  </FormItem>
                )}
                {isSerialParent && (
                  <FormItem label="后续步骤">
                    {getFieldDecorator('nextLogic', {
                      initialValue: NEXT_LOGIC_NEXT,
                      rules: [requiredRule('后续步骤')],
                    })(
                      <Select style={{ width }}>
                        {(last
                          ? [CONSTANT.NEXT_LOGIC_NONE, NEXT_LOGIC_IF_JUDGE]
                          : [NEXT_LOGIC_NEXT, !isStepGroup && NEXT_LOGIC_PERSON_SELECT, NEXT_LOGIC_IF_JUDGE]
                        )
                          .filter(n => n !== false)
                          .map(key => (
                            <Option value={key}>{NextLogic[key]}</Option>
                          ))}
                      </Select>,
                    )}
                  </FormItem>
                )}
                {showOptionField && optionField}
                {isSerialParent && nextLogic === NEXT_LOGIC_IF_JUDGE && (
                  <FormItem label="执行条件">
                    {getFieldDecorator('nextTrigger', {
                      rules: [requiredRule('执行条件')],
                    })(<Textarea maxLength={1000} style={{ width }} />)}
                  </FormItem>
                )}
                <FormItem label="结束后执行">
                  {getFieldDecorator('execAfterFinishTrigger')(<Textarea maxLength={1000} style={{ width }} />)}
                </FormItem>
              </React.Fragment>
            ) : (
              <div className={style.notAllowAddController}>{hasStepList ? '请选择步骤(组)' : '请新建步骤(组)'}</div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

SOPStep.propTypes = {
  mode: PropTypes.oneOf(['sop', 'sopTemplate']),
};

export default withForm({}, SOPStep);
