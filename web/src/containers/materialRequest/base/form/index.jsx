import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { message, Form, FormItem, withForm, DatePicker, Textarea } from 'src/components';
import { primary, alertYellow } from 'src/styles/color';
import moment from 'src/utils/time';
import { replaceSign } from 'src/constants';
import { getOrganizationConfigFromLocalStorage, ORGANIZATION_CONFIG } from 'src/utils/organizationConfig';
import { getStorageMaterialLastAmountMessage } from 'src/containers/materialRequest/utils';

import FirstStorageSelect from './firstStorageSelect';
import SecondStorageSelect from './secondeStorageSelect';
import MaterialList from './materialList';
import { findUseLogic } from '../../utils';

const INPUT_WIDTH = 300;

type Props = {
  form: any,
  projectCodes: [],
  initialValue: {},
  projects: [],
  isEdit: boolean,
};

class BaseForm extends Component {
  props: Props;
  state = {
    loading: false,
    requireTimeMessage: null, // 需求时间提示语
    storageAmountMessage: null, // 请求仓位中的物料剩余信息
  };

  componentDidMount() {
    this.setFormValue();
  }

  componentWillReceiveProps(nextProps) {
    if (
      !_.isEqual(nextProps.initialValue, this.props.initialValue) ||
      !_.isEqual(nextProps.projects, this.props.projects)
    ) {
      this.setFormValue(nextProps);
    }
  }

  setFormValue = props => {
    const { form, initialValue } = props || this.props;

    if (!initialValue.requireTime) {
      const _requireTime = this.getRequireTimeInitialValue(props);
      initialValue.requireTime = _requireTime;
      this.getRequireTimeMessage(_requireTime, props);
    }

    form.setFieldsValue(initialValue);
  };

  getFormValue = () => {
    let res = null;
    this.props.form.validateFieldsAndScroll((err, value) => {
      if (err) return;

      res = value;
    });

    const noError = this.materialListForm.wrappedInstance.validateForm();
    if (!noError) {
      message.error('物料列表填写错误');
      return;
    }

    const formatFormValue = value => {
      const { requireTime, sourceStorage, operation, transitStorage, materials, remark } = value || {};

      return {
        requireTime: requireTime ? Date.parse(requireTime) : null,
        sourceStorageId: sourceStorage ? sourceStorage.value.split('-')[1] : null,
        processorIds: Array.isArray(operation) ? operation.map(a => a.key) : null,
        transitStorageId: transitStorage ? transitStorage.value.split('-')[1] : null,
        requestItems: Array.isArray(materials)
          ? materials
              .map(a => {
                const { purchaseOrderCode, projectCode, material, occupyInfo, destination } = a || {};
                return {
                  purchaseOrderCode,
                  projectCode,
                  materialCode: material ? (material.materialCode ? material.materialCode : material.key) : null,
                  targetStorageId: destination ? destination.value.split('-')[1] : null,
                  occupyInfo,
                };
              })
              .filter(a => a.materialCode)
          : [],
        remark,
      };
    };

    return formatFormValue(res);
  };

  // disable今天之前的日期
  getDisableDate = current => {
    return (
      current &&
      current <
        moment()
          .subtract('day', 1)
          .endOf('day')
    );
  };

  // 获取项目需求时间的初始值
  getRequireTimeInitialValue = props => {
    // 获取项目中最早的开始时间
    const getEarlyStartTimePlannedInProjects = () => {
      const { projects } = props || this.props;
      let res;

      if (Array.isArray(projects)) {
        projects.forEach(a => {
          const { startTimePlanned } = a || {};
          if (!res) {
            res = startTimePlanned;
            return;
          }

          if (res && moment(startTimePlanned).isBefore(res)) {
            res = startTimePlanned;
          }
        });
      }

      // res是时间戳
      return res ? moment(res) : null;
    };

    const earlyTime = getEarlyStartTimePlannedInProjects();
    const today = moment();

    // 如果项目的最早开始时间早于当前日期，那么选择用当前日期
    if (earlyTime && moment(earlyTime).isBefore(today)) {
      return today;
    }
    return earlyTime;
  };

  // 获取需求时间的提示语
  getRequireTimeMessage = (value, props) => {
    const { projects } = props || this.props;

    const res = [];

    if (Array.isArray(projects)) {
      projects.forEach(a => {
        const { startTimePlanned, projectCode } = a || {};
        if (moment(value).isAfter(startTimePlanned)) {
          res.push(`已选择时间晚于项目${projectCode}的计划开始时间`);
        }
      });
    }

    this.setState({
      requireTimeMessage: Array.isArray(res) && res.length ? res.join(',') : null,
    });
  };

  // 获取物料请求类型工厂配置
  getMaterialRequestTypeConfig = () => {
    const config = getOrganizationConfigFromLocalStorage();

    return config && config[ORGANIZATION_CONFIG.materialRequestType]
      ? config[ORGANIZATION_CONFIG.materialRequestType].configValue
      : null;
  };

  // 从物料列表中获取物料和仓位的信息
  getMaterialInfoFromMaterialList = (v, extraStorageId) => {
    const { form } = this.props;
    let data = [];

    if (Array.isArray(v)) {
      v.forEach(i => {
        const { material, occupyInfo, unit } = i || {};
        const storageId =
          extraStorageId ||
          (form.getFieldValue('sourceStorage') ? form.getFieldValue('sourceStorage').value.split('-')[1] : null);
        const materialCode = material ? (material.materialCode ? material.materialCode : material.key) : null;

        if (Array.isArray(occupyInfo) && materialCode && storageId) {
          data = data.concat(
            occupyInfo.filter(i => i && i.amount && i.qcStatus).map(i => {
              return {
                materialCode,
                storageId,
                qcStatus: i.qcStatus,
                needAmount: i.amount,
                materialUnit: unit,
              };
            }),
          );
        }
      });
    }

    return data;
  };

