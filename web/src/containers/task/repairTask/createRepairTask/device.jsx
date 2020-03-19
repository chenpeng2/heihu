import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Radio } from 'antd';
import {
  withForm,
  FormItem,
  Attachment,
  Textarea,
  Button,
  Input,
  Form,
  DatePicker,
  Select,
  Searchselect,
  message,
  Spin,
  Link,
  openModal,
  Tooltip,
} from 'components';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'src/utils/locale/utils';
import { addRepairTask } from 'src/services/equipmentMaintenance/repairTask';
import {
  getEquipmentCategoryDetail,
  getMouldCategoryDetail,
  getValidDeviceList,
} from 'src/services/equipmentMaintenance/base';
import CreateFaultCause from 'src/views/knowledgeManagement/equipmentModeling/faultCauses/create';
import { getRepairTaskListUrl } from 'src/views/equipmentMaintenance/repairTask/utils';
import { warnConfig } from '../../base/config';
import styles from '../styles.scss';

type Props = {
  form: any,
  intl: any,
  match: any,
  location: any,
};

const RadioGroup = Radio.Group;
const inputWidth = 300;

class CreateRepairTaskByDevice extends Component {
  props: Props;
  state = {
    stop: false,
    selectedFaultCause: [],
    equipmentType: '',
    validDeviceList: [],
    targetType: 'equipment',
    loading: false,
  };

  componentWillMount() {
    this.fetchDeviceData();
  }

  componentDidMount() {
    const {
      location: { query },
      form,
    } = this.props;
    const { setFieldsValue } = form;
    if (query.targetId) {
      const { targetType, targetName, targetId, categoryId } = query;
      this.setState({ equipmentType: targetType, targetId });
      this.fetchDeviceCategory(
        categoryId,
        targetType === 'mould' ? getMouldCategoryDetail : getEquipmentCategoryDetail,
      );
      setFieldsValue({
        targetType: targetType === 'mould' ? 'mould' : 'equipment',
        targetId: { key: targetId, label: targetName },
      });
    }
  }

  fetchCategoryDetail = (id, func) => {
    const { form } = this.props;
    const { setFieldsValue } = form;
    func(id).then(res => {
      const { repairTaskConfig, id, name, resourceCategory } = res.data.data;
      const _repairTaskConfig = _.cloneDeep(repairTaskConfig);
      const warnConfigLabel = warnConfig.filter(n => n.key === _repairTaskConfig.warnConfig)[0].label;
      _repairTaskConfig.warnConfig = {
        key: _repairTaskConfig.warnConfig,
        label: warnConfigLabel,
      };
      _repairTaskConfig.reportTemplateId = {
        key: _repairTaskConfig.reportTemplate.id,
        label: _repairTaskConfig.reportTemplate.name,
      };
      this.setState({ stop: _repairTaskConfig.stop, category: { key: id, label: name, type: resourceCategory } });
      setFieldsValue(_repairTaskConfig);
    });
  };

  fetchDeviceData = () => {
    getValidDeviceList({ searchType: 'equipment' }).then(res => {
      const selectData = res.data.data.map(({ name, id, category, code }) => ({
        key: `${id};${category.type};${category.id}`,
        label: `${name} (编码${code})`,
      }));
      this.setState({ validDeviceList: selectData });
    });
  };

  fetchDeviceCategory = (value, func) => {
    if (!value) return null;
    this.fetchCategoryDetail(value.key ? value.key.split(';')[2] : value, func);
  };

  getButton = () => (
    <div style={{ margin: '26px 0 100px 160px' }}>
      <Button style={{ width: 114, height: 32 }} type="primary" onClick={this.submit} disabled={this.state.loading}>
        保存
      </Button>
    </div>
  );

