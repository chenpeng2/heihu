import React, { Component } from 'react';
import classNames from 'classnames';
import _ from 'lodash';
import { Table, Tag, Icon, openModal, Popconfirm, Link, Tooltip } from 'components';
import { closeModal } from 'components/modal';
import ImportQcConfigModal from 'src/containers/qcConfig/qcConfigBase/importQcConfig';
import { getWorkstation } from 'src/services/knowledgeBase/workstation';
import { replaceSign } from 'src/constants';
import { RULE } from 'src/views/organizationConfig/customRule/utils';
import { queryWorkstationById } from 'src/services/workstation/index';
import { thousandBitSeparator } from 'utils/number';
import { arrayIsEmpty } from 'utils/array';
import { message } from 'antd';
import PropTypes from 'prop-types';

import { getCustomRule } from './QcPlanQcConfigPanel';
import { getWorkstationFirstQcWorker, timeInterval } from '../utils';
import { QcPlanQcConfigPanel, ControlSettingForm } from '../components';
import styles from '../styles.scss';
import {
  FIRST_QUALITY_CONTROL,
  firstQcTaskControlLevelMap,
  unqualifiedQualityStatusMap,
  QUALITY_STATUS_UNQUALIFIED,
  QUALITY_STATUS_AWAIT_CHECK,
  QUALITY_STATUS_ON_HOLD,
  QUALITY_STATUS_DEVIATION_QUALIFIED,
  PRODUCE_ORIGIN_QC,
} from '../../constants';

const processFirstWorkstationByFirstCheck = RULE.firstCheckLocation.processFirstWorkstation.value;
const processFirstOperatorByFirstCheck = RULE.firstCheckOperator.processFirstOperator.value;
const processFirstWorkstationByProdCheck = RULE.prodCheckLocation.processFirstWorkstation.value;
const processFirstOperatorByProdCheck = RULE.prodCheckOperator.processFirstOperator.value;

const noPassStatusesEmpty = noPassStatuses => {
  const filter = _.omitBy(noPassStatuses, o => _.isEqualWith(o, false) || _.isEqualWith(o, undefined));
  const len = Object.keys(filter).length;
  if (len < 1) return true;

  return false;
};

const getDefaultWorkStation = async workstations => {
  if (!Array.isArray(workstations) || workstations.length < 1) return null;

  const workstationId = workstations[0];
  const res = await getWorkstation(workstationId);
  const workstation = _.get(res, 'data.data');
  return { key: workstation.id, label: workstation.name };
};

const getDefaultOperator = async workstations => {
  const workstationId = workstations[0];
  if (workstationId) {
    const res = await getWorkstation(workstationId);
    const data = _.get(res, 'data.data');
    const operator = await getWorkstationFirstQcWorker(data);
    return operator;
  }
  return undefined;
};

const updatePlanProcesses = ({ qcPlanProcesses, selectedProcessId, selectedKey, fieldValues, newFlag, qcConfig }) => {
  const { taskCreateIntervalValue, taskCreateIntervalUnit } = fieldValues;
  const newQcPlanProcesses = qcPlanProcesses.map(process => {
    const { qcPlanProcessConfigs, id } = process || {};

    if (id === selectedProcessId) {
      let newQcPlanProcessConfigs = qcPlanProcessConfigs;
      newQcPlanProcessConfigs = arrayIsEmpty(qcPlanProcessConfigs)
        ? []
        : qcPlanProcessConfigs.map(config => {
            const { key } = config || {};
            if (key === selectedKey) {
              const taskCreateInterval = timeInterval(taskCreateIntervalValue, taskCreateIntervalUnit);
              return { ...config, ...fieldValues, taskCreateInterval };
            }
            return config;
          });
      if (newFlag && qcConfig) {
        newQcPlanProcessConfigs = newQcPlanProcessConfigs.concat(qcConfig);
      }
      return { ...process, qcPlanProcessConfigs: newQcPlanProcessConfigs };
    }
    return process;
  });
  return newQcPlanProcesses;
};