  // 获取物料在请求仓位中的信息
  getStorageMaterialInfo = materialListData => {
    if (!Array.isArray(materialListData) || !materialListData.length) {
      this.setState({
        storageAmountMessage: null,
      });
      return;
    }

    const _data = Array.isArray(materialListData)
      ? materialListData.filter(i => i && i.materialCode && i.storageId && i.qcStatus).map(i => {
          const { qcStatus, storageId, materialCode } = i || {};
          return {
            materialCode,
            qcStatus,
            storageId,
          };
        })
      : [];

    const formatMessage = (materialListData, storageData) => {
      const messages = [];

      if (Array.isArray(materialListData)) {
        materialListData.forEach(i => {
          const { needAmount, materialCode, storageId, qcStatus, materialUnit } = i || {};
          const storagedMaterialInfo = storageData.find(
            k => k && k.materialCode === materialCode && k.storageId === Number(storageId) && k.qcStatus === qcStatus,
          );
          const _qcStauts = findUseLogic(qcStatus) ? findUseLogic(qcStatus).name : replaceSign;

          if (!storagedMaterialInfo) {
            messages.push(`请求仓位中不存在${_qcStauts}物料${materialCode}`);
          }
          if (storagedMaterialInfo && storagedMaterialInfo.amount < needAmount) {
            messages.push(
              `请求仓位中${_qcStauts}物料${materialCode}仅剩余${storagedMaterialInfo.amount}${materialUnit}`,
            );
          }
        });
      }

      return messages;
    };

    getStorageMaterialLastAmountMessage(_data).then(resData => {
      const messages = formatMessage(materialListData, resData);

      this.setState({ storageAmountMessage: Array.isArray(messages) ? _.uniq(messages).join(',') : null });
    });
  };

  render() {
    const { form, isEdit, initialValue } = this.props;
    const { requireTimeMessage } = this.state;
    const { getFieldDecorator } = form || {};

    const materialRequestType = this.getMaterialRequestTypeConfig();

    return (
      <Form>
        {isEdit ? (
          <FormItem label={'物料编号'}>{initialValue && initialValue.code ? initialValue.code : replaceSign}</FormItem>
        ) : null}
        <FormItem label={'需求时间'}>
          {getFieldDecorator('requireTime', {
            onChange: value => {
              this.getRequireTimeMessage(value);
            },
          })(
            <DatePicker
              disabledDate={this.getDisableDate} // 最早可以选择当天
              style={{ width: INPUT_WIDTH }}
            />,
          )}
          <div style={{ color: alertYellow, lineHeight: '16px' }}>{requireTimeMessage || null}</div>
        </FormItem>
        <FormItem label={'请求仓位'}>
          {getFieldDecorator('sourceStorage', {
            rules: [
              {
                required: true,
                message: '请求仓位必填',
              },
            ],
            onChange: v => {
              const materialList = form.getFieldValue('materials');
              const storageId = v && v.value ? v.value.split('-')[1] : null;
              const materialListData = this.getMaterialInfoFromMaterialList(materialList, storageId);

              this.getStorageMaterialInfo(materialListData);
            },
          })(<FirstStorageSelect inputStyle={{ width: INPUT_WIDTH }} style={{ display: 'inline-block' }} />)}
          <span
            style={{ color: primary, marginLeft: 10, cursor: 'pointer' }}
            onClick={() => {
              const sourceStorage = form.getFieldValue('sourceStorage');
              const { value, label } = sourceStorage || {};
              const query = JSON.stringify({
                firstStorageId: value ? value.split('-')[1] : null,
                firstStorageName: label,
              });
              window.open(`/stock/inventory?query=${encodeURIComponent(query)}`);
            }}
          >
            查看库存
          </span>
        </FormItem>
        {materialRequestType && materialRequestType !== '2' ? null : (
          <FormItem label={'中转仓位'}>
            {getFieldDecorator('transitStorage', {
              rules: [
                {
                  required: true,
                  message: '中转仓位必填',
                },
              ],
            })(<SecondStorageSelect style={{ width: INPUT_WIDTH }} />)}
          </FormItem>
        )}
        <FormItem label={'物料列表'}>
          {getFieldDecorator('materials', {
            rules: [
              {
                required: true,
                message: '物料列表必填',
              },
            ],
            onChange: v => {
              const data = this.getMaterialInfoFromMaterialList(v);
              this.getStorageMaterialInfo(data);
            },
          })(
            <MaterialList
              isEdit={isEdit}
              sourceStorageId={this.state.sourceStorageId}
              wrappedComponentRef={inst => (this.materialListForm = inst)}
            />,
          )}
          <span style={{ color: alertYellow }}>{this.state.storageAmountMessage || null}</span>
        </FormItem>
        <FormItem label={'备注'}>
          {getFieldDecorator('remark')(<Textarea style={{ height: 120, width: INPUT_WIDTH }} maxLength={100} />)}
        </FormItem>
      </Form>
    );
  }
}

BaseForm.contextTypes = {
  router: PropTypes.any,
};

export default withForm({}, BaseForm);
