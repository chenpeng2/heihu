import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { copySopStepTo } from 'services/knowledgeBase/sop';
import { copySopTemplateStepTo } from 'services/knowledgeBase/sopTemplate';
import { openModal, withForm, FormItem, Radio, Select, Icon, Link, Textarea, Tree, message } from 'components';
import SOPCONSTANT from '../../common/SOPConstant';

const RadioGroup = Radio.Group;
const Option = Select.Option;
const TreeNode = Tree.TreeNode;
const { requiredRule } = withForm.rules;
const width = 200;

class CopyComponent extends React.PureComponent {
  state = {
    nextOptionStepListKeys: [0],
    selectedNode: null,
  };

  renderTreeData = treeData => {
    return (
      Array.isArray(treeData) &&
      treeData
        .filter(({ step }) => step && step.type === 2 && step.id !== this.props.stepId)
        .map(({ step, subStepList }) => {
          const { id, name, groupType } = step || {};
          return (
            <TreeNode
              title={
                <span>
                  <Icon
                    iconType="gc"
                    type={groupType === SOPCONSTANT.SOP_STEP_GROUP_TYPE_SERIAL ? 'chuan' : 'bing'}
                    style={{ fontSize: 12, marginRight: 4 }}
                  />
                  {name}
                </span>
              }
              key={id}
              option={{ step, subStepList }}
            >
              {Array.isArray(subStepList) && this.renderTreeData(subStepList)}
            </TreeNode>
          );
        })
    );
  };

  handleSelectTreeNode = (selectedKeys, option) => {
    const selectedNode = _.get(option, 'node.props.option');
    const {
      form: { resetFields },
    } = this.props;
    this.setState({
      selectedNode,
      nextOptionStepListKeys: [0],
    });
    resetFields();
  };

  handleCopy = async () => {
    const {
      form: { validateFields },
      stepId,
      sopId,
      mode,
      onClose,
      copyCallback,
    } = this.props;
    const { selectedNode } = this.state;
    if (!selectedNode) {
      message.error('请选择一个步骤组');
      return;
    }
    validateFields(async (err, values) => {
      const submitValue = {
        ...values,
        nextOptionalStepList: values.nextOptionalStepList && values.nextOptionalStepList.map(({ key }) => key),
      };
      const copyApi = mode === 'sopTemplate' ? copySopTemplateStepTo : copySopStepTo;
      const { data } = await copyApi(
        { id: stepId, parentId: selectedNode.step.id || 0, sopId, sopTemplateId: sopId },
        submitValue,
      );
      onClose();
      message.success('复制成功!');
      copyCallback(data.data.step.id);
    });
  };

  render() {
    const {
      form: { getFieldDecorator, getFieldsValue },
      SOPStepList,
      type,
    } = this.props;
    const { nextOptionStepListKeys, selectedNode } = this.state;
    const { nextLogic, last } = getFieldsValue();
    const isSerialParent = _.get(selectedNode, 'step.groupType') === SOPCONSTANT.SOP_STEP_GROUP_TYPE_SERIAL;
    const showOptionField = isSerialParent && !last && nextLogic === SOPCONSTANT.NEXT_LOGIC_PERSON_SELECT;
    return (
      <div>
        <FormItem label="复制至">
          <Tree onSelect={this.handleSelectTreeNode} defaultExpandAll>
            <TreeNode
              title="根节点"
              key="root"
              option={{ step: { groupType: SOPCONSTANT.SOP_STEP_GROUP_TYPE_SERIAL }, subStepList: SOPStepList }}
            >
              {this.renderTreeData(SOPStepList)}
            </TreeNode>
          </Tree>
        </FormItem>
        {isSerialParent && (
          <FormItem label="终止步骤">
            {getFieldDecorator('last', {
              initialValue: false,
              rules: [requiredRule('终止步骤')],
            })(
              <RadioGroup>
                <Radio value>是</Radio>
                <Radio value={false}>否</Radio>
              </RadioGroup>,
            )}
          </FormItem>
        )}
        {isSerialParent && !last && (
          <FormItem label="后续步骤">
            {getFieldDecorator('nextLogic', {
              initialValue: SOPCONSTANT.NEXT_LOGIC_NEXT,
              rules: [requiredRule('后续步骤')],
            })(
              <Select style={{ width }}>
                {[
                  SOPCONSTANT.NEXT_LOGIC_NEXT,
                  type === SOPCONSTANT.SOP_STEP_TYPE_STEP && SOPCONSTANT.NEXT_LOGIC_PERSON_SELECT,
                  SOPCONSTANT.NEXT_LOGIC_IF_JUDGE,
                ]
                  .filter(n => n)
                  .map(key => (
                    <Option value={key}>{SOPCONSTANT.NextLogic[key]}</Option>
                  ))}
              </Select>,
            )}
          </FormItem>
        )}
        {isSerialParent && showOptionField && (
          <FormItem label="可选步骤">
            {nextOptionStepListKeys.map(key => (
              <div key={key} style={{ display: 'flex', marginBottom: 10 }} className="vertical-center child-gap">
                <FormItem style={{ margin: 0, marginRight: 4 }}>
                  {getFieldDecorator(`nextOptionalStepList[${key}]`, {
                    rules: [{ required: true, message: '可选步骤必填' }],
                    hidden: !showOptionField,
                  })(
                    <Select style={{ width }} labelInValue>
                      {selectedNode.subStepList &&
                        selectedNode.subStepList
                          .filter(({ step: { id } }) => id.toString().indexOf('create') === -1)
                          .map(({ step: { id, name } }) => (
                            <Option key={id} value={id}>
                              {name}
                            </Option>
                          ))}
                    </Select>,
                  )}
                  {nextOptionStepListKeys.length > 1 && (
                    <Icon
                      type="minus-circle"
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        this.setState({
                          nextOptionStepListKeys: nextOptionStepListKeys.filter(value => value !== key),
                        });
                      }}
                    />
                  )}
                </FormItem>
              </div>
            ))}

            <Link
              icon="plus-circle-o"
              onClick={() => {
                this.setState({
                  nextOptionStepListKeys: [
                    ...nextOptionStepListKeys,
                    (nextOptionStepListKeys[nextOptionStepListKeys.length - 1] || 0) + 1,
                  ],
                });
              }}
            >
              添加可选步骤
            </Link>
          </FormItem>
        )}
        {isSerialParent && !last && nextLogic === SOPCONSTANT.NEXT_LOGIC_IF_JUDGE && (
          <FormItem label="执行条件">
            {getFieldDecorator('nextTrigger', {
              rules: [requiredRule('执行条件')],
            })(<Textarea maxLength={1000} style={{ width }} />)}
          </FormItem>
        )}
        <FormItem label="结束后执行">
          {getFieldDecorator('execAfterFinishTrigger')(<Textarea maxLength={1000} style={{ width }} />)}
        </FormItem>
      </div>
    );
  }
}

CopyComponent.propTypes = {
  SOPStepList: PropTypes.array,
  stepId: PropTypes.string,
  sopId: PropTypes.string,
  mode: PropTypes.oneOf(['sop', 'sopTemplate']),
  onClose: PropTypes.func,
  copyCallback: PropTypes.func,
  type: PropTypes.oneOf([SOPCONSTANT.SOP_STEP_TYPE_STEP, SOPCONSTANT.SOP_STEP_TYPE_GROUP]),
};

export default withForm({}, CopyComponent);
