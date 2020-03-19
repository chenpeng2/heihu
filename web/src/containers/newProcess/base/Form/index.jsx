import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import {
  Icon,
  withForm,
  FormItem,
  Document,
  Textarea,
  Input,
  Form,
  Select,
  Radio,
  FormattedMessage,
} from 'src/components';
import {
  codeFormat,
  nullCharacterVerification,
  supportSpecialCharacterValidator,
  requiredRule,
} from 'src/components/form';
import { primary, content, fontSub } from 'src/styles/color/index';
import { getProcessCode } from 'src/services/process';
import { FIFO_VALUE_DISPLAY_MAP } from 'views/bom/newProcess/utils';
import WorkstationAndAreaSelect, { getWorkstations } from 'src/components/select/workstationAndAreaSelect';
import {
  useFrozenTime,
  isOrganizationUseQrCode,
  getTaskDeliverableOrganizationConfig,
  ORGANIZATION_CONFIG,
  includeOrganizationConfig,
  configHasSOP,
} from 'src/utils/organizationConfig';
import SearchSelect from 'components/select/searchSelect';
import { arrayIsEmpty } from 'src/utils/array';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';
import UnqualifiedProductTip from './UnqualifiedProductTip';
import Defect from './defect';

const RadioGroup = Radio.Group;
const WORKSTATION_PREFIX = 'WORKSTATION';

export const getScanNumLabel = () => {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center' }}>
      <FormattedMessage defaultMessage={'单次扫码'} />
      <Icon
        tooltip={{
          placement: 'rightTop',
          content: (
            <div style={{ padding: 20 }}>
              <h2>
                <FormattedMessage defaultMessage={'单次扫码'} />
              </h2>
              <p style={{ color: content }}>
                <FormattedMessage
                  defaultMessage={'选择【是】后，执行该工序的生产任务时一次扫码即完成原料投产和物料产出的操作'}
                />
              </p>
              <p style={{ color: content }}>
                <FormattedMessage defaultMessage={'选择【否】后，执行该工序的任务需要分别扫码执行原料投产和物料产出'} />
              </p>
              <p style={{ color: content }}>
                <FormattedMessage
                  defaultMessage={
                    '老黑建议：如果该工序不需要使用新二维码绑定产出物料，建议你选择【是】，否则建议你选择【否】'
                  }
                />
              </p>
            </div>
          ),
        }}
        type="exclamation-circle-o"
        style={{ color: primary, marginLeft: 5 }}
      />
    </div>
  );
};

export const getAlwaysOneCodeLabel = () => (
  <div style={{ display: 'inline-flex', alignItems: 'center' }}>
    <span>{changeChineseToLocaleWithoutIntl('一码到底')}</span>
    <Icon
      tooltip={{
        placement: 'rightTop',
        content: (
          <div style={{ padding: 20 }}>
            <p>
              <FormattedMessage
                defaultMessage={
                  '选择【单次扫码 为 否】且 【一码到底 为是】后，执行该工序的任务需要分别扫码执行原料投产和物料产出，产出物料二维码必须为投入主物料二维码'
                }
              />
            </p>
          </div>
        ),
      }}
      type="exclamation-circle-o"
      style={{ color: primary, marginLeft: 5 }}
    />
  </div>
);

export const getFifoLabel = () => {
  return (
    <div style={{ display: 'inline-block', alignItems: 'center' }}>
      <span>{changeChineseToLocaleWithoutIntl('用料追溯关系')}</span>
      <Icon
        tooltip={{
          placement: 'rightTop',
          content: (
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
                <FormattedMessage
                  defaultMessage={'若选【单件顺序生产自动更新】，指产出用料追溯默认取最近一次投产记录；'}
                />
                <ul>
                  <li>
                    <FormattedMessage
                      defaultMessage={'即第一次产出C，追溯时会追溯到【第一次投入 1单位的A、1单位的B】'}
                    />
                  </li>
                  <li>
                    <FormattedMessage
                      defaultMessage={'第二次产出C，追溯时会追溯到【第二次投入 2单位的A】&【第一次投入 1单位的B】'}
                    />
                  </li>
                </ul>
              </p>
              <p>
                <FormattedMessage
                  defaultMessage={'若选【批量生产手动更新】，指用料追溯默认与上次产出选择的用料一致；'}
                />
                <ul>
                  <li>
                    <FormattedMessage
                      defaultMessage={
                        '即第一次产出C ，追溯内容为第一次投入，追溯时会追溯到【第一次投入 1单位的A、1单位的B】'
                      }
                    />
                  </li>
                  <li>
                    <FormattedMessage
                      defaultMessage={
                        '第二次产出C，没有手动切换追溯关系，追溯时会追溯到【第一次投入 1单位的A、1单位的B】'
                      }
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
                    <FormattedMessage
                      defaultMessage={'即第一次产出C，追溯时会追溯到【第一次投入 1单位的A、1单位的B】'}
                    />
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
          ),
        }}
        type="exclamation-circle-o"
        style={{ color: primary, marginLeft: 5 }}
      />
    </div>
  );
};

