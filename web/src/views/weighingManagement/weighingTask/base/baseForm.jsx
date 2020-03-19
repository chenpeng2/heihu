import React, { Component } from 'react';
import _ from 'lodash';

import { thousandBitSeparator } from 'utils/number';
import {
  Icon,
  SimpleTable,
  Input,
  Link,
  FormItem,
  DatePicker,
  Tooltip,
  Searchselect,
  Select,
  AlterableTable,
  InputNumber,
  message,
  Text,
} from 'components';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';
import auth from 'src/utils/auth';
import moment from 'utils/time';
import { replaceSign } from 'src/constants';
import { getProjectsByProjectCodes } from 'src/services/cooperate/project';
import { queryWeighingDefinitionList, queryWeighingDefinitionDetail } from 'src/services/weighing/weighingDefinition';
import { genWeighingInstructions } from 'src/services/weighing/weighingTask';

import { ProjectSelect, WorkstationSelect } from '../../base';
import { formatInstructions } from '../utils';
import {
  WEIGHING_MODE_SEGMENT,
  WEIGHING_MODE_CUSTOM,
  weighingTaskExecutorTypeMap,
  weighingTaskExecutorSelectTypeMap,
  EXECUTOR_TYPE_USER,
} from '../../constants';

const Option = Select.Option;
const baseFormItemStyle = { width: 300 };
const FORM_ITEM_STYLE = {
  // height: 56,
  // marginTop: 16,
  marginBottom: 0,
};
const AMOUNT_STYLE = { display: 'flex', justifyContent: 'flex-end' };

type Props = {
  form: any,
  initialData: {},
  edit: boolean,
};

class WeighingTaskBaseForm extends Component {
  props: Props;
  state = {
    lastKey: 0,
    total: 0,
    projects: [],
    dataSource: [],
    productCode: null,
    ebomVersion: null,
    projectCodes: [],
    expandedRowKeys: [],
    expandedDataSource: [],
    weighingDefinitions: [],
    weighingWorkstation: [],
    weighingDefinitionDetail: {},
  };

  componentDidMount() {
    const { initialData } = this.props;
    this.setInitialData(initialData);
  }

  shouldComponentUpdate = (nextProps, nextState, nextContent) => {
    const data = _.get(this.props, 'initialData');
    const nextData = _.get(nextProps, 'initialData');
    if (!_.isEqual(data, nextData) && !_.isEmpty(nextData)) {
      this.setInitialData(nextData);
    }
    return true;
  };

  formatInitialData = data => {
    const {
      planBeginTime,
      planEndTime,
      instructions,
      userChooseMode,
      userChooseId,
      executorName,
      userGroupName,
    } = data;

    data.planBeginTime = planBeginTime ? moment(planBeginTime) : null;
    data.planEndTime = planEndTime ? moment(planEndTime) : null;
    data.executorType = userChooseMode;
    data.executor = { key: userChooseId, label: userChooseMode === EXECUTOR_TYPE_USER ? executorName : userGroupName };

    const dataSource = formatInstructions(instructions);
    this.setState({ dataSource });
    this.setExpandedRowKeys(dataSource);

    return data;
  };

  setInitialData = data => {
    if (!_.isEmpty(data)) {
      const formated = this.formatInitialData(data);
      this.props.form.setFieldsValue(formated);
    }
  };

