import React, { Component } from 'react';
import _ from 'lodash';

import { withForm, FormItem, Form, Select } from 'src/components';
import SearchSelect from 'src/components/select/searchSelect';
import { arrayIsEmpty } from 'utils/array';
import { getMboms, getMBomById } from 'src/services/bom/mbom';
import { getProcessRoutingByCode } from 'src/services/bom/processRouting';
import { queryProcess } from 'src/services/process';
import {
  getOrganizationConfigFromLocalStorage,
  ORGANIZATION_CONFIG,
  TASK_DISPATCH_TYPE,
} from 'src/utils/organizationConfig';

const Option = Select.Option;

export const extraSearchForMBom = async params => {
  const { search, ...rest } = params || {};
  const res = await getMboms({ materialCodeSearch: search, ...rest });
  const { data } = res;
  const { data: mBomData } = data;

  if (Array.isArray(mBomData)) {
    return mBomData.map(({ materialName, materialCode, version, id }) => {
      return {
        key: id,
        label: `${materialCode}/${materialName}/${version}`,
      };
    });
  }
  return [];
};

export const extraSearchForProcess = async (type, params, options) => {
  if (!type) return null;

  if (type === 'process') {
    const res = await queryProcess(params);
    const { data } = res;
    const { data: processData } = data;

    if (Array.isArray(processData)) {
      return processData.map(({ code, name }) => {
        return {
          key: code,
          label: `${code}/${name}`,
        };
      });
    }
  }

  if (type === 'mBom') {
    const { mBomId } = options || {};
    if (!mBomId) return null;

    const mBom = await getMBomById(mBomId);
    const { data } = mBom || {};
    const { data: mBomData } = data || {};
    const { processList } = mBomData || {};

    if (Array.isArray(processList)) {
      const res = [];
      processList.forEach(({ nodes }) => {
        if (!arrayIsEmpty(nodes)) {
          nodes.forEach(node => {
            const { nodeCode: processSeq, process, outputMaterial } = node;
            // 工序可能是一样的。需要利用nodeCode来区分
            const { code, name } = process || {};
            res.push({
              key: `${processSeq}/${code}`,
              label: `${processSeq}/${code}/${name}`,
              outputMaterial,
              data: node,
            });
          });
        }
      });

      return res;
    }
  }

  if (type === 'processRouting') {
    const { processRoutingCode } = options || {};
    if (!processRoutingCode) return null;

    const processRouting = await getProcessRoutingByCode({ code: processRoutingCode });
    const { data } = processRouting || {};
    const { data: processRoutingData } = data || {};
    const { processList } = processRoutingData || {};

    if (Array.isArray(processList)) {
      const res = [];
      processList.forEach(({ nodes }) => {
        nodes.forEach(({ nodeCode: processSeq, processCode, processName }) => {
          // 工序可能是一样的。需要利用nodeCode来区分
          res.push({ key: `${processSeq}/${processCode}`, label: `${processSeq}/${processCode}/${processName}` });
        });
      });

      return res;
    }
  }

  return null;
};

// 选择工序的范围,
const getTypeOptions = () => {
  const typeOptions = {
    process: '直接选择工序',
    processRouting: '从工艺路线中选择工序',
    mBom: '从生产BOM中选择工序',
  };

  // 需要注意的是type的范围和工厂的任务派发方式有关联
  const config = getOrganizationConfigFromLocalStorage();
  const configValue = config[ORGANIZATION_CONFIG.taskDispatchType].configValue;

  if (configValue && configValue === TASK_DISPATCH_TYPE.workerWeak) {
    delete typeOptions.processRouting;
    delete typeOptions.mBom;
  }

  return typeOptions;
};

type Props = {
  form: {},
  selectStyle: {},
  value: {},
  onChangeForProcess: () => {},
};

class ProcessSelect extends Component {
  props: Props;
  state = {
    type: null, // 选择工序的范围
    mBomId: null, // 选中的mBom
    processRoutingCode: null, // 选中的工艺路线
  };

  componentWillReceiveProps(nextProps) {
    const { value, form } = nextProps;
    const { value: valueNow } = this.props;

    const { setFieldsValue } = form;
    const { type, mBom, processRouting, process } = value || {};

    if (!_.isEqual(value, valueNow)) {
      this.setState(
        {
          type,
          mBomId: mBom ? mBom.key : null,
          processRoutingCode: processRouting ? processRouting.key : null,
        },
        () => {
          setFieldsValue({
            type,
            mBom,
            processRouting,
            process,
          });
        },
      );
    }
  }

  render() {
    const { type, mBomId, processRoutingCode } = this.state;
    const { form, selectStyle, onChangeForProcess, baseForm } = this.props;
    const { getFieldDecorator, resetFields, setFieldsValue } = form;

    return (
      <Form layout={'inline'}>
        <FormItem>
          {getFieldDecorator('type', {
            onChange: value => {
              // type的改变需要重新设置值
              resetFields(['processRouting', 'mBom', 'process']);
              baseForm.resetFields(['material']);
              this.setState({ type: value });
            },
          })(
            <Select allowClear style={selectStyle}>
              {Object.entries(getTypeOptions()).map(([value, label]) => {
                return (
                  <Option key={value} value={value}>
                    {label}
                  </Option>
                );
              })}
            </Select>,
          )}
        </FormItem>
        {type === 'processRouting' ? (
          <FormItem>
            {getFieldDecorator('processRouting', {
              onChange: value => {
                const { key } = value || {};

                // 重新填写工序
                baseForm.resetFields(['material']);
                resetFields(['process']);
                this.setState({ processRoutingCode: key, mBomId: null });
              },
            })(
              <SearchSelect
                loadOnFocus
                params={{ status: 1 }}
                style={selectStyle}
                type={'processRouting'}
                placeholder={'工艺路线编号/名称'}
              />,
            )}
          </FormItem>
        ) : null}
        {type === 'mBom' ? (
          <FormItem>
            {getFieldDecorator('mBom', {
              onChange: value => {
                const { key } = value || {};
                baseForm.resetFields(['material']);
                // 重新填写工序
                resetFields(['process']);
                this.setState({ mBomId: key, processRoutingCode: null });
              },
            })(
              <SearchSelect
                loadOnFocus
                params={{ status: 1 }}
                style={selectStyle}
                extraSearch={extraSearchForMBom}
                placeholder={'生产BOM成品物料编号/物料名称/版本号'}
              />,
            )}
          </FormItem>
        ) : null}
        {type ? (
          <FormItem>
            {getFieldDecorator('process')(
              <SearchSelect
                loadOnFocus
                onChange={(value, option) => {
                  baseForm.resetFields(['material']);
                  onChangeForProcess({
                    ...value,
                    outputMaterial: option.props.outputMaterial,
                    data: option.props.data,
                  });
                }}
                params={{ status: 1 }}
                placeholder={type === 'process' ? '工序编号/名称' : '工序序号/编号/名称'}
                style={selectStyle}
                extraSearch={async searchParams => {
                  const res = await extraSearchForProcess(type, searchParams, { mBomId, processRoutingCode });
                  return res || [];
                }}
              />,
            )}
          </FormItem>
        ) : null}
      </Form>
    );
  }
}

export default withForm(
  {
    onValuesChange: (props, value, allValues) => {
      props.onChange(allValues);
    },
  },
  ProcessSelect,
);