type Props = {
  form: any,
  disableStatus: boolean,
  isEdit: boolean,
  initialValue: any,
};

class BaseForm extends Component {
  props: Props;
  state = {
    visible: false,
    workstationsPrompt: '',
    defectsInitialValue: [],
  };

  componentDidMount() {
    const { initialValue } = this.props;

    this.setInitialValue(initialValue);
  }

  componentWillReceiveProps = nextProps => {
    if (!_.isEqual(nextProps.initialValue, this.props.initialValue)) {
      this.setInitialValue(nextProps.initialValue);
    }
  };

  setInitialValue = value => {
    const { form, isEdit } = this.props;
    const { setFieldsValue } = form || {};

    if (value) {
      const {
        workstations,
        workstationDetails,
        code,
        name,
        status,
        fifo,
        codeScanNum,
        productDesc,
        attachmentFiles,
        deliverable,
        outputFrozenCategory,
        processDefects,
        batchTemplate,
        batchTemplateId,
        alwaysOneCode,
        unqualifiedProducts,
      } = value;
      const res = {
        code,
        name,
        status,
        fifo,
        codeScanNum,
        deliverable,
        productDesc,
        alwaysOneCode,
        processDefects: arrayIsEmpty(processDefects) ? [] : processDefects.map(i => i && i.defect && i.defect.id),
        attachments: arrayIsEmpty(attachmentFiles)
          ? []
          : attachmentFiles.map(a => {
              a.restId = a.id;
              return a;
            }),
        outputFrozenCategory,
        batchTemplateId: batchTemplateId
          ? { key: batchTemplateId, label: `${batchTemplate.templateName}/${batchTemplate.templateUrl}` }
          : undefined,
        unqualifiedProducts,
      };

      // 工位数据初始化
      const _workstations = [];
      if (Array.isArray(workstationDetails) && workstationDetails.length) {
        workstationDetails
          .filter(e => !e.status || e.status === 1)
          .forEach(c => {
            _workstations.push({ value: `${WORKSTATION_PREFIX}-${c.id}`, label: c.name });
          });
      }

      // 次品分类
      const defects = arrayIsEmpty(processDefects)
        ? undefined
        : processDefects.map(e => ({
            id: e.defectId,
            name: e.defect.name,
            defectGroupName: e.defect.defectGroupName,
          }));

      res.workstations = _workstations;

      this.setState({ defectsInitialValue: defects }, () => {
        setFieldsValue(res);
      });
    }

    if (!isEdit) {
      getProcessCode().then(res => {
        const code = res.data.data;
        setFieldsValue({ code });
      });
    }
  };

  getFormValue = async () => {
    const { form } = this.props;

    let _val = null;

    form.validateFieldsAndScroll((err, val) => {
      if (err) return;

      const { attachments, processDefects, batchTemplateId } = val || {};
      const variables = _.cloneDeep(val);
      variables.attachments = arrayIsEmpty(attachments) ? null : attachments.map(n => n.restId);

      // 后端需要把code填入defect结构中
      variables.processDefects = arrayIsEmpty(processDefects)
        ? []
        : processDefects.filter(i => i).map(id => ({ defectId: id, processCode: variables.code }));
      variables.batchTemplateId = batchTemplateId && batchTemplateId.key;
      _val = variables;
    });

    if (_val) {
      // 工位数据处理
      _val.workstations = await getWorkstations(_val.workstations);
      _val.workstationGroups = [];
    }
    if (!(_val.workstations && _val.workstations.length)) {
      return null;
    }

    return _val;
  };