  getInstructionColumns = () => {
    const {
      form: { getFieldDecorator },
    } = this.props;

    return [
      {
        title: '',
        key: 'params',
        dataIndex: 'params',
        render: (data, record) => {
          const { projectCode, materialUnit, materialCode, materialName, children, key, weighingObjectId } = record;

          if (!children) return null;

          return (
            <FormItem style={{ display: 'none' }}>
              {getFieldDecorator(`${key}.weighingObjectId`, {
                initialValue: weighingObjectId,
              })(<Input />)}
              {getFieldDecorator(`${key}.projectCode`, {
                initialValue: projectCode,
              })(<Input />)}
              {getFieldDecorator(`${key}.materialCode`, {
                initialValue: materialCode,
              })(<Input />)}
              {getFieldDecorator(`${key}.materialUnit`, {
                initialValue: materialUnit,
              })(<Input />)}
              {getFieldDecorator(`${key}.materialName`, {
                initialValue: materialName,
              })(<Input />)}
            </FormItem>
          );
        },
      },
      {
        title: <Text style={{ paddingLeft: 20 }}>称量顺序</Text>,
        key: 'instructionOrder',
        dataIndex: 'instructionOrder',
        width: 90,
        render: (order, record, index) => {
          const { key, children, parentKey, weighingMode } = record;
          if (!parentKey || weighingMode === 2) return null;

          return (
            <FormItem style={{ paddingLeft: 20, ...FORM_ITEM_STYLE, marginTop: '-2px' }}>
              <Icon
                style={{ paddingRight: 5, cursor: 'pointer' }}
                type="minus-circle"
                onClick={() => this.handleDelete(parentKey, key)}
              />
              {index + 1}
            </FormItem>
          );
        },
      },
      {
        title: '物料编号 | 物料名称',
        key: 'materialName',
        dataIndex: 'materialName',
        width: 300,
        render: (materialName, record, index) => {
          const { materialCode, projectCode, parentKey } = record;
          const project = parentKey ? '' : `(${projectCode})`;

          return <div>{`${materialCode || replaceSign}/${materialName || replaceSign}${project}`}</div>;
        },
      },
      {
        title: '计划数量',
        key: 'num',
        dataIndex: 'num',
        align: 'right',
        width: 130,
        render: (num, record, index) => {
          const { parentKey, key, weighingMode } = record;
          if (!parentKey) {
            return (
              <FormItem style={{ ...FORM_ITEM_STYLE, display: 'flex', justifyContent: 'flex-end' }}>
                {thousandBitSeparator(num)}
              </FormItem>
            );
          }

          const inputNumber = (
            <FormItem style={FORM_ITEM_STYLE}>
              {getFieldDecorator(`${key}.num`, {
                initialValue: num,
                rules: [
                  {
                    required: true,
                    message: '计划数量必填',
                  },
                  {
                    validator: (rule, value, cb) => {
                      if (typeof value === 'number' && value <= 0) {
                        if (weighingMode !== WEIGHING_MODE_CUSTOM) {
                          cb('计划数量需大于0');
                        }
                      }
                      cb();
                    },
                  },
                ],
              })(<InputNumber disabled={weighingMode === WEIGHING_MODE_CUSTOM} style={{ width: 120 }} />)}
            </FormItem>
          );

          if (weighingMode === 2) {
            return (
              <div style={{ ...FORM_ITEM_STYLE, display: 'flex', justifyContent: 'flex-end' }}>
                {thousandBitSeparator(num)}
                <div style={{ display: 'none' }}>{inputNumber}</div>
              </div>
            );
          }

          return inputNumber;
        },
      },
      {
        title: '单位',
        key: 'materialUnit',
        dataIndex: 'materialUnit',
        width: 100,
        render: (materialUnit, record) => {
          return (
            <FormItem style={FORM_ITEM_STYLE}>
              <Tooltip text={materialUnit} length={8} />
            </FormItem>
          );
        },
      },
      {
        title: '上限',
        key: 'upperLimit',
        dataIndex: 'upperLimit',
        align: 'right',
        width: 100,
        render: (upperLimit, record) => {
          const { weighingMode, parentKey } = record;
          if (!parentKey && weighingMode === 2) return replaceSign;

          return (
            <FormItem style={{ ...FORM_ITEM_STYLE, ...AMOUNT_STYLE }}>{thousandBitSeparator(upperLimit)}</FormItem>
          );
        },
      },
      {
        title: '下限',
        key: 'lowerLimit',
        dataIndex: 'lowerLimit',
        align: 'right',
        width: 100,
        render: (lowerLimit, record) => {
          const { weighingMode, parentKey } = record;
          if (!parentKey && weighingMode === 2) return replaceSign;

          return (
            <FormItem style={{ ...FORM_ITEM_STYLE, ...AMOUNT_STYLE }}>{thousandBitSeparator(lowerLimit)}</FormItem>
          );
        },
      },
      {
        title: '操作',
        key: 'actions',
        dataIndex: 'actions',
        width: 80,
        render: (data, record, index) => {
          const { parentKey, weighingMode } = record;
          return parentKey || [WEIGHING_MODE_SEGMENT, WEIGHING_MODE_CUSTOM].includes(weighingMode) ? null : (
            <Link onClick={() => this.addExpandedRow(_.get(record, 'key'))}>添加</Link>
          );
        },
      },
    ];
  };