type Props = {
  form: any,
  qcPlanProcesses: Array,
  loading: Boolean,
  editing: Boolean,
  checkType: Number,
  customRuleList: [],
};

class QcPlanProcessTable extends Component {
  props: Props;
  constructor(props) {
    super(props);
    this.state = {
      qcPlanProcesses: [],
      selectedKey: null,
      qcConfigData: {},
      qcPlanProcess: {},
      onDeleteKey: null,
    };
  }

  selectedProcessCode = null;
  /** 工序ID */
  selectedProcessId;

  // 此方法在../edit文件处调用
  setInitialData = qcPlanProcesses => {
    this.setState({ qcPlanProcesses, qcConfigData: {} });
  };

  handleExtraTagClick = () => {
    return new Promise((resovle, reject) => {
      const { selectedKey, qcPlanProcesses, qcConfigData } = this.state;
      const process = _.find(qcPlanProcesses, o => o.id === this.selectedProcessId) || {};
      const qcConfig = _.find(process.qcPlanProcessConfigs, o => o.key === selectedKey);
      const formRef = _.get(this.QcPlanQcConfigForm, 'props.form');
      if (_.isEmpty(qcConfigData) || !formRef) {
        resovle();
        return;
      }
      formRef.validateFieldsAndScroll(errors => {
        if (errors) {
          reject();
          return;
        }
        resovle();
        const values = formRef ? formRef.getFieldsValue() : {};
        this.handleQcConfigTagClick({ ...qcConfig, ...values }, false, process);
      });
    });
  };

  getCustomRuleConfig = (customRuleList, checkType) => {
    const {
      firstCheckLocationRule,
      firstCheckOperatorRule,
      prodCheckLocationRule,
      prodCheckOperatorRule,
    } = getCustomRule(customRuleList);
    if (checkType === PRODUCE_ORIGIN_QC) {
      return {
        checkLocationRule:
          firstCheckLocationRule.ruleType === processFirstWorkstationByFirstCheck && firstCheckLocationRule.status,
        checkOperatorRule:
          firstCheckOperatorRule.ruleType === processFirstOperatorByFirstCheck && firstCheckOperatorRule.status,
      };
    }
    return {
      checkLocationRule:
        prodCheckLocationRule.ruleType === processFirstWorkstationByProdCheck && prodCheckLocationRule.status,
      checkOperatorRule:
        prodCheckOperatorRule.ruleType === processFirstOperatorByProdCheck && prodCheckOperatorRule.status,
    };
  };

  handleQcConfigTagClick = async (qcConfig, newFlag = false, qcPlanProcess) => {
    const { editing, customRuleList } = this.props;
    const { selectedKey, qcPlanProcesses } = this.state;
    const { key: onSelectKey, operator, workstation, checkType } = qcConfig;
    const { checkLocationRule, checkOperatorRule } = this.getCustomRuleConfig(customRuleList, checkType);
    if (workstation && !workstation.label) {
      const res = await queryWorkstationById(
        !arrayIsEmpty(qcPlanProcess.workstations) && qcPlanProcess.workstations[0],
      );
      const workstation = _.get(res, 'data.data', {});
      qcConfig.workstation = { key: workstation.id, label: workstation.name };
    }
    if (!editing && !operator && checkOperatorRule) {
      /** 质检执行人默认为添加进来的质检工位上对应的第一个质检员工 */
      const operator = await getDefaultOperator(qcPlanProcess.workstations);
      qcConfig.operator = operator;
    }
    if (!editing && !workstation && checkLocationRule) {
      const workstation = await getDefaultWorkStation(qcPlanProcess.workstations);
      if (workstation) {
        qcConfig.workstation = workstation;
      }
    }
    // validate的都是上一次填写的表单内容，非当前准备点击的
    const formRef = _.get(this.QcPlanQcConfigForm, 'props.form');
    if (!formRef) return;

    formRef.validateFieldsAndScroll((err, values) => {
      if (err) return;
      const newQcPlanProcesses = updatePlanProcesses({
        qcPlanProcesses,
        selectedProcessId: this.selectedProcessId,
        selectedKey,
        fieldValues: values,
        newFlag,
        qcConfig,
      });
      this.setState(
        {
          selectedKey: onSelectKey,
          qcConfigData: qcConfig,
          qcPlanProcesses: newQcPlanProcesses,
        },
        () => {
          this.props.form.setFieldsValue({ qcPlanProcesses: this.state.qcPlanProcesses });
          formRef.resetFields();
        },
      );
    });
  };

