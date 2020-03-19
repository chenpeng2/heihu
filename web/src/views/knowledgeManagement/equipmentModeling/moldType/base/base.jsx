import * as React from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withForm, FormItem, Input, Radio, Checkbox, Select } from 'components';
import { nullCharacterVerification, chineseFormat } from 'components/form';
import { queryReportTemplateList } from 'src/services/knowledgeBase/equipment';
import _ from 'lodash';
import styles from './styles.scss';

const RadioGroup = Radio.Group;
const Option = Select.Option;
const remindGroup = [
  {
    label: '不提醒',
    key: '0',
  },
  {
    label: '提前1小时',
    key: '1h',
  },
  {
    label: '提前1天',
    key: '1d',
  },
  {
    label: '提前3天',
    key: '3d',
  },
  {
    label: '提前1周',
    key: '1w',
  },
  {
    label: '提前2周',
    key: '2w',
  },
  {
    label: '提前1个月',
    key: '1m',
  },
];

type propsType = {
  router: any,
  form: any,
  params: {},
  formData: {},
  submit: () => {},
  title: String,
};

class MoldTypeBase extends React.Component<propsType> {
  state = {
    reportTemplates: [],
  };

  componentDidMount = () => {
    this.fetchReportTemplates();
  };

  fetchReportTemplates = async () => {
    const {
      data: { total },
    } = await queryReportTemplateList({ page: 1, size: 10 });
    const {
      data: { data },
    } = await queryReportTemplateList({ page: 1, size: total });
    this.setState({
      reportTemplates: data,
    });
  };

  render() {
    const { form, formData, title } = this.props;
    const { getFieldDecorator } = form;
    const { reportTemplates } = this.state;

    return (
      <div className={styles.moldTypeBase}>
        <div className={styles.baseSetting}>
          <div className={styles.baseHeaders}>{title}</div>
          <FormItem label="模具类型名称" required>
            {getFieldDecorator('name', {
              rules: [
                { required: true, message: '请输入模具类型名称' },
                { max: 20, message: '最多可输入20个字符' },
                { validator: nullCharacterVerification('模具类型名称') },
                // { validator: chineseFormat('模具类型名称') },
              ],
              initialValue: formData && formData.name,
            })(<Input placeholder={'最多可输入20个字符'} style={{ width: 300 }} />)}
          </FormItem>
        </div>
        <div className={styles.baseSetting}>
          <div className={styles.baseHeaders}>维修任务配置</div>
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
          <FormItem
            label="设备停机"
            help="勾选后，任务执行期间，对应设备维护状态将被置为“维护停机”"
            validateStatus="warning"
          >
            {getFieldDecorator('repairStop', {
              valuePropName: 'checked',
              initialValue: _.get(formData, 'repairTaskConfig.stop', undefined),
            })(<Checkbox>开启</Checkbox>)}
          </FormItem>
          <FormItem label="报告模板" required>
            {getFieldDecorator('repairReportTemplate', {
              rules: [{ required: true, message: '请选择报告模板' }],
              initialValue: _.get(formData, 'repairTaskConfig.reportTemplate.id', undefined) && {
                key: formData.repairTaskConfig.reportTemplate.id,
                name: formData.repairTaskConfig.reportTemplate.id,
              },
            })(
              <Select placeholder="请选择报告模板" style={{ width: 300 }} labelInValue>
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
                    {label}
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
        <div className={styles.baseSetting}>
          <div className={styles.baseHeaders}>保养任务配置</div>
          <FormItem
            label="扫码确定"
            help="勾选后，维修任务操作人需要现场扫描电子标签，才能开始执行"
            validateStatus="warning"
          >
            {getFieldDecorator('maintainScan', {
              valuePropName: 'checked',
              initialValue: _.get(formData, 'maintainTaskConfig.scan', undefined),
            })(<Checkbox>开启</Checkbox>)}
          </FormItem>
          <FormItem
            label="设备停机"
            help="勾选后，任务执行期间，对应设备维护状态将被置为“维护停机”"
            validateStatus="warning"
          >
            {getFieldDecorator('maintainStop', {
              valuePropName: 'checked',
              initialValue: _.get(formData, 'maintainTaskConfig.stop', undefined),
            })(<Checkbox>开启</Checkbox>)}
          </FormItem>
          <FormItem label="报告模板" required>
            {getFieldDecorator('maintainReportTemplate', {
              rules: [{ required: true, message: '请选择报告模板' }],
              initialValue: _.get(formData, 'maintainTaskConfig.reportTemplate.id', undefined) && {
                key: formData.maintainTaskConfig.reportTemplate.id,
                name: formData.maintainTaskConfig.reportTemplate.name,
              },
            })(
              <Select placeholder="请选择报告模板" style={{ width: 300 }} labelInValue>
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
            {getFieldDecorator('maintainWarnConfig', {
              initialValue: (_.get(formData, 'maintainTaskConfig.warnConfig', undefined) && {
                key: formData.maintainTaskConfig.warnConfig,
                label: formData.maintainTaskConfig.warnConfigDisplay,
              }) || { key: '0', label: '不提醒' },
            })(
              <Select style={{ width: 300 }} labelInValue>
                {remindGroup.map(({ key, label }) => (
                  <Option key={key} value={key}>
                    {label}
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
            {getFieldDecorator('maintainAcceptanceCheck', {
              valuePropName: 'checked',
              initialValue: _.get(formData, 'maintainTaskConfig.acceptanceCheck', undefined),
            })(<Checkbox>开启</Checkbox>)}
          </FormItem>
        </div>
      </div>
    );
  }
}

MoldTypeBase.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default withRouter(withForm({}, MoldTypeBase));
