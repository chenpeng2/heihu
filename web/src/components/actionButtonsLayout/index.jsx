import React, { Component } from 'react';
import { deepGrey } from 'src/styles/color/index';

/**
 * @api {ActionButtonLayout} 动作按钮布局.
 * @APIGroup ActionButtonLayout.
 * @apiParam {Array} buttons 按钮数组遍历后按布局排列
 * @apiExample {js} Example usage:
 * <ActionButtonsLayout
    buttons={[
      <ActionButton
        iconType="edit"
        location="left"
        click={() => {
          openModal({
            title: '编辑采购任务',
            container: EditPsTask,
            footer: null,
            width: '60%',
          }, this.context, { params: { psTaskId: plan.psTask.id } });
        }}
      />,
      <Popconfirm
        title="确认要删除吗？"
        onConfirm={() => {
          );
        }}
        okText="确认"
        cancelText="取消"
      >
        <ActionButton location="right" iconType="delete" />
      </Popconfirm>,
    ]}
  />
 */

type Props = {
  buttons: [],
};

class ActionButtonsLayout extends Component {
  props: Props;
  state = {};

  render() {
    const { buttons } = this.props;
    return (
      <span
        style={{
          display: 'flex',
          flexDirection: 'row',
          borderRadius: '5px',
        }}
      >
        {buttons.map((item, index) => {
          return (
            <div
              key={index}
              style={{
                borderRight: index !== buttons.length - 1 ? `1px dashed ${deepGrey}` : 'none',
              }}
            >
              {item}
            </div>
          );
        })}
      </span>
    );
  }
}

export default ActionButtonsLayout;
