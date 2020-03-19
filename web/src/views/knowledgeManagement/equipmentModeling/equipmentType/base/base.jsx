import * as React from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getOrganizationConfigFromLocalStorage } from 'utils/organizationConfig';
import { withForm, FormItem, Input, Radio, Checkbox, Select } from 'components';
import { nullCharacterVerification } from 'components/form';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';
import { queryReportTemplateList } from 'src/services/knowledgeBase/equipment';
import { warning } from 'src/styles/color';
import { EQUIPMENT_TYPE_CATEGORY } from 'src/views/equipmentMaintenance/constants';
import CleanConfigInput from './cleanConfigInput';
import DeviceProp from './deviceProp';
import StrategyConfig from './strategyConfig';
import { remindGroup } from '../constants';
import styles from './styles.scss';

const RadioGroup = Radio.Group;
const Option = Select.Option;

type propsType = {
  router: any,
  form: any,
  intl: any,
  params: {},
  formData: {},
  deviceMetrics: any,
  taskStrategies: any,
  submit: () => {},
  handleStrategySubmit: () => {},
  title: String,
};

class EquipmentTypeBase extends React.Component<propsType> {
  state = {
    reportTemplates: [],
    deviceMetricIds: [],
    equipmentCleanStatus: null,
    resourceCategory: null,
  };

  componentWillMount() {
    const config = getOrganizationConfigFromLocalStorage();
    const equipmentCleanStatus = config.config_equipment_clean_status.configValue;
    const deviceCalibration = config.config_device_calibration.configValue;
    this.setState({ equipmentCleanStatus, deviceCalibration });
  }

  componentDidMount = () => {
    this.fetchReportTemplates();
  };

  componentWillReceiveProps(nextProps) {
    const { deviceMetrics, formData } = nextProps;
    const { deviceMetricIds } = this.state;
    if (formData && formData.resourceCategory && deviceMetrics && deviceMetrics.length && !deviceMetricIds.length) {
      this.setState({ deviceMetricIds: deviceMetrics.map(n => `${n.id}`) });
    }
  }

  fetchReportTemplates = async () => {
    const {
      data: { total },
    } = await queryReportTemplateList({ page: 1, size: 10 });
    const {
      data: { data },
    } = await queryReportTemplateList({ page: 1, size: total });
    this.setState({ reportTemplates: data });
  };

