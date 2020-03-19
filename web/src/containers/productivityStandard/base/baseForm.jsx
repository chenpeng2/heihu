/*
 * baseForm为了将创建,编辑标准产能表单中的表单逻辑抽取出来
 * */
import React, { Component } from 'react';
import _ from 'lodash';

import { getProcessRoutingByCode } from 'src/services/bom/processRouting';
import { Form, FormItem, withForm, Select } from 'src/components';
import { getMBomById } from 'src/services/bom/mbom';
import { getProcessDetail } from 'src/services/process';
import SearchSelect from 'src/components/select/searchSelect';
import { getInitialValue } from 'src/containers/productivityStandard/base/util';
import WorkstationAndAreaSelect from 'src/components/select/workstationAndAreaSelect';
import { arrayIsEmpty } from 'utils/array';

import ProcessSelect from './processSelect';
import StandardSelect, { validateFormValue as standardSelectValidate } from './standardSelect';

const FORMITEM_WIDTH = 300;
const DEFAULT_UNIT_NAME = '个';
const Option = Select.Option;

// 获取工位的label和key。工位需要是选中工序的工位
const extraSearchForWorkStation = async (searchParams, options) => {
  const { processSeq, processCode: selectedProcessCode, type, processRoutingCode, mBomId } = options || {};

  if (!selectedProcessCode) return null;

  const res = [];

  // 当直接选择工序的时候
  if (type === 'process') {
    if (!selectedProcessCode) return null;

    const _res = await getProcessDetail(selectedProcessCode);
    const workstations = _.get(_res, 'data.data.workstationDetails');

    if (Array.isArray(workstations)) {
      workstations
        .filter(e => e.status === 1)
        .forEach(item => {
          const { name, id } = item || {};
          res.push({ key: id, label: name });
        });
    }
  }

  // 当选择工艺路线的时候
  if (type === 'processRouting') {
    if (!processRoutingCode) return null;

    const processRouting = await getProcessRoutingByCode({ code: processRoutingCode });
    const { data } = processRouting || {};
    const { data: processRoutingData } = data || {};
    const { processList } = processRoutingData || {};

    if (Array.isArray(processList)) {
      processList.forEach(({ nodes }) => {
        nodes.forEach(({ nodeCode, processCode, workstationDetails }) => {
          if (nodeCode === processSeq && processCode === selectedProcessCode) {
            workstationDetails.forEach(item => {
              const { name, id } = item || {};
              res.push({ key: id, label: name });
            });
          }
        });
      });

      return res;
    }
  }

  // 当选择mBom的时候
  if (type === 'mBom') {
    if (!mBomId) return null;

    const _res = await getMBomById(mBomId);
    const { data } = _res || {};
    const { data: mBomData } = data || {};

    const { processList } = mBomData || {};

    if (Array.isArray(processList)) {
      processList.forEach(({ nodes }) => {
        nodes.forEach(({ nodeCode, processCode, workstationGroupDetails, workstationDetails }) => {
          if (nodeCode === processSeq && processCode === selectedProcessCode) {
            let _workstations = [];

            if (Array.isArray(workstationGroupDetails)) {
              workstationGroupDetails.forEach(({ workstations }) => {
                _workstations = _workstations.concat(workstations);
              });
            }

            if (Array.isArray(workstationDetails)) {
              _workstations = _workstations.concat(workstationDetails);
            }

            _workstations.forEach(item => {
              const { name, id } = item || {};
              res.push({ key: id, label: name });
            });
          }
        });
      });
    }
  }

  return res;
};

const getType = value => {
  if (value.mBomId) {
    return 'mBom';
  } else if (value.processRouteCode) {
    return 'processRouting';
  }
  return 'process';
};

type Props = {
  form: {},
  initialValue: {},
};

class BaseForm extends Component {
  props: Props;
  state = {
    type: null,
    mBomId: null,
    processCode: null,
    processSeq: null,
    materialUnitName: null,
    processRoutingCode: null,
    workstations: [],
  };

  async componentWillReceiveProps(nextProps) {
    const { initialValue, form } = this.props;
    const { initialValue: nextInitialValue } = nextProps || {};

    if (!_.isEqual(nextInitialValue, initialValue)) {
      const { unit, nodeCode: processSeq, processCode, type, processRouteCode: processRoutingCode, mBomId } =
        nextInitialValue || {};
      const workstations = await extraSearchForWorkStation(null, {
        processSeq,
        processCode,
        type: getType(nextInitialValue),
        processRoutingCode,
        mBomId,
      });
      this.setState(
        {
          workstations,
          processRoutingCode,
          materialUnitName: unit,
        },
        () => {
          form.setFieldsValue(getInitialValue(nextInitialValue));
        },
      );
    }
  }

