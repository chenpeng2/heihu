import React, { Component } from 'react';
import _ from 'lodash';

import {
  message,
  Document,
  Select,
  Popover,
  Icon,
  Radio,
  withForm,
  FormItem,
  Form,
  Input,
  Spin,
  Row as MyRow,
  Col as MyCol,
  InputNumber,
  FormattedMessage,
} from 'src/components';
import { blacklakeGreen, border, black, content } from 'src/styles/color';
import { checkStringLength, amountValidator, requiredRule } from 'components/form';
import { getProcessDetail } from 'src/services/process';
import QcConfigList from 'src/containers/qcConfig/qcConfigList';
import DefectView from 'src/containers/newProcess/base/defectView';
import {
  START_WHEN_PRE_PROCESS_START,
  START_WHEN_PRE_PROCESS_STOP,
  SUCCESSION_MODE_ENUM,
} from 'containers/mBom/base/constant';
import WorkstationAreaSelect from 'src/components/select/workstationAndAreaSelect';
import { queryDefWorkstations } from 'src/services/workstation';
import {
  useFrozenTime,
  isOrganizationUseQrCode,
  getTaskDeliverableOrganizationConfig,
  configHasSOP,
} from 'src/utils/organizationConfig';
import { FIFO_VALUE_DISPLAY_MAP } from 'views/bom/newProcess/utils';
import { OUTPUT_FROZEN_CATEGORY } from 'src/views/bom/newProcess/utils';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';
import UnqualifiedProductTip from 'containers/newProcess/base/Form/UnqualifiedProductTip';
import { getAreaList, getWorkShopChildren, getProdLineChildren } from 'services/knowledgeBase/area';
import ProcessSelect from './processSelect';
import { INPUT_WIDTH } from '../../../constant';
import { formatWorkstationsInProcess } from '../../../util';

const Row = MyRow.AntRow;
const Col = MyCol.AntCol;
const RowStyle = { marginBottom: 15 };
const FIX_WIDTH = 800;
const Option = Select.Option;
const RadioGroup = Radio.Group;

type Props = {
  editing: boolean,
  relay: any,
  form: any,
  activeProcessUUID: string,
  activeProcessContainerUUID: string,
  initialData: any,
  organization: any,
  ProcessListData: any,
  isActiveProcessContainerParallel: boolean,
};

const findNode = (treeData, value) => {
  let res;
  const [type, id] = value.split('-');
  if (treeData) {
    treeData.forEach(node => {
      if (res) {
        return;
      }
      if (Number(node.id) === Number(id) && type === node.type) {
        res = node;
      } else {
        res = findNode(node.children, value);
      }
    });
  }
  return res;
};

const formatNode = (node, parent, cb) => {
  const res = {
    name: node.name,
    label: node.name,
    title: node.name,
    value: `${node.type}-${node.id}`,
    type: node.type,
    key: `${node.type}-${node.id}`,
    id: node.id,
    isLeaf: !node.children,
  };
  res.children = node.children && node.children.map(ws => this.formatNode(ws, res, cb));
  if (cb) {
    cb(res);
  }
  return res;
};