  render() {
    const { form, formData, title, handleStrategySubmit, deviceMetrics, taskStrategies, intl } = this.props;
    if (title.indexOf('编辑') !== -1) {
      if (!formData.resourceCategory) return null;
    }
    const { getFieldDecorator } = form;
    const { reportTemplates, resourceCategory, equipmentCleanStatus, deviceCalibration, deviceMetricIds } = this.state;
    return (
      <div className={styles.baseEquipmentType}>
        <div className={styles.baseSetting}>
          <div className={styles.baseHeaders}>{changeChineseToLocale(title, intl)}</div>
          <FormItem label="设备类型名称" required>
            {getFieldDecorator('name', {
              rules: [
                { required: true, message: changeChineseToLocale('请输入设备类型名称', intl) },
                { max: 20, message: changeChineseToLocale('最多可输入20个字符', intl) },
                { validator: nullCharacterVerification(changeChineseToLocale('设备类型名称', intl)) },
              ],
              initialValue: formData && formData.name,
            })(<Input placeholder={'最多20个字符'} style={{ width: 300 }} />)}
          </FormItem>
          <FormItem label="资源类别" className="resourceCategory">
            {getFieldDecorator('resourceCategory', {
              rules: [{ required: true, message: changeChineseToLocale('请选择设备资源类别', intl) }],
              initialValue: formData && formData.resourceCategory,
            })(
              <RadioGroup
                className={styles.resourceCategory}
                disabled={formData && formData.resourceCategory}
                onChange={e => {
                  this.setState({ resourceCategory: e.target.value });
                }}
                options={Object.keys(EQUIPMENT_TYPE_CATEGORY).map(prop => ({
                  label: changeChineseToLocale(EQUIPMENT_TYPE_CATEGORY[prop], intl),
                  value: prop,
                }))}
              />,
            )}
          </FormItem>
          <FormItem label="模具绑定" help="勾选后，设备可绑定模具" validateStatus="warning">
            {getFieldDecorator('mouldBind', {
              valuePropName: 'checked',
              initialValue: formData && formData.mouldBind,
            })(<Checkbox>开启</Checkbox>)}
          </FormItem>
          <FormItem label="设备读数">
            <DeviceProp
              handleSelect={(deviceMetric, type, index) => {
                if (deviceMetric) {
                  if (type === 'add') {
                    deviceMetricIds[index - 1] = deviceMetric;
                  } else {
                    deviceMetricIds.splice(index - 1, 1);
                  }
                }
                this.setState({ deviceMetricIds });
              }}
              data={deviceMetrics}
              taskStrategies={taskStrategies}
              action={deviceMetrics && deviceMetrics.length ? 'edit' : 'create'}
              form={form}
            />
          </FormItem>
        </div>
        {equipmentCleanStatus === 'true' &&
        (resourceCategory || (formData && formData.resourceCategory)) === 'equipmentProd' ? (
          <div className={styles.baseSetting}>
            <div className={styles.baseHeaders}>{changeChineseToLocale('设备清洁', intl)}</div>
            <FormItem
              label="清洁管理"
              className="resourceCategory"
              validateStatus="warning"
              help="勾选后，系统会对该设备类型设备的清洁操作进行记录、管理和控制"
            >
              {getFieldDecorator('cleanOpen')(
                <Checkbox defaultChecked={(formData && formData.cleanConfig.open) || false}>开启</Checkbox>,
              )}
            </FormItem>
            <FormItem label="清洁效期">
              {getFieldDecorator('cleanValidPeriod', {
                initialValue: {
                  validPeriod: _.get(formData, 'cleanConfig.validPeriod', undefined) || 0,
                  validPeriodUnit: _.get(formData, 'cleanConfig.validPeriodUnit', undefined) || 'h',
                },
                rules: [
                  {
                    validator: (rule, value, callback) => {
                      const reg = /^[0-9]*$/g;
                      if (!reg.test(value.validPeriod)) {
                        callback(changeChineseToLocale('必须为正整数', intl));
                      }
                      callback();
                    },
                  },
                ],
              })(<CleanConfigInput />)}
            </FormItem>
            <div style={{ marginLeft: 120, color: warning, marginTop: -7 }}>
              {changeChineseToLocale('如果该清洁无需进行效期控制，则填写0', intl)}
            </div>
          </div>
        ) : null}
        {deviceCalibration === 'true' &&
        (resourceCategory || (formData && formData.resourceCategory)) === 'equipmentProd' ? (
          <div className={styles.baseSetting}>
            <div className={styles.baseHeaders}>{changeChineseToLocale('设备效期', intl)}</div>
            <FormItem label="效期管理">
              {getFieldDecorator('calibrationConfig', {
                valuePropName: 'checked',
                initialValue: _.get(formData, 'calibrationConfig', true),
              })(<Checkbox>开启</Checkbox>)}
            </FormItem>
          </div>
        ) : null}
        <div className={styles.baseSetting}>
          <div className={styles.baseHeaders}>{changeChineseToLocale('维护策略', intl)}</div>
          <FormItem label="策略配置">
            <StrategyConfig
              type={taskStrategies && taskStrategies.length ? 'edit' : 'create'}
              deviceMetricIds={deviceMetricIds}
              data={taskStrategies}
              handleStrategySubmit={handleStrategySubmit}
            />
          </FormItem>
        </div>
        <div className={styles.baseSetting}>
          <div className={styles.baseHeaders}>{changeChineseToLocale('维修任务配置', intl)}</div>
          <FormItem
            label="扫码确定"
            help="勾选后，维修任务操作人需要现场扫描电子标签，才能开始执行"
            validateStatus="warning"
          >
            {getFieldDecorator('repairScan', {
              valuePropName: 'checked',
              initialValue: _.get(formData, 'repairTaskConfig.scan', undefined),
            })(<Checkbox>开启</Checkbox>)}
          </FormItem>
          <FormItem label="报告模板" required>
            {getFieldDecorator('repairReportTemplate', {
              rules: [{ required: true, message: changeChineseToLocale('请选择报告模板', intl) }],
              initialValue: _.get(formData, 'repairTaskConfig.reportTemplate.id', undefined) && {
                key: formData.repairTaskConfig.reportTemplate.id,
                name: formData.repairTaskConfig.reportTemplate.id,
              },
            })(
              <Select placeholder={changeChineseToLocale('请选择报告模板', intl)} style={{ width: 300 }} labelInValue>
                {reportTemplates &&
                  reportTemplates.map(({ id, name }) => (
                    <Option key={id} value={id}>
                      {name}
                    </Option>
                  ))}
              </Select>,
            )}
          </FormItem>
          <FormItem label="提醒设置">
            {getFieldDecorator('repairWarnConfig', {
              initialValue: (_.get(formData, 'repairTaskConfig.warnConfig', undefined) && {
                key: formData.repairTaskConfig.warnConfig,
                label: formData.repairTaskConfig.warnConfigDisplay,
              }) || { key: '0', label: '不提醒' },
            })(
              <Select style={{ width: 300 }} labelInValue>
                {remindGroup.map(({ key, label }) => (
                  <Option key={key} value={key}>
                    {changeChineseToLocale(label, intl)}
                  </Option>
                ))}
              </Select>,
            )}
          </FormItem>
          <FormItem
            label="完成验收"
            help="勾选后，任务完成后，需要其他相关人员对执行效果进行验收"
            validateStatus="warning"
          >
            {getFieldDecorator('acceptanceCheck', {
              valuePropName: 'checked',
              initialValue: _.get(formData, 'repairTaskConfig.acceptanceCheck', undefined),
            })(<Checkbox>开启</Checkbox>)}
          </FormItem>
        </div>
      </div>
    );
  }
}

EquipmentTypeBase.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default withRouter(withForm({}, injectIntl(EquipmentTypeBase)));