  handleDelete = (parentKey, key) => {
    const { dataSource } = this.state;

    const _dataSource =
      dataSource &&
      dataSource.map(item => {
        const { children, ...rest } = item;

        if (item && item.key === parentKey) {
          const data = _.get(item, 'children', []).filter(child => child.key !== key);
          const res = Array.isArray(data) && data.length > 0 ? { children: data, ...rest } : { ...rest };
          return res;
        }

        return item;
      });

    this.setState({ dataSource: _dataSource });
  };

  getWeighingDefinitions = async ({ ebomVersion, productCode, ...params }) => {
    // 过滤: 停用中的称量定义
    await queryWeighingDefinitionList({ ebomVersion, productCode, status: 1, ...params })
      .then(res => {
        const data = _.get(res, 'data.data');

        if (data && data.length === 0) {
          message.error(`物料清单<${ebomVersion}>没有定义任何启用中的称量定义`);
          return;
        }
        if (params && !params.workstationId) {
          // 若参数中不带工位做过滤，则需要更新称量工位下拉选项
          this.setState({
            weighingWorkstation:
              data && data.map(x => ({ key: _.get(x, 'workstation.id'), label: _.get(x, 'workstation.name') })),
          });
        }
        if (params && params.workstationId) {
          this.setState({
            weighingDefinition: data && data[0],
          });
        }
        this.setState({
          ebomVersion,
          productCode,
        });
      })
      .catch(err => console.log(err));
  };

  getWeighingDefinitionDetail = async params => {
    const id = _.get(this.state, 'weighingDefinition.id');
    if (!id) return;

    await queryWeighingDefinitionDetail(id, params)
      .then(res => {
        const data = _.get(res, 'data.data');
        this.setState({ weighingDefinitionDetail: data });
      })
      .catch(err => console.log(err));
  };

  getEbomByProjectCodes = async projectCodes => {
    if (projectCodes && projectCodes.length > 0) {
      await getProjectsByProjectCodes(projectCodes)
        .then(res => {
          const data = _.get(res, 'data.data');
          if (data && data.length > 0) {
            const ebomVersions = data.map(x => {
              const ebomVersion = _.get(x, 'ebom.version');
              if (!ebomVersion) message.error(`项目<${x && x.projectCode}>没有配置物料清单`);
              return ebomVersion;
            });
            const productCodes = data.map(x => _.get(x, 'product.code'));
            const _uniqEbom = _.uniq(ebomVersions);
            const _uniqProductCode = _.uniq(productCodes);
            if (_uniqProductCode && _uniqProductCode.length > 1) {
              message.error('所选项目的产出物料不相同');
            } else if (_uniqEbom && _uniqEbom.length > 1) {
              message.error('所选项目的物料清单不相同');
            } else {
              this.setState({ projects: data, projectCodes });
              this.getWeighingDefinitions({
                ebomVersion: _uniqEbom && _uniqEbom[0],
                productCode: _uniqProductCode && _uniqProductCode[0],
              });
            }
          }
        })
        .catch(err => console.log(err));
    }
  };