const getWorkStationTreeData = async process => {
  if (!process) {
    return [];
  }
  const { workstations } = process;
  const { data } = await getAreaList({ enabled: true });
  let treeData = data.data.children.map(node => {
    return formatNode(node);
  });

  if (workstations.length) {
    const workstationIds = workstations.map(e => e.id);
    const {
      data: { data: _workstations },
    } = await queryDefWorkstations({ ids: workstationIds.join(',') });
    const productionLineIds = _.uniq(_workstations.map(e => e.productionLineId)).filter(e => e);
    const workshopIds = _.uniq(_workstations.map(e => e.workshopId)).filter(e => e);

    treeData = treeData.filter(e => workshopIds.includes(e.id));

    for (const id of workshopIds) {
      const treeNode = findNode(treeData, `WORKSHOP-${id}`);
      if (treeNode) {
        const {
          data: { data },
        } = await getWorkShopChildren(id, { enabled: true });
        treeNode.children = data
          .filter(
            e =>
              (e.type === 'PRODUCTION_LINE' && productionLineIds.includes(e.id)) ||
              (e.type === 'WORKSTATION' && workstationIds.includes(e.id)),
          )
          .map(node => {
            return formatNode(node, treeNode, node => {
              node.isSearched = true;
            });
          });
      }
    }
    for (const id of productionLineIds) {
      const treeNode = findNode(treeData, `PRODUCTION_LINE-${id}`);
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

class EditProcessForm extends Component {
  props: Props;
  state = {
    activeProcess: null,
    showCreateProcess: true,
    treeData: [],
    selectedWorkstationGroups: null, // 需要提示用户选中了什么工位组，工位组下面有几个工位
    loading: false,
  };

  componentDidMount = () => {
    this.setInitialValue();
  };

  componentWillReceiveProps(nextProps) {
    const {
      activeProcessUUID: nextActiveProcessUUID,
      activeProcessContainerUUID: nextActiveProcessContainerUUID,
      initialData: nextInitialData,
    } = nextProps;
    const { activeProcessUUID, activeProcessContainerUUID, form, initialData } = this.props;

    if (JSON.stringify(nextInitialData) !== JSON.stringify(initialData)) {
      this.setInitialValue(nextProps);
      if (
        activeProcessUUID !== nextActiveProcessUUID ||
        activeProcessContainerUUID !== nextActiveProcessContainerUUID
      ) {
        // 当切换选中的工序的时候需要改变form中的数据
        form.resetFields();
        // 同时要把工位的选项清空
        this.setState({ treeData: [] });
      }
    }
  }

  setInitialValue = async props => {
    const { form, initialData } = props || this.props;
    const { setFieldsValue } = form;
    const {
      productDesc,
      process,
      workstations,
      workstationGroups,
      workstationDetails,
      nodeCode,
      attachments,
      qcConfigs,
      successionMode,
      preparationTime,
      deliverable,
      preparationTimeCategory,
    } = initialData || {};
    const { code } = process || {};

    // 为了编辑的时候填入工位等的初始值
    if (code) {
      await this.onChangeForProcessCode(code, true);
    }

    let _workstations;
    // 工位初始值
    // 没有workstationDetails 表示不是初始值 直接用workstation的数据即可
    // 过滤停用的工位
    if (workstationGroups && workstationGroups.length) {
      _workstations = workstationDetails
        ? workstationDetails
            .filter(e => e.status === 1)
            .map(({ id, name }) => {
              return { value: `WORKSTATION-${id}`, label: name };
            })
        : [];
    }

    setFieldsValue({
      productDesc,
      nodeCode: nodeCode || null,
      code,
      successionMode,
      preparationTimeValue: preparationTime,
      preparationTimeCategory,
      workstations: _workstations || workstations,
      deliverable,
      attachments,
      qcConfigs,
    });
  };

  getPayload = async () => {
    const { form } = this.props;
    const { activeProcess } = this.state;

    let resValue = null;

    const formatValue = async v => {
      const {
        code,
        productDesc,
        nodeCode,
        workstations,
        attachments,
        qcConfigs,
        successionMode,
        preparationTimeCategory,
        preparationTimeValue,
        deliverable,
      } = v || {};
      const { name } = activeProcess || {};

      const res = {
        nodeCode,
        productDesc,
        process: {
          code,
          name, // 为了在图中显示code/name
        },
        successionMode,
        attachments,
        qcConfigs,
        workstations,
        deliverable,
        workstationGroups: [],
        preparationTimeCategory,
        preparationTime: preparationTimeValue || 0,
      };

      return res;
    };

    form.validateFieldsAndScroll((error, value) => {
      // 因为有这个判断如果用户的数据没有填完整那么是不会返回数据的。
      if (error) {
        message.error('基本信息填写有误');
        throw new Error('基本信息填写有误');
      }
      resValue = _.cloneDeep(value);
    });

    resValue = await formatValue(resValue);
    return resValue;
  };

  // 序号验证
  validatorForNo = () => {
    const { ProcessListData, initialData } = this.props;
    const processListData = ProcessListData ? ProcessListData.getProcessListData() : [];

    const noValidator = (rule, value, callback) => {
      let isRepeat = false;
      if (Array.isArray(processListData)) {
        processListData.forEach(data => {
          const { nodes } = data || {};
          if (Array.isArray(nodes)) {
            nodes.forEach(node => {
              const { nodeCode, processUUID } = node || {};
              if (nodeCode && value && Number(nodeCode) === Number(value) && processUUID !== initialData.processUUID) {
                isRepeat = true;
              }
            });
          }
        });
      }

      if (isRepeat) {
        callback(changeChineseToLocaleWithoutIntl('该序号已经被使用，不可重复使用'));
      }

      const reg = /^\d{0,6}$/;
      if (!reg.test(value)) {
        callback(changeChineseToLocaleWithoutIntl('最多支持6位数字'));
      }
      callback();
    };
    return noValidator;
  };

  getProcessDataFromCode = async processCode => {
    if (!processCode) return null;

    this.setState({ loading: true });

    const res = await getProcessDetail(processCode);
    const data = _.get(res, 'data.data');

    this.setState({ loading: false });

    return formatWorkstationsInProcess(data);
  };

  onChangeForProcessCode = async (value, emitWorkStations) => {
    const { form } = this.props;
    const { setFieldsValue, resetFields } = form;
    resetFields(['workstations', 'codeScanNum', 'fifo']);

    const processData = await this.getProcessDataFromCode(value);
    const {
      fifo,
      codeScanNum,
      attachmentFiles,
      productDesc,
      workstationDetails,
      processDefects: defects,
      deliverable,
      outputFrozenCategory,
      alwaysOneCode,
      unqualifiedProducts,
    } = processData || {};
    // 工位默认值
    let _workstations = [];
    if (workstationDetails) {
      // 停用的工位无法被选中
      _workstations = _workstations.concat(workstationDetails.filter(item => item && item.status === 1).map(e => e));
    }

    this.setState(
      {
        activeProcess: processData || null,
        treeData: await getWorkStationTreeData(processData),
        workstationsOption: _workstations, // 工位的选择范围
      },
      () => {
        setFieldsValue({
          unqualifiedProducts,
          alwaysOneCode,
          fifo,
          codeScanNum,
          attachments: Array.isArray(attachmentFiles)
            ? attachmentFiles.map(item => {
                item.restId = item.id;
                return item;
              })
            : [],
          productDesc,
          defects: Array.isArray(defects) ? defects.map(({ defect }) => defect) : [],
          deliverable,
          outputFrozen: outputFrozenCategory,
          workstations: emitWorkStations
            ? []
            : _workstations.filter(a => a).map(e => ({ value: `WORKSTATION-${e.id}`, label: e.name })),
        });
      },
    );
  };

  renderLabelPopover = (text, infoText) => {
    return (
      <span>
        <Popover content={changeChineseToLocaleWithoutIntl(infoText)} overlayStyle={{ width: 406 }}>
          <Icon type="exclamation-circle-o" color={blacklakeGreen} style={{ marginRight: 5 }} />
        </Popover>
        {changeChineseToLocaleWithoutIntl(text)}
      </span>
    );
  };

  render() {
    const { loading, workstationsOption } = this.state;
    const { form, isActiveProcessContainerParallel } = this.props;
    const { getFieldDecorator } = form;
    const titleStyle = { fontSize: 18, color: black };
    const useQrCode = isOrganizationUseQrCode();
    const useProduceTaskDeliverable = getTaskDeliverableOrganizationConfig();
    const hasSop = configHasSOP();

    return (
      <Spin spinning={loading}>
        <Form style={{ overflow: 'hidden' }}>
          <div style={titleStyle}>
            <FormattedMessage defaultMessage={'基础信息'} />
          </div>
          <Row>
            <Col span={8}>
              <FormItem label={'序号'}>
                {getFieldDecorator('nodeCode', {
                  rules: [requiredRule('序号'), { validator: this.validatorForNo() }],
                })(<Input style={{ width: INPUT_WIDTH }} />)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label={'编号／名称'}>
                {getFieldDecorator('code', {
                  rules: [requiredRule('工序')],
                  onChange: value => this.onChangeForProcessCode(value, false),
                })(<ProcessSelect codeScanNum={isActiveProcessContainerParallel ? 1 : null} form={form} />)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label={'接续方式'}>
                {getFieldDecorator('successionMode', {
                  rules: [requiredRule('接续方式')],
                })(
                  <Select style={{ width: 200 }}>
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
              <Col span={8}>
                <FormItem
                  label={this.renderLabelPopover(
                    '单次扫码',
                    <div>
                      <FormattedMessage
                        defaultMessage={'选择【是】后，执行该工序的生产任务时一次扫码即完成原料投产和物料产出的操作'}
                      />
                      <br />
                      <FormattedMessage
                        defaultMessage={'选择【否】后，执行该工序的任务需要分别扫码执行原料投产和物料产出'}
                      />
                      <br />
                      <FormattedMessage
                        defaultMessage={
                          '老黑建议：如果该工序不需要使用新二维码绑定产出物料，建议你选择【是】，否则建议你选择【否】'
                        }
                      />
                    </div>,
                  )}
                >
                  {getFieldDecorator('codeScanNum')(
                    <Select style={{ width: INPUT_WIDTH }} disabled>
                      <Select.Option key={1} value={1}>
                        <FormattedMessage defaultMessage={'是'} />
                      </Select.Option>
                      <Select.Option key={2} value={2}>
                        <FormattedMessage defaultMessage={'否'} />
                      </Select.Option>
                    </Select>,
                  )}
                </FormItem>
              </Col>
            ) : null}
            {useQrCode && !hasSop ? (
              <Col span={8}>
                <FormItem label={'一码到底'}>
                  {getFieldDecorator('alwaysOneCode')(
                    <Select style={{ width: INPUT_WIDTH }} disabled>
                      <Select.Option key={1} value={1}>
                        <FormattedMessage defaultMessage={'是'} />
                      </Select.Option>
                      <Select.Option key={0} value={0}>
                        <FormattedMessage defaultMessage={'否'} />
                      </Select.Option>
                    </Select>,
                  )}
                </FormItem>
              </Col>
            ) : null}
            {useQrCode ? (
              <Col span={8}>
                <FormItem
                  label={this.renderLabelPopover(
                    '用料追溯关系',
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
                              defaultMessage={
                                '第二次产出C，追溯时会追溯到【第二次投入 2单位的A】&【第一次投入 1单位的B】'
                              }
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
                    </div>,
                  )}
                >
                  {getFieldDecorator('fifo')(
                    <Select style={{ width: INPUT_WIDTH }} disabled>
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
              <Col span={8}>
                <FormItem label={<UnqualifiedProductTip />}>
                  {getFieldDecorator('unqualifiedProducts')(
                    <Select disabled style={{ width: INPUT_WIDTH }}>
                      <Option value={0}>
                        <FormattedMessage defaultMessage={'不允许'} />
                      </Option>
                      <Option value={1}>
                        <FormattedMessage defaultMessage={'允许'} />
                      </Option>
                    </Select>,
                  )}
                </FormItem>
              </Col>
            )}
            <Col span={8}>
              <div style={{ whiteSpace: 'nowrap' }}>
                <FormItem label={'准备时间'}>
                  {getFieldDecorator('preparationTimeValue', {
                    rules: [
                      {
                        validator: amountValidator(10000, {
                          value: 0,
                          equal: true,
                          message: <FormattedMessage defaultMessage={'准备时间必须大于等于0'} />,
                        }),
                      },
                    ],
                    initialValue: 0,
                  })(<InputNumber placeholder="0" />)}{' '}
                  {getFieldDecorator('preparationTimeCategory', {
                    initialValue: 0,
                  })(
                    <Select style={{ width: 100 }}>
                      <Option value={1}>
                        <FormattedMessage defaultMessage={'小时'} />
                      </Option>
                      <Option value={0}>
                        <FormattedMessage defaultMessage={'分钟'} />
                      </Option>
                    </Select>,
                  )}
                </FormItem>
              </div>
            </Col>
          </Row>
          <Row style={RowStyle}>
            <Col>
              <FormItem label={'工位'}>
                {getFieldDecorator('workstations', {
                  rules: [requiredRule('工位')],
                })(
                  <WorkstationAreaSelect
                    treeCheckable
                    labelInValue
                    style={{ width: FIX_WIDTH }}
                    multiple
                    options={workstationsOption || []}
                  />,
                )}
              </FormItem>
            </Col>
          </Row>
          {useProduceTaskDeliverable ? (
            <Row style={RowStyle}>
              <Col>
                <FormItem label="任务下发审批">
                  {getFieldDecorator('deliverable', {
                    initialValue: true,
                    rules: [{ required: useProduceTaskDeliverable, message: '请选择' }],
                  })(<RadioGroup options={[{ label: '是', value: true }, { label: '否', value: false }]} />)}
                </FormItem>
              </Col>
            </Row>
          ) : null}
          {useFrozenTime() ? (
            <Row style={RowStyle}>
              <Col>
                <FormItem label="产出是否冻结">
                  {getFieldDecorator('outputFrozen', {
                    initialValue: true,
                    rules: [{ required: useFrozenTime(), message: '请选择' }],
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
              </Col>
            </Row>
          ) : null}
          <Row>
            <Col>
              <FormItem label={'次品项列表'}>{getFieldDecorator('defects')(<DefectView />)}</FormItem>
            </Col>
          </Row>
          <Row style={RowStyle}>
            <Col>
              <FormItem label={'附件'}>
                {getFieldDecorator('attachments', {})(
                  <Document extraText={<FormattedMessage defaultMessage={'用于执行任务时查看'} />} />,
                )}
              </FormItem>
            </Col>
          </Row>
          <Row style={RowStyle}>
            <Col>
              <FormItem label={'生产描述'}>
                {getFieldDecorator('productDesc', {
                  rules: [{ validator: checkStringLength(100) }],
                })(
                  <Input.TextArea
                    style={{ width: FIX_WIDTH, height: 100 }}
                    placeholder={changeChineseToLocaleWithoutIntl('请输入生产描述（用于执行生产任务时查看）')}
                  />,
                )}
              </FormItem>
            </Col>
          </Row>
          <div style={titleStyle}>
            <FormattedMessage defaultMessage={'质检方案'} />
          </div>
          <FormItem label={' '}>
            {getFieldDecorator('qcConfigs')(
              <QcConfigList
                type={'processRouting'}
                style={{ padding: 20, border: `1px solid ${border}`, width: FIX_WIDTH }}
              />,
            )}
          </FormItem>
        </Form>
      </Spin>
    );
  }
}

export default withForm({}, EditProcessForm);