  render() {
    const { mBomId, type, processCode, processSeq, materialUnitName, workstations, toolings } = this.state;
    const { form } = this.props;
    const { getFieldDecorator, resetFields, setFieldsValue } = form || {};

    return (
      <div>
        <Form>
          <FormItem label={'工序'}>
            {getFieldDecorator('processData', {
              rules: [
                {
                  required: true,
                  message: '工序必填',
                },
              ],
              onChange: async value => {
                const { type, mBom, process, processRouting } = value;
                // resetFields(['material']);
                // 获取工序数据
                const processKey = process ? process.key.split('/') : null;

                let processSeq = null;
                let processCode = null;
                if (type === 'mBom' || type === 'processRouting') {
                  processSeq = processKey ? processKey[0] : null;
                  processCode = processKey ? processKey[1] : null;
                }
                if (type === 'process') {
                  processCode = process ? process.key : null;
                }
                const workstations = await extraSearchForWorkStation(null, {
                  processSeq,
                  processCode,
                  type,
                  processRoutingCode: processRouting ? processRouting.key : null,
                  mBomId: mBom ? mBom.key : null,
                });

                this.setState({
                  type,
                  mBomId: mBom ? mBom.key : null,
                  workstations,
                  processSeq,
                  processCode,
                  processRoutingCode: processRouting ? processRouting.key : null,
                });
              },
            })(
              <ProcessSelect
                baseForm={form}
                onChangeForProcess={value => {
                  const { outputMaterial, data } = value || {};
                  if (_.get(outputMaterial, 'material.code')) {
                    const {
                      material: { code, name },
                    } = outputMaterial;
                    setFieldsValue({
                      material: {
                        key: code,
                        label: `${name}/${code}`,
                      },
                    });
                  }
                  const toolings = _.get(data, 'toolings');
                  this.setState({
                    materialUnitName: _.get(outputMaterial, 'material.unitName'),
                    toolings: Array.isArray(toolings) && toolings.filter(e => _.get(e, 'tooling.toolingType') === 2),
                  });
                  // 工序改变的时候，清空工位
                  resetFields(['workstation']);
                }}
                selectStyle={{ width: FORMITEM_WIDTH }}
              />,
            )}
          </FormItem>
          <FormItem label={'物料'}>
            {getFieldDecorator('material', {
              rules: [
                {
                  validator: (rule, value, callback) => {
                    if (type === 'mBom' && !processCode) {
                      callback('从生产Bom中选择工序后，才可以选择物料');
                    }
                    callback();
                  },
                },
              ],
            })(
              <SearchSelect
                loadOnFocus
                type="materialBySearch"
                disabled={type === 'mBom'} // 当有mBom的时候，物料不可选
                placeholder={mBomId ? null : '请填写'}
                onChange={(value, options) => {
                  if (!value) {
                    this.setState({
                      materialUnitName: '个',
                    });
                  } else {
                    this.setState({
                      materialUnitName: _.get(options, 'props.data.unitName'),
                    });
                  }
                }}
                style={{ width: FORMITEM_WIDTH }}
              />,
            )}
          </FormItem>
          {mBomId && !arrayIsEmpty(toolings) ? (
            <FormItem label={'模具'}>
              {getFieldDecorator('toolingCode', {
                rules: [{ required: mBomId && !arrayIsEmpty(toolings), message: '模具必填' }],
              })(
                <Select style={{ width: FORMITEM_WIDTH }}>
                  {toolings.map(({ tooling = {} }) => (
                    <Option value={tooling.code}>{`${tooling.code}/${tooling.name}`}</Option>
                  ))}
                </Select>,
              )}
            </FormItem>
          ) : null}
          <FormItem label={'工位'}>
            {getFieldDecorator('workstation', {
              rules: [
                {
                  required: true,
                  message: '工位必填',
                },
              ],
            })(
              <WorkstationAndAreaSelect
                labelInValue
                onlyWorkstations
                key={`${type}-${processCode}`}
                options={workstations}
                style={{ width: FORMITEM_WIDTH }}
              />,
            )}
          </FormItem>
          <FormItem label={'标准'}>
            {getFieldDecorator('standard', {
              rules: [
                {
                  required: true,
                  message: '标准必填',
                },
                {
                  validator: (rule, values, cb) => {
                    const error = standardSelectValidate(values);

                    if (error) cb(error);
                    cb();
                  },
                },
              ],
            })(
              <StandardSelect
                wrappedComponentRef={inst => (this.standardForm = inst)}
                selectStyle={{ width: FORMITEM_WIDTH }}
                materialUnitName={materialUnitName}
              />,
            )}
          </FormItem>
        </Form>
      </div>
    );
  }
}

export default withForm({}, BaseForm);