  setDataSource = () => {
    const { projects, weighingDefinitionDetail } = this.state;
    const weighingObjects = _.get(weighingDefinitionDetail, 'weighingObjects');
    const dataSource = [];

    if (weighingObjects && weighingObjects.length > 0) {
      // 因为此处前提是多个项目都是同一个物料清单，故取第一个项目的物料清单做样本
      const ebomMaterialList = _.get(projects[0], 'ebom.rawMaterialList');

      projects.forEach(project => {
        const { amountProductPlanned, projectCode } = project;

        weighingObjects.forEach(object => {
          const material = _.get(object, 'material');

          dataSource.push({
            projectCode,
            key: `${projectCode}-${_.get(material, 'code')}`,
            ...object,
          });
        });
      });
    }

    this.setState({ dataSource });
  };

  handleProjectChange = v => {
    const workstationId = this.props.form.getFieldValue('workstationId');
    this.genWeighingInstructions({ projectCodes: v, workstationId });
  };

  handleWorkStationChange = (v, opts) => {
    const projectCodes = this.props.form.getFieldValue('projectCodes');
    this.genWeighingInstructions({ projectCodes, workstationId: v });
  };

  genWeighingInstructions = async ({ projectCodes = [], workstationId }) => {
    this.setState({ dataSource: [] });

    if (_.get(projectCodes, 'length') && workstationId) {
      await genWeighingInstructions({ workstationId, projectCodes })
        .then(res => {
          const data = _.get(res, 'data.data');
          const dataSource = formatInstructions(data);
          this.setExpandedRowKeys(dataSource);
          this.setState({ dataSource });
        })
        .catch(err => console.log(err));
    }
  };

  addExpandedRow = key => {
    const { dataSource, lastKey } = this.state;

    if (dataSource && dataSource.length > 0) {
      const _dataSource = dataSource.map(item => {
        const { lastChildKey } = item;
        if (item && item.key === key) {
          const { num, instructionOrder, children, expanded, key, weighingObjectId, baseChild, ...parentData } = item;

          const child = {
            ...baseChild, // 存了细分的一些基础信息
            parentKey: key,
            key: `${key}.segments[${lastChildKey}]`,
            instructionOrder: _.get(children, 'length', 0) + 1,
            num: null,
          };
          const newChildren = Array.isArray(children) ? [...children, child] : [child];

          return { ...item, children: newChildren, expanded: true, lastChildKey: lastChildKey + 1 };
        }

        return item;
      });

      this.setState({ dataSource: _dataSource });
    }
  };

  setExpandedRowKeys = dataSource => {
    const expandedRows = dataSource && dataSource.filter(({ expanded }) => expanded);
    const expandedRowKeys = expandedRows && expandedRows.map(({ key }) => key);

    this.setState({ expandedRowKeys });
  };

  onExpand = (expanded, record) => {
    const { dataSource } = this.state;
    const _dataSource =
      dataSource &&
      dataSource.map(item => {
        const { key, expanded } = item;

        if (record && record.key === key) {
          return {
            ...item,
            expanded: !expanded,
          };
        }
        return item;
      });
    this.setExpandedRowKeys(_dataSource);

    this.setState({ dataSource: _dataSource });
  };

  disabledDate = current => {
    // Can not select days before today and today
    return current && current < moment().endOf('day');
  };

  renderExpandedRow = (record, index, indent, expanded) => {
    const { form } = this.props;
    const { dataSource } = this.state;
    const data = dataSource && dataSource.map(x => _.get(x, 'segement'));

    return (
      <AlterableTable
        showHeader={false}
        footer={null}
        form={form}
        rowKey={record => record.key}
        scroll={{ x: true }}
        columns={this.getSegmentColumns()}
        dataSource={data}
      />
    );
  };

  clearExecutor = () => {
    this.props.form.resetFields(['executor']);
    this.props.form.setFieldsValue({ executor: undefined });
  };

