import React, { Component } from 'react';
import _ from 'lodash';
import { amountValidator, codeFormat } from 'src/components/form';
import {
  FormItem,
  Form,
  Input,
  Select,
  Radio,
  Searchselect,
  Attachment,
  Textarea,
  Checkbox,
  Button,
  openModal,
  Spin,
} from 'components';
import { wrapUrl } from 'utils/attachment';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';
import { queryReportTemplateList } from 'src/services/knowledgeBase/equipment';
import { remindGroup } from 'src/views/knowledgeManagement/equipmentModeling/equipmentType/constants';
import DeviceProp from '../equipmentType/base/deviceProp';
import StrategyConfig from '../equipmentType/base/strategyConfig';
import ModuleOutConfig from './moduleOutConfig';
import { MACHINING_MATERIAL_TYPE, MACHINING_MATERIAL_TYPE_PARTS } from './constants';
import styles from './styles.scss';

const RadioGroup = Radio.Group;
const itemStyle = { width: 300, height: 32 };
const Option = Select.Option;
const { ImgAttachments } = Attachment;

type Props = {
  form: any,
  data: any,
  intl: any,
  edit: boolean,
  deviceMetrics: any,
  taskStrategies: any,
  outputMaterials: any,
  handleStrategySubmit: () => {},
  onSubmitModuleOut: () => {},
  onTypeChange: () => {},
};

class BasicInfoForm extends Component {
  props: Props;

  state = {
    loading: false,
    deviceMetricIds: [],
    reportTemplates: [],
  };

  componentDidMount() {
    const { form, data, edit } = this.props;
    const { setFieldsValue } = form;
    if (edit) {
      const {
        attachmentFiles,
        pictureFiles,
        type,
        typeDisplay,
        code,
        name,
        unitName,
        unitId,
        unitPrice,
        specification,
        status,
        toolingType,
        toolingTypeDisplay,
        mgmtLifeCycle,
        mgmtElectronicLabel,
        metrics,
      } = data;
      const fieldsValue = {
        pictureIds:
          pictureFiles &&
          pictureFiles.length &&
          pictureFiles.map(n => ({
            id: n.id,
            restId: n.id,
            originalFileName: n.original_filename,
            url: wrapUrl(n.id),
          })),
        attachmentIds:
          attachmentFiles &&
          attachmentFiles.length &&
          attachmentFiles.map(n => ({ id: n.id, restId: n.id, originalFileName: n.original_filename })),
        type: { label: typeDisplay, key: `${type}` },
        code,
        name,
        unitId: { label: unitName, key: unitId },
        unitPrice,
        specification,
        status: `${status}`,
        toolingType: { label: toolingTypeDisplay, key: `${toolingType}` },
        mgmtLifeCycle,
        mgmtElectronicLabel,
      };
      setFieldsValue(fieldsValue);
      this.setState({ deviceMetricIds: metrics.map(n => `${n.id}`), type });
    }
    this.fetchReportTemplates();
  }

  fetchReportTemplates = async () => {
    const {
      data: { total },
    } = await queryReportTemplateList({ page: 1, size: 10 });
    const {
      data: { data },
    } = await queryReportTemplateList({ page: 1, size: total });
    this.setState({ reportTemplates: data }, () => {
      const { edit, data, form } = this.props;
      if (edit) {
        const { repairTaskConfig, mgmtLifeCycle } = data;
        if (repairTaskConfig && mgmtLifeCycle) {
          const { setFieldsValue } = form;
          repairTaskConfig.reportTemplateId = repairTaskConfig.reportTemplate && repairTaskConfig.reportTemplate.id;
          setFieldsValue(repairTaskConfig || {});
        }
      }
    });
  };