  onAddQcConfig = ({ processSeq, processCode, processId, selectedIndex }) => {
    const formRef = _.get(this.QcPlanQcConfigForm, 'props.form');
    if (!formRef) return;
    formRef.validateFieldsAndScroll((err, values) => {
      if (err) return;
      const { selectedKey, qcPlanProcesses } = this.state;
      const newQcPlanProcesses = updatePlanProcesses({
        qcPlanProcesses,
        selectedProcessId: this.selectedProcessId,
        selectedKey,
        fieldValues: values,
        newFlag: false,
        qcConfig: null,
      });
      this.setState({ qcPlanProcesses: newQcPlanProcesses, qcPlanProcess: qcPlanProcesses[selectedIndex] });
      this.selectedProcessCode = processCode;
      this.selectedProcessId = processId;
      this.showSelectQcConfigModal(processSeq, selectedIndex);
    });
  };

  showSelectQcConfigModal = (selectedSeq, selectedIndex) => {
    const { checkType } = this.props;
    const { changeChineseToLocale } = this.context;
    const { qcPlanProcesses } = this.state;
    const processInfo = _.find(qcPlanProcesses, o => o.id === this.selectedProcessId);
    const initialQcConfigDetails = processInfo ? processInfo.qcPlanProcessConfigs : [];

    const onOk = async selectedRows => {
      if (!arrayIsEmpty(selectedRows) && processInfo) {
        // 单选
        const qcConfig = selectedRows && selectedRows[0];
        const { id } = qcConfig;
        const innerQcConfig = {
          ...qcConfig,
          qcConfigId: id,
          key: `${this.selectedProcessId}-${id}`,
          processSeq: selectedSeq,
          processCode: this.selectedProcessCode,
        };
        await this.handleQcConfigTagClick(innerQcConfig, true, qcPlanProcesses[selectedIndex]);
      }
    };

    openModal(
      {
        title: changeChineseToLocale('选择质检方案'),
        footer: null,
        width: '60%',
        wrapClassName: 'importQcConfig',
        onOk,
        children: (
          <ImportQcConfigModal
            checkTypes={checkType}
            qcConfigDetails={initialQcConfigDetails}
            hideCreateButton
            rowSelectionType="radio"
          />
        ),
      },
      this.context,
    );
  };

  setOnDeleteConfigKey = onDeleteKey => {
    this.setState({ onDeleteKey });
  };

  showControlSettingModal = ({ id, noPassStatuses, controlLevel }) => {
    const innerContainerStyle = { paddingLeft: 60 };
    const { changeChineseToLocale } = this.context;

    const onOk = () => {
      const formRef = _.get(this.ControlSettingFormRef, 'props.form');
      formRef.validateFieldsAndScroll((err, values) => {
        if (err) return;

        const { noPassStatuses } = values || {};
        if (noPassStatusesEmpty(noPassStatuses)) {
          message.error(changeChineseToLocale('不通过状态集不能为空'));
          return;
        }

        const { qcPlanProcesses } = this.state;
        const _qcPlanProcesses = arrayIsEmpty(qcPlanProcesses)
          ? []
          : qcPlanProcesses.map(process => {
              const { id: qcPlanProcessId } = process;
              if (id === qcPlanProcessId) {
                return { ...process, ...values };
              }
              return process;
            });
        this.setState({ qcPlanProcesses: _qcPlanProcesses });
        this.props.form.setFieldsValue({ qcPlanProcesses: _qcPlanProcesses });
        closeModal();
      });
    };

    openModal({
      title: changeChineseToLocale('管控信息设置'),
      width: 660,
      innerContainerStyle,
      autoClose: false,
      children: (
        <ControlSettingForm
          data={{ noPassStatuses, controlLevel }}
          checkTypes={[this.props.checkType]}
          wrappedComponentRef={e => (this.ControlSettingFormRef = e)}
        />
      ),
      onOk,
    });
  };

