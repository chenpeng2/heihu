import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
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
  Checkbox,
} from 'components';
import moment from 'utils/time';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';
import { fontSub } from 'src/styles/color/index';
import { getMaintenanceTaskDetail } from 'src/services/equipmentMaintenance/maintenanceTask';
import {
  UpdateTaskByStrategy,
  getEquipmentCategoryDetail,
  getMouldCategoryDetail,
  getValidDeviceList,
} from 'src/services/equipmentMaintenance/base';
import { warnConfig } from '../base/config';
import styles from './styles.scss';

type Props = {
  form: any,
  intl: any,
  type: string,
  taskCode: string,
  query: {},
};

const confirmStyle = {
  color: fontSub,
  lineHeight: '18px',
  marginTop: -16,
  marginLeft: 120,
};
const Option = Select.Option;
const inputWidth = 300;

class Base extends Component {
  props: Props;
  state = {
    stop: false,
    strategy: {},
    entity: {},
    equipmentType: '',
    validDeviceList: [],
    actionPlan: 'single',
    targetType: 'equipment',
    loading: false,
  };

  componentWillMount() {
    const { type } = this.props;
    this.fetchDeviceData();
    if (type === '编辑') {
      this.fetchAndSetInitialValue();
    }
  }

  componentDidMount() {
    const { query, form } = this.props;
    const { setFieldsValue } = form;
    if (query && query.targetId) {
      const { targetType, targetName, targetId, categoryId } = query;
      this.setState({ equipmentType: targetType });
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
      const { maintainTaskConfig } = res.data.data;
      const _maintainTaskConfig = _.cloneDeep(maintainTaskConfig);
      const warnConfigLabel = warnConfig.filter(n => n.key === _maintainTaskConfig.warnConfig)[0].label;
      _maintainTaskConfig.warnConfig = {
        key: _maintainTaskConfig.warnConfig,
        label: warnConfigLabel,
      };
      _maintainTaskConfig.reportTemplateId = {
        key: _maintainTaskConfig.reportTemplate.id,
        label: _maintainTaskConfig.reportTemplate.name,
      };
      this.setState({ stop: _maintainTaskConfig.stop });
      setFieldsValue(_maintainTaskConfig);
    });
  };

  fetchDeviceData = () => {
    const { intl } = this.props;
    getValidDeviceList({ searchType: 'equipment' }).then(res => {
      const selectData = res.data.data.map(({ name, id, category, code }) => ({
        key: `${id};${category.type};${category.id}`,
        label: `${name} (${changeChineseToLocale('编码', intl)} ${code})`,
      }));
      this.setState({ validDeviceList: selectData });
    });
  };

  fetchDeviceCategory = (value, func) => {
    this.fetchCategoryDetail(value.key ? value.key.split(';')[2] : value, func);
  };

  getButton = router => (
    <div style={{ margin: '26px 0 100px 160px' }}>
      <Button style={{ width: 114, height: 32 }} type="primary" onClick={this.submit} disabled={this.state.loading}>
        保存
      </Button>
    </div>
  );

  fetchAndSetInitialValue = () => {
    const { taskCode, form, intl } = this.props;
    const { setFieldsValue } = form;
    getMaintenanceTaskDetail(taskCode).then(res => {
      const {
        data: { entity, target, taskConfig, strategy },
      } = res.data;
      const { title, detail, deadline, executors, attachments } = entity;
      const { scan, stop, reportTemplate } = taskConfig;
      const { name, id, category, code } = target;
      this.setState({ entity, equipmentType: category.type, stop, strategy });
      const initialValue = {
        title,
        detail,
        scan,
        executors: executors.map(n => ({
          key: `${n.executorType === 1 ? 'user:' : 'workgroup:'}${n.executorId}`,
          label: n.executorName,
        })),
        deadline: moment(Number(deadline)),
        targetId: {
          key: `${id};${category.type}`,
          label: `${name} (${changeChineseToLocale('编码', intl)} ${code})`,
        },
        attachments: (attachments && attachments.map(n => ({ id: n.id, originalFileName: n.original_filename }))) || [],
        reportTemplateId: {
          key: reportTemplate.id,
          label: reportTemplate.name,
        },
      };
      setFieldsValue(initialValue);
    });
  };

  submit = () => {
    const { form, taskCode } = this.props;
    const { getFieldsValue } = form;
    const value = getFieldsValue();
    const variables = {};
    Object.keys(value).forEach(prop => {
      if (value[prop] || value[prop] === false) {
        switch (prop) {
          case 'deadline':
            variables.deadline = Date.parse(value.deadline);
            break;
          case 'attachments':
            variables.attachments = value.attachments.map(n => n.restId);
            break;
          case 'executors':
            variables[prop] = value[prop].map(n => ({
              executorType: n.key.split(':')[0] === 'user' ? 1 : 2,
              executorId: n.key.split(':')[1],
            }));
            break;
          case 'reportTemplateId':
            variables[prop] = value[prop].key;
            break;
          default:
            variables[prop] = value[prop];
        }
      }
    });
    variables.targetType = this.state.equipmentType;
    this.setState({ loading: true });
    UpdateTaskByStrategy(taskCode, variables)
      .then(() => {
        message.success('编辑保养任务成功');
        this.setState({ loading: false });
        this.context.router.history.push('/equipmentMaintenance/maintenanceTask');
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
    const { intl } = this.props;
    const { targetType } = this.state;
    getValidDeviceList({ searchContent: search, searchType: targetType }).then(res => {
      const selectData = res.data.data.map(({ name, id, category, code }) => ({
        key: `${id};${category.type};${category.id}`,
        label: `${name} (${changeChineseToLocale('编码', intl)} ${code})`,
      }));
      this.setState({ validDeviceList: selectData });
    });
  };

  range = (start, end) => {
    const result = [];
    for (let i = start; i < end; i += 1) {
      result.push(i);
    }
    return result;
  };

  getDisabledTime = () => {
    const { entity, strategy } = this.state;
    const { startTime } = entity;
    const { taskPlanLaborHour } = strategy;
    const disabledTime = moment(startTime).add(taskPlanLaborHour, 'hours');
    return {
      disabledHours: () => this.range(0, 24).splice(0, moment(disabledTime).hour()),
      disabledMinutes: () => this.range(0, 60).splice(0, moment(disabledTime).minute() + 1),
    };
  };

  getDisabledDate = current => {
    const { entity, strategy } = this.state;
    const { startTime } = entity;
    const { taskPlanLaborHour } = strategy;
    const disabledTime = moment(startTime).add(taskPlanLaborHour, 'hours');
    return current && moment(current).endOf('day') < moment(disabledTime).endOf('day');
  };

  render() {
    const { form, type, query, intl } = this.props;
    const { strategy } = this.state;
    const { getFieldDecorator } = form;
    const { router } = this.context;
    const planOperatorAuth = 'APP_PERFORM_MAINTAIN_TASK';

    return (
      <Spin spinning={this.state.loading}>
        <div className={styles.base}>
          <div style={{ margin: '20px 0 30px 20px', fontSize: 16 }}>
            {changeChineseToLocale(`${type}保养任务`, intl)}
          </div>
          <div style={{ marginLeft: 40 }}>
            <Form>
              <FormItem label="目标">
                {getFieldDecorator('targetId', {
                  rules: [{ required: true, message: '请输入名称或编码' }],
                })(
                  <Select
                    disabled={type === '编辑' || !!query.targetId}
                    onSearch={this.handleSearch}
                    style={{ width: inputWidth }}
                    placeholder={changeChineseToLocale('请输入名称或编码搜索并选择', intl)}
                    type={'target'}
                    key="operator"
                    labelInValue
                  >
                    {this.state.validDeviceList.map(({ key, label }) => (
                      <Select.Option key={key} value={key}>
                        {label}
                      </Select.Option>
                    ))}
                  </Select>,
                )}
              </FormItem>
              <FormItem label="任务标题">
                {getFieldDecorator('title', {
                  rules: [
                    { required: true, message: '请输入任务标题' },
                    { max: 60, message: '任务标题长度不能超过60个字' },
                    { min: 3, message: '任务标题长度不能少于3个字' },
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
                {getFieldDecorator('executors', {
                  rules: [{ required: true, message: '请选择执行人' }],
                })(
                  <Searchselect
                    mode={'multiple'}
                    allowClear={false}
                    style={{ width: inputWidth }}
                    placeholder="请选择执行人"
                    type={'userAndWorkgroup'}
                    params={{ authorities: planOperatorAuth }}
                    key="operator"
                  />,
                )}
              </FormItem>
              <FormItem label="计划结束时间">
                {getFieldDecorator('deadline', {
                  rules: [{ required: true, message: '请选择截止时间' }],
                })(
                  <DatePicker
                    showTime
                    allowClear={false}
                    style={{ width: inputWidth }}
                    disabledTime={this.getDisabledTime}
                    disabledDate={this.getDisabledDate}
                    format="YYYY-MM-DD HH:mm:ss"
                  />,
                )}
              </FormItem>
              <FormItem label="报告模板">
                {getFieldDecorator('reportTemplateId', {
                  rules: [{ required: true, message: '请选择' }],
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
              <FormItem label="相关图片">
                {getFieldDecorator('attachments', {})(<Attachment max={5} limit={'image'} />)}
              </FormItem>
              <FormItem label="扫码确认">
                {getFieldDecorator('scan', {
                  valuePropName: 'checked',
                })(<Checkbox>开启</Checkbox>)}
              </FormItem>
              <div style={confirmStyle}>
                {changeChineseToLocale('勾选后，维护任务操作人需要现场扫描设备电子标签，才能开始执行', intl)}
              </div>
              <FormItem label="完成验收">
                {getFieldDecorator('acceptanceCheck', {
                  valuePropName: 'checked',
                })(<Checkbox>开启</Checkbox>)}
              </FormItem>
              <div style={{ ...confirmStyle, marginBottom: 10 }}>
                {changeChineseToLocale('勾选后，任务完成后，需要其他相关人员对执行效果进行验收', intl)}
              </div>
              <FormItem label="维护策略">
                {getFieldDecorator('strategy', {
                  initialValue: strategy.strategyTitle,
                })(
                  <Select style={{ width: inputWidth }} disabled>
                    <Option value={strategy.strategyTitle}>{strategy.strategyTitle}</Option>
                  </Select>,
                )}
              </FormItem>
            </Form>
          </div>
          {this.getButton(router)}
        </div>
      </Spin>
    );
  }
}

Base.contextTypes = {
  router: PropTypes.object.isRequired,
};

const BaseForm = withForm({ showFooter: false }, Base);

export default injectIntl(BaseForm);