  render() {
    const {
      form: { getFieldDecorator, getFieldValue },
      edit,
    } = this.props;
    const { dataSource, total, expandedRowKeys } = this.state;

    return (
      <div style={{ padding: '0 20px' }}>
        <FormItem label="生产项目">
          {getFieldDecorator('projectCodes', {
            rules: [
              {
                required: true,
                message: '生产项目不能为空',
              },
            ],
          })(
            <ProjectSelect
              mode="multiple"
              labelInValue={false}
              placeholder="请选择生产项目"
              style={baseFormItemStyle}
              onChange={this.handleProjectChange}
              disabled={edit}
            />,
          )}
        </FormItem>
        <FormItem label="称量工位">
          {getFieldDecorator('workstationId', {
            rules: [
              {
                required: true,
                message: '称量工位不能为空',
              },
            ],
          })(
            <WorkstationSelect
              placeholder="请选择称量工位"
              style={baseFormItemStyle}
              onChange={this.handleWorkStationChange}
            />,
          )}
        </FormItem>
        <FormItem label="执行人">
          <React.Fragment>
            {getFieldDecorator('executorType', {
              initialValue: EXECUTOR_TYPE_USER,
            })(
              <Select placeholder="用户/用户组" style={{ width: 110, marginRight: 10 }} onChange={this.clearExecutor}>
                {Object.keys(weighingTaskExecutorTypeMap).map(key => (
                  <Option key={Number(key)} value={Number(key)}>
                    {changeChineseToLocaleWithoutIntl(weighingTaskExecutorTypeMap[key])}
                  </Option>
                ))}
              </Select>,
            )}
            {getFieldDecorator('executor', {})(
              <Searchselect
                loadOnFocus
                style={{ width: 180 }}
                mode={getFieldValue('executorType') === EXECUTOR_TYPE_USER ? null : 'mulitple'}
                params={
                  getFieldValue('executorType') === EXECUTOR_TYPE_USER
                    ? { authorities: auth.WEB_OPERATE_WEIGH_TASK, active: true }
                    : { active: true }
                }
                type={weighingTaskExecutorSelectTypeMap[getFieldValue('executorType')]}
              />,
            )}
          </React.Fragment>
        </FormItem>
        <FormItem label="计划开始时间">
          {getFieldDecorator('planBeginTime', {
            rules: [
              {
                required: true,
                message: '计划开始时间不能为空',
              },
              {
                validator: (rule, value, cb) => {
                  const planEndTime = this.props.form.getFieldValue('planEndTime');
                  if (value > planEndTime) {
                    cb('计划开始时间不能晚于计划结束时间');
                  }
                  cb();
                },
              },
            ],
          })(<DatePicker placeholder="计划开始时间" format="YYYY-MM-DD" style={baseFormItemStyle} />)}
        </FormItem>
        <FormItem label="计划结束时间">
          {getFieldDecorator('planEndTime', {
            rules: [
              {
                required: true,
                message: '计划结束时间不能为空',
              },
              {
                validator: (rule, value, cb) => {
                  const planBeginTime = this.props.form.getFieldValue('planBeginTime');
                  if (value < planBeginTime) {
                    cb('计划结束时间不能早于计划开始时间');
                  }
                  cb();
                },
              },
            ],
          })(<DatePicker placeholder="计划结束时间" format="YYYY-MM-DD" style={baseFormItemStyle} />)}
        </FormItem>
        <FormItem label="称量指令" required>
          <SimpleTable
            style={{ maxWidth: 920, margin: 0 }}
            scroll={{ x: true }}
            dataSource={dataSource}
            rowKey={record => record.key}
            expandedRowKeys={expandedRowKeys}
            onExpand={this.onExpand}
            columns={this.getInstructionColumns()}
            total={total}
            pagination={false}
          />
        </FormItem>
      </div>
    );
  }
}

export default WeighingTaskBaseForm;