  submit = () => {
    const { form } = this.props;
    const { getFieldsValue } = form;
    const value = getFieldsValue();
    const variables = {};
    const labelInValue = ['reportTemplateId', 'warnConfig'];
    Object.keys(value).forEach(prop => {
      if (value[prop] || value[prop] === false) {
        switch (prop) {
          case 'faultCauses':
            variables.faultReason = value.faultCauses.map(n => parseInt(n.key, 10));
            break;
          case 'deadline':
            variables.deadline = Date.parse(value.deadline);
            break;
          case 'attachments':
            variables.attachments = value.attachments.map(n => n.restId);
            break;
          case 'targetId':
            variables.targetId = parseInt(value.targetId.key.split(';')[0], 10);
            break;
          case 'operatorId': {
            variables.executors = value.operatorId.map(n => ({
              executorType: n.key.split(':')[0] === 'user' ? 1 : 2,
              executorId: n.key.split(':')[1],
            }));
            break;
          }
          default: {
            if (labelInValue.indexOf(prop) !== -1) {
              variables[prop] = value[prop].key;
            } else {
              variables[prop] = value[prop];
            }
          }
        }
      }
    });
    variables.targetType = this.state.equipmentType;
    this.setState({ loading: true });
    addRepairTask(variables)
      .then(() => {
        message.success('创建维修任务成功');
        this.context.router.history.push(getRepairTaskListUrl(1));
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  onChange = e => {
    this.setState({
      stop: e.target.checked,
    });
  };

  handleSearch = async search => {
    const { targetType } = this.state;
    getValidDeviceList({ searchContent: search, searchType: targetType }).then(res => {
      const selectData = res.data.data.map(({ name, id, category, code }) => ({
        key: `${id};${category.type};${category.id}`,
        label: `${name} (编码${code})`,
      }));
      this.setState({ validDeviceList: selectData });
    });
  };

  render() {
    const {
      form,
      location: { query },
      intl,
      match,
    } = this.props;
    const { validDeviceList, category } = this.state;
    const { getFieldDecorator, setFieldsValue, getFieldValue } = form;
    const planOperatorAuth = 'APP_PERFORM_REPAIR_TASK';

    return (
      <Spin spinning={this.state.loading}>
        <div className={styles.createRepairTask}>
          <div style={{ margin: '20px 0 30px 20px', fontSize: 16 }}>{changeChineseToLocale('创建维修任务', intl)}</div>
          <div style={{ marginLeft: 40 }}>
            <Form>
              <FormItem label="目标">
                {getFieldDecorator('targetId', {
                  rules: [{ required: true, message: changeChineseToLocale('请输入名称或编码', intl) }],
                })(
                  <Select
                    style={{ width: inputWidth }}
                    onSearch={this.handleSearch}
                    placeholder={changeChineseToLocale('请输入名称或编码搜索并选择', intl)}
                    key="operator"
                    filterOption={false}
                    labelInValue
                    allowClear={false}
                    disabled={!!query.targetId}
                    onSelect={value => {
                      const equipmentType = value.key.split(';')[1];
                      const targetId = value.key.split(';')[0];
                      this.setState({ equipmentType, targetId });
                      this.fetchDeviceCategory(
                        value,
                        equipmentType === 'mould' ? getMouldCategoryDetail : getEquipmentCategoryDetail,
                      );
                    }}
                  >
                    {validDeviceList.map(({ key, label }) => (
                      <Select.Option key={key} value={key}>
                        {label}
                      </Select.Option>
                    ))}
                  </Select>,
                )}
              </FormItem>
              <FormItem label="故障原因">
                {getFieldDecorator('faultCauses', {
                  rules: [{ required: true, message: changeChineseToLocale('请选择故障原因', intl) }],
                  normalize: value => {
                    if (value && value.length > 5) {
                      return value.splice(0, 5);
                    }
                    return value;
                  },
                })(
                  <Searchselect
                    mode={'multiple'}
                    style={{ width: inputWidth }}
                    disabled={!this.state.targetId}
                    placeholder="请选择"
                    type={'faultCase'}
                    params={{ targetType: this.state.equipmentType || 'equipmentProd', targetId: this.state.targetId }}
                    key="faultCase"
                    loadOnFocus
                    notFoundContent={
                      <div
                        style={{ color: '#9B9B9B', borderRadius: '0 0 2px 2px', display: 'flex', alignItems: 'center' }}
                      >
                        <Tooltip text={changeChineseToLocale('未找到对应适用范围', intl)} width={150} />，
                        <Link
                          onClick={() => {
                            openModal({
                              title: '新增故障原因',
                              children: (
                                <CreateFaultCause
                                  match={match}
                                  parentId={0}
                                  isCommonUse
                                  refetch={(value, faultCauses) => {
                                    const oldfFultCauses = getFieldValue('faultCauses') || [];
                                    const { id, code, name } = faultCauses;
                                    setFieldsValue({
                                      faultCauses: oldfFultCauses.concat([
                                        { key: String(id), label: `${code}(名称：${name})` },
                                      ]),
                                    });
                                  }}
                                  // initialValue={{ category: [category] }}
                                />
                              ),
                              footer: null,
                            });
                          }}
                        >
                          现在创建
                        </Link>
                      </div>
                    }
                  />,
                )}
              </FormItem>
              <FormItem label="任务标题">
                {getFieldDecorator('title', {
                  rules: [
                    { required: true, message: changeChineseToLocale('请输入任务标题', intl) },
                    { max: 60, message: changeChineseToLocale('任务标题长度不能超过60个字', intl) },
                    { min: 3, message: changeChineseToLocale('任务标题长度不能少于3个字', intl) },
                  ],
                })(<Input style={{ width: inputWidth }} min={3} max={60} placeholder={'请简要描述任务内容'} />)}
              </FormItem>
              <FormItem label={'任务详情'}>
                {getFieldDecorator('detail')(
                  <Textarea
                    maxLength={200}
                    placeholder={'如果有需要，请描述详细任务内容'}
                    style={{ width: inputWidth, height: 100 }}
                  />,
                )}
              </FormItem>
              <FormItem label={'计划执行人'}>
                {getFieldDecorator('operatorId', {
                  rules: [{ required: true, message: changeChineseToLocale('请选择执行人', intl) }],
                })(
                  <Searchselect
                    allowClear={false}
                    style={{ width: inputWidth }}
                    placeholder="请选择执行人"
                    type={'userAndWorkgroup'}
                    params={{ authorities: planOperatorAuth }}
                    mode={'multiple'}
                    key="operator"
                  />,
                )}
              </FormItem>
              <FormItem label="截止时间">
                {getFieldDecorator('deadline', {
                  rules: [{ required: true, message: changeChineseToLocale('请选择截止时间', intl) }],
                })(
                  <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" allowClear={false} style={{ width: inputWidth }} />,
                )}
              </FormItem>
              <FormItem label="相关图片">
                {getFieldDecorator('attachments', {})(<Attachment max={5} limit={'image'} />)}
              </FormItem>
              <FormItem label="扫码确认">
                {getFieldDecorator('scan', {
                  rules: [{ required: true, message: changeChineseToLocale('请选择', intl) }],
                })(
                  <RadioGroup
                    options={[
                      { label: changeChineseToLocale('是', intl), value: true },
                      { label: changeChineseToLocale('否', intl), value: false },
                    ]}
                  />,
                )}
              </FormItem>
              <FormItem label="任务提醒">
                {getFieldDecorator('warnConfig', {
                  rules: [{ required: true, message: changeChineseToLocale('请选择', intl) }],
                })(
                  <Select
                    placeholder={changeChineseToLocale('请选择', intl)}
                    labelInValue
                    style={{ width: inputWidth }}
                  >
                    {warnConfig.map(n => (
                      <Select.Option key={n.key} value={n.key}>
                        {changeChineseToLocale(n.label, intl)}
                      </Select.Option>
                    ))}
                  </Select>,
                )}
              </FormItem>
              <FormItem label="报告模板">
                {getFieldDecorator('reportTemplateId', {
                  rules: [{ required: true, message: changeChineseToLocale('请选择', intl) }],
                })(
                  <Searchselect
                    allowClear={false}
                    style={{ width: inputWidth }}
                    placeholder="请选择报告模板"
                    type={'reportTemplate'}
                    key="reportTemplate"
                  />,
                )}
              </FormItem>
            </Form>
          </div>
          {this.getButton()}
        </div>
      </Spin>
    );
  }
}

CreateRepairTaskByDevice.contextTypes = {
  router: PropTypes.object.isRequired,
};

const CreateRepairTaskByDeviceForm = withForm({ showFooter: false }, CreateRepairTaskByDevice);

export default withRouter(injectIntl(CreateRepairTaskByDeviceForm));