  handleQcConfigTagDelete = (processId, onDeleteKey) => {
    const { qcPlanProcesses } = this.state;
    if (!arrayIsEmpty(qcPlanProcesses) && onDeleteKey) {
      const newQcPlanProcesses = qcPlanProcesses.map(process => {
        const { qcPlanProcessConfigs, id } = process;
        if (id === processId && !arrayIsEmpty(qcPlanProcessConfigs)) {
          const newQcPlanProcessConfigs = qcPlanProcessConfigs.filter(o => o.key !== onDeleteKey);
          return { ...process, qcPlanProcessConfigs: newQcPlanProcessConfigs };
        }
        return process;
      });
      this.setState(
        { qcPlanProcesses: newQcPlanProcesses, qcConfigData: null, selectedKey: null, onDeleteKey: null },
        () => {
          this.props.form.setFieldsValue({ qcPlanProcesses: this.state.qcPlanProcesses });
        },
      );
    }
  };

  getNoPassStatusDisplay = status => {
    switch (status) {
      case 'unStandardStatus':
        return unqualifiedQualityStatusMap[QUALITY_STATUS_UNQUALIFIED].name;
      case 'waitStatus':
        return unqualifiedQualityStatusMap[QUALITY_STATUS_AWAIT_CHECK].name;
      case 'temporaryControlStatus':
        return unqualifiedQualityStatusMap[QUALITY_STATUS_ON_HOLD].name;
      case 'asStandardStatus':
        return unqualifiedQualityStatusMap[QUALITY_STATUS_DEVIATION_QUALIFIED].name;
      default:
        break;
    }
  };