  render() {
    const { form, disableStatus } = this.props;
    const { defectsInitialValue } = this.state;
    const { getFieldDecorator, getFieldValue, setFieldsValue } = form;
    const useQrCode = isOrganizationUseQrCode();
    const hasSop = configHasSOP();
    const useProduceTaskDeliverable = getTaskDeliverableOrganizationConfig();
    const enableBatch = includeOrganizationConfig(ORGANIZATION_CONFIG.BatchRecord); // 是否启用批记录
    return (
      <div style={{ marginLeft: 40 }}>
        <Form>
          <FormItem label="编号">
            {getFieldDecorator('code', {
              rules: [
                requiredRule('编号'),
                { validator: codeFormat('编号') },
                { validator: supportSpecialCharacterValidator('编号') },
              ],
            })(
              <Input
                disabled={disableStatus && disableStatus.code}
                placeholder={'最多输入20个字符'}
                maxLength="20"
                style={{ width: 300 }}
              />,
            )}
          </FormItem>
          <FormItem label="名称">
            {getFieldDecorator('name', {
              rules: [requiredRule('名称'), { validator: nullCharacterVerification('名称') }],
            })(<Input placeholder={'最多输入20个字符'} maxLength="20" style={{ width: 300 }} />)}
          </FormItem>
          <FormItem label="状态">
            {getFieldDecorator('status', {
              initialValue: 1,
              rules: [requiredRule('状态')],
            })(
              <RadioGroup
                disabled={disableStatus && disableStatus.status}
                options={[{ label: '启用中', value: 1 }, { label: '停用中', value: 0 }]}
              />,
            )}
          </FormItem>
          <FormItem label="工位">
            {getFieldDecorator('workstations', {
              rules: [requiredRule('工位')],
            })(<WorkstationAndAreaSelect treeCheckable labelInValue style={{ width: 400 }} multiple />)}
          </FormItem>
          {useQrCode ? (
            <FormItem label={getScanNumLabel()}>
              {getFieldDecorator('codeScanNum', {
                rules: [requiredRule('单次扫码')],
                initialValue: 2,
              })(
                <RadioGroup
                  disabled={disableStatus && disableStatus.fifo}
                  options={[{ label: '是', value: 1 }, { label: '否', value: 2 }]}
                  onChange={e => {
                    if (e.target.value === 1) {
                      setFieldsValue({ alwaysOneCode: 1, unqualifiedProducts: 0 });
                    }
                  }}
                />,
              )}
            </FormItem>
          ) : null}
          {useQrCode && !hasSop ? (
            <FormItem label={getAlwaysOneCodeLabel()}>
              {getFieldDecorator('alwaysOneCode', {
                initialValue: 0,
                rules: [requiredRule('一码到底')],
              })(
                <RadioGroup
                  disabled={getFieldValue('codeScanNum') === 1 || (disableStatus && disableStatus.alwaysOneCode)}
                  options={[{ label: '是', value: 1 }, { label: '否', value: 0 }]}
                  onChange={e => {
                    if (e.target.value === 1) {
                      setFieldsValue({ unqualifiedProducts: 0 });
                    }
                  }}
                />,
              )}
            </FormItem>
          ) : null}
          <FormItem label={'次品项列表'}>{<Defect initialValue={defectsInitialValue} form={form} />}</FormItem>
          {useQrCode ? (
            <FormItem label={getFifoLabel()}>
              {getFieldDecorator('fifo', {
                rules: [requiredRule('用料追溯关系')],
                initialValue: 1,
              })(
                <Select style={{ width: 300 }}>
                  {_.map(FIFO_VALUE_DISPLAY_MAP, (display, value) => (
                    <Select.Option key={value} value={Number(value)}>
                      {changeChineseToLocaleWithoutIntl(display)}
                    </Select.Option>
                  ))}
                </Select>,
              )}
            </FormItem>
          ) : null}
          {useQrCode && (
            <FormItem label={<UnqualifiedProductTip />}>
              {getFieldDecorator('unqualifiedProducts', {
                initialValue: 0,
                rules: [
                  {
                    required: true,
                    message: <FormattedMessage defaultMessage={'{type}必填'} values={{ type: '不合格品投产' }} />,
                  },
                ],
              })(
                <RadioGroup
                  disabled={getFieldValue('codeScanNum') === 1 || (!hasSop && getFieldValue('alwaysOneCode') === 1)}
                >
                  <Radio value={1}>
                    <FormattedMessage defaultMessage={'允许'} />
                  </Radio>
                  <Radio value={0}>
                    <FormattedMessage defaultMessage={'不允许'} />
                  </Radio>
                </RadioGroup>,
              )}
            </FormItem>
          )}
          {useProduceTaskDeliverable ? (
            <FormItem label="任务下发审批">
              {getFieldDecorator('deliverable', {
                initialValue: false,
                rules: [{ required: useProduceTaskDeliverable, message: '请选择' }],
              })(<RadioGroup options={[{ label: '是', value: true }, { label: '否', value: false }]} />)}
            </FormItem>
          ) : null}
          {useFrozenTime() ? (
            <FormItem label="产出是否冻结">
              {getFieldDecorator('outputFrozenCategory', {
                initialValue: 0,
                rules: [requiredRule('产出是否冻结')],
              })(<RadioGroup options={[{ label: '是', value: 1 }, { label: '否', value: 0 }]} />)}
            </FormItem>
          ) : null}
          {/* todo: 模板链接 */}
          {enableBatch && (
            <FormItem label="批记录模板链接">
              {getFieldDecorator('batchTemplateId')(<SearchSelect style={{ width: 400 }} type="batchTemplate" />)}
            </FormItem>
          )}
          <FormItem label="生产描述">
            {getFieldDecorator('productDesc', {
              rules: [{ message: '请输入生产描述' }],
            })(<Textarea maxLength={100} placeholder={'请输入生产描述'} style={{ width: 300, height: 120 }} />)}
          </FormItem>
          <FormItem label="附件">
            {getFieldDecorator('attachments', {})(<Document />)}
            <div style={{ color: fontSub }}>
              <FormattedMessage defaultMessage={'用于执行生产任务时查看'} />
            </div>
          </FormItem>
        </Form>
      </div>
    );
  }
}

BaseForm.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default withForm({ showFooter: false }, BaseForm);