  render() {
    const {
      form,
      edit,
      intl,
      outputMaterials,
      taskStrategies,
      handleStrategySubmit,
      onSubmitModuleOut,
      onTypeChange,
      data,
    } = this.props;
    const { deviceMetricIds, type, lifeCycle, loading, reportTemplates } = this.state;
    const { draft, metrics, toolingType, status } = data || {};
    const { getFieldDecorator, setFieldsValue, getFieldValue } = form;
    // 现版本电子标签管理必须勾选，此判断标志暂留
    const electronicLabelDisabled = lifeCycle || getFieldValue('mgmtLifeCycle') || (edit && !draft);
    return (
      <Spin spinning={loading}>
        <div className={styles.machiningMaterialForm} style={{ marginLeft: 40 }}>
          <Form>
            <FormItem label="图片">
              {getFieldDecorator('pictureIds')(<ImgAttachments listType="picture-card" maxCount={1} />)}
            </FormItem>
            <FormItem label="类型">
              {getFieldDecorator('type', {
                rules: [{ required: true, message: changeChineseToLocale('请选择类型', intl) }],
              })(
                <Select
                  style={itemStyle}
                  labelInValue
                  disabled={edit && !draft}
                  onChange={value => {
                    onTypeChange(value.key);
                    this.setState({ type: value.key });
                  }}
                >
                  {Object.values(MACHINING_MATERIAL_TYPE).map(n => (
                    <Option disabled={n.key === MACHINING_MATERIAL_TYPE_PARTS} value={n.key}>
                      {changeChineseToLocale(n.label, intl)}
                    </Option>
                  ))}
                </Select>,
              )}
            </FormItem>
            <FormItem label="编号">
              {getFieldDecorator('code', {
                rules: [
                  { required: true, message: changeChineseToLocale('请输入编号', intl) },
                  { max: 30, message: changeChineseToLocale('长度不能超过30个字符', intl) },
                  { validator: codeFormat(changeChineseToLocale('编号', intl)) },
                ],
              })(<Input placeholder="请输入编号" disabled={edit && !draft} style={itemStyle} />)}
            </FormItem>
            <FormItem label="名称">
              {getFieldDecorator('name', {
                rules: [
                  { required: true, message: changeChineseToLocale('请输入名称', intl) },
                  { max: 150, message: changeChineseToLocale('长度不能超过150个字符', intl) },
                ],
              })(<Input placeholder="请输入名称" style={itemStyle} />)}
            </FormItem>
            <FormItem label="单位">
              {getFieldDecorator('unitId', {
                rules: [{ required: true, message: changeChineseToLocale('请选择单位', intl) }],
              })(<Searchselect disabled={edit && !draft} placeholder="请选择" style={itemStyle} type={'unit'} />)}
            </FormItem>
            <FormItem label="参考单价">
              {getFieldDecorator('unitPrice', {
                initialValue: 0,
                rules: [{ validator: amountValidator(null, '0', 'fraction', 2) }],
              })(<Input style={itemStyle} placeholder={'请输入参考单价'} />)}
            </FormItem>
            <FormItem label="规格描述">
              {getFieldDecorator('specification')(
                <Textarea maxLength={100} placeholder={'请输入规格描述'} style={{ width: 300, height: 120 }} />,
              )}
            </FormItem>
            <FormItem label="附件">
              {getFieldDecorator('attachmentIds')(
                <Attachment
                  style={{ width: 200, display: 'block', marginBottom: 30 }}
                  tipStyle={{ marginLeft: 0, width: 300, lineHeight: '15px', top: 'unset' }}
                  max={5}
                />,
              )}
            </FormItem>
            <FormItem label="状态">
              {getFieldDecorator('status', {
                initialValue: status || '0',
                rules: [{ required: true, message: changeChineseToLocale('请选择备件状态', intl) }],
              })(
                <RadioGroup>
                  <Radio value={'1'}>{changeChineseToLocale('启用中', intl)}</Radio>
                  <Radio value={'0'}>{changeChineseToLocale('停用中', intl)}</Radio>
                </RadioGroup>,
              )}
            </FormItem>
            <div
              style={{
                display: type === 2 || (getFieldValue('type') && getFieldValue('type').key === '2') ? 'flex' : 'none',
              }}
            >
              <FormItem label="工装类型">
                {getFieldDecorator('toolingType', {
                  rules: [{ required: true, message: changeChineseToLocale('请选择工装类型', intl) }],
                })(
                  <Select
                    style={itemStyle}
                    labelInValue
                    onChange={value => {
                      this.setState({ toolingType: value.key });
                    }}
                    disabled={edit && !draft}
                  >
                    <Option disabled value={'1'}>
                      {changeChineseToLocale('一般工装', intl)}
                    </Option>
                    <Option value={'2'}>{changeChineseToLocale('模具', intl)}</Option>
                  </Select>,
                )}
              </FormItem>
              <Button
                style={{ height: 32, margin: '3px 0 0 20px' }}
                onClick={() => {
                  openModal({
                    title: '模具产出配置',
                    children: (
                      <ModuleOutConfig
                        status={status}
                        outputMaterials={outputMaterials}
                        onSubmitModuleOut={onSubmitModuleOut}
                      />
                    ),
                    footer: null,
                    getContainer: () => document.getElementsByClassName(styles.machiningMaterialForm)[0],
                    onCancel: null,
                    width: 680,
                  });
                }}
                disabled={
                  toolingType === 1 || !getFieldValue('toolingType') || getFieldValue('toolingType').key === '1'
                }
              >
                配置
              </Button>
            </div>
            <FormItem label="生命周期管理">
              {getFieldDecorator('mgmtLifeCycle', {
                initialValue: false,
                rules: [{ required: true }],
                valuePropName: 'checked',
              })(
                <Checkbox
                  disabled={edit && !draft}
                  onChange={e => {
                    this.setState({ lifeCycle: e.target.checked });
                    setFieldsValue({ mgmtElectronicLabel: true });
                  }}
                >
                  开启
                </Checkbox>,
              )}
            </FormItem>
            <FormItem label="电子标签管理">
              {getFieldDecorator('mgmtElectronicLabel', {
                initialValue: true,
                rules: [{ required: true }],
                valuePropName: 'checked',
              })(<Checkbox disabled>开启</Checkbox>)}
            </FormItem>
            <div style={{ display: lifeCycle || getFieldValue('mgmtLifeCycle') ? 'block' : 'none' }}>
              <FormItem label="读数">
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
                  data={metrics}
                  taskStrategies={taskStrategies}
                  action={edit ? 'edit' : 'create'}
                  form={form}
                />
              </FormItem>
              <FormItem label="策略配置">
                <StrategyConfig
                  type={taskStrategies && taskStrategies.length ? 'edit' : 'create'}
                  deviceMetricIds={deviceMetricIds}
                  data={taskStrategies}
                  handleStrategySubmit={handleStrategySubmit}
                />
              </FormItem>
              <div className={styles.baseHeaders}>{changeChineseToLocale('维修任务配置', intl)}</div>
              <FormItem
                label="扫码确定"
                help="勾选后，维修任务操作人需要现场扫描电子标签，才能开始执行"
                validateStatus="warning"
              >
                {getFieldDecorator('scan', {
                  valuePropName: 'checked',
                })(<Checkbox>开启</Checkbox>)}
              </FormItem>
              <FormItem label="报告模板" required>
                {getFieldDecorator('reportTemplateId', {
                  rules: [
                    {
                      required: lifeCycle || getFieldValue('mgmtLifeCycle'),
                      message: changeChineseToLocale('请选择报告模板', intl),
                    },
                  ],
                })(
                  <Select placeholder={changeChineseToLocale('请选择报告模板', intl)} style={{ width: 300 }}>
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
                {getFieldDecorator('warnConfig', {
                  initialValue: '0',
                })(
                  <Select style={{ width: 300 }}>
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
                })(<Checkbox>开启</Checkbox>)}
              </FormItem>
            </div>
          </Form>
        </div>
      </Spin>
    );
  }
}

export default injectIntl(BasicInfoForm);