  getColumns = () => {
    const { editing, checkType } = this.props;
    const { changeChineseToLocale, changeChineseTemplateToLocale } = this.context;

    return [
      {
        title: changeChineseToLocale('序号'),
        dataIndex: 'processSeq',
        width: 80,
        render: (data, record) => data || replaceSign,
      },
      {
        title: changeChineseToLocale('工序名称'),
        dataIndex: 'processName',
        width: 100,
        render: (data, record) => data || replaceSign,
      },
      {
        title: changeChineseToLocale('物料编号/名称'),
        dataIndex: 'material',
        width: 180,
        render: (data, record) => {
          const { code, name } = data || {};
          return code ? <Tooltip text={`${code}/${name || replaceSign}`} length={18} /> : replaceSign;
        },
      },
      {
        title: changeChineseToLocale('数量'),
        dataIndex: 'plannedAmount',
        width: 100,
        render: (data, record) => {
          const unitName = _.get(record, 'material.unitName');
          return typeof data === 'number' ? `${thousandBitSeparator(data)} ${unitName || replaceSign}` : replaceSign;
        },
      },
      {
        title: changeChineseToLocale('管控程度'),
        dataIndex: 'controlLevel',
        key: 'controlLevel',
        width: 100,
        hidden: !editing || checkType !== FIRST_QUALITY_CONTROL,
        render: data => changeChineseToLocale(firstQcTaskControlLevelMap[data]) || replaceSign,
      },
      {
        title: changeChineseToLocale('不通过集合'),
        dataIndex: 'noPassStatuses',
        key: 'noPassStatuses',
        width: 150,
        hidden: !editing || checkType !== FIRST_QUALITY_CONTROL,
        render: data => {
          const filter = _.omitBy(data, o => _.isEqualWith(o, false) || _.isEqualWith(o, undefined));
          const display = Object.keys(filter).map(key => changeChineseToLocale(this.getNoPassStatusDisplay(key)));
          return !arrayIsEmpty(display) ? _.join(display, ' | ') : replaceSign;
        },
      },
      {
        title: changeChineseToLocale('质检方案'),
        dataIndex: 'qcPlanProcessConfigs',
        render: (data, record, index) => {
          const { processSeq, processCode, id } = record;
          const { selectedKey, onDeleteKey, qcPlanProcesses } = this.state;
          return (
            <div>
              <React.Fragment>
                {arrayIsEmpty(data)
                  ? null
                  : data.map(qcConfig => {
                      const { name, key } = qcConfig;
                      const title = changeChineseTemplateToLocale('确定删除{name}？', { name });
                      const tagClassName = classNames(
                        styles.qcPlan_qcConfig_tag,
                        selectedKey === key ? styles.qcPlan_qcConfig_tag_selected : null,
                      );

                      const onCancel = () => this.setOnDeleteConfigKey(null);
                      const onConfirm = () => this.handleQcConfigTagDelete(id, key);
                      const onClickConfig = async () => {
                        await this.handleQcConfigTagClick(qcConfig, false, qcPlanProcesses[index]);
                        this.selectedProcessId = id;
                        this.setState({ qcPlanProcess: qcPlanProcesses[index] });
                      };
                      const onRemove = () => this.setOnDeleteConfigKey(key);

                      return (
                        <Popconfirm
                          visible={key === onDeleteKey}
                          title={title}
                          autoAdjustOverflow
                          placement="topRight"
                          onCancel={onCancel}
                          onConfirm={onConfirm}
                        >
                          <Tag key={key} onClick={onClickConfig} className={tagClassName}>
                            {name}
                            <Icon onClick={onRemove} type="close" />
                          </Tag>
                        </Popconfirm>
                      );
                    })}
              </React.Fragment>
              <Tag
                key={`${id}-add-qcConfig`}
                onClick={() => this.onAddQcConfig({ processSeq, processCode, processId: id, selectedIndex: index })}
                className={classNames(styles.qcPlan_qcConfig_tag, styles.qcPlan_add_qcConfig_tag)}
              >
                <Icon type="plus" /> {changeChineseToLocale('新增质检方案')}
              </Tag>
            </div>
          );
        },
      },
      {
        title: changeChineseToLocale('操作'),
        dataIndex: 'action',
        key: 'action',
        hidden: !editing || checkType !== FIRST_QUALITY_CONTROL,
        width: 120,
        render: (data, record) => {
          const onClick = () => this.showControlSettingModal(record);
          return <Link onClick={onClick}>{changeChineseToLocale('管控信息设置')}</Link>;
        },
      },
    ].filter(x => x && !x.hidden);
  };

  render() {
    const columns = this.getColumns();
    const { loading, form, editing, customRuleList, ...rest } = this.props;
    const { selectedKey, qcConfigData, qcPlanProcesses, qcPlanProcess } = this.state;

    return (
      <div {...rest}>
        <Table
          style={{ maxWidth: 1440 }}
          loading={loading}
          className={styles.qc_plan_process_table}
          columns={columns}
          dataSource={qcPlanProcesses}
          scroll={arrayIsEmpty(qcPlanProcesses) ? {} : { y: 400 }}
          pagination={false}
        />
        <QcPlanQcConfigPanel
          editing={editing}
          wrappedComponentRef={e => (this.QcPlanQcConfigForm = e)}
          visible={selectedKey}
          qcConfigData={qcConfigData}
          selectedKey={selectedKey}
          customRuleList={customRuleList}
          qcPlanProcess={qcPlanProcess}
        />
      </div>
    );
  }
}

QcPlanProcessTable.contextTypes = {
  changeChineseToLocale: PropTypes.func,
  changeChineseTemplateToLocale: PropTypes.any,
};

export default QcPlanProcessTable;
