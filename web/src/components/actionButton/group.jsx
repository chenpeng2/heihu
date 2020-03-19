import React, { Component } from 'react';
import { deepGrey } from 'src/styles/color/index';

/**
 * @api {ActionButtonGroup} 动作按钮组.
 * @APIGroup ActionButtonGroup.
 * @apiParam {Obj} style -
 * @apiParam {React.node} children -
 * @apiExample {js} Example usage:
 * <ActionButtonGroup key={`action-${record.id}`}>
    <ActionButton
      background={index % 2 === 0 ? middleGrey : null}
      onClick={() => {
        this.context.router.history.push(`/bom/materials/${record.id}`);
      }}
    ><Icon type="file-text" />详情</ActionButton>
    <ActionButton
      background={index % 2 === 0 ? middleGrey : null}
    >
    </ActionButton>
  </ActionButtonGroup>
 */

type Props = {
  children: any,
  style: any,
}

class ActionButtonGroup extends Component {
  props: Props
  state = {}


  render() {
    const { children, style } = this.props;
    if (!children) { return null; }
    const _children = children.filter ? children.filter(child => child) : children;
    const getLocation = (index) => {
      const length = _children.length;
      if (length > 1) {
        if (index === 0) {
          return 'left';
        } else if (index === _children.length - 1) {
          return 'right';
        }
        return 'middle';
      }
      return 'alone';
    };
    return (
      <span
        style={{
          display: 'flex',
          flexDirection: 'row',
          borderRadius: '5px',
          ...style,
        }}
      >
        {
          _children.length >= 2 ? _children.map((child, index) => {
            if (!child) {
              return null;
            }
            const _child = React.cloneElement(child, { location: getLocation(index) });
            return (
              <div
                key={index}
                style={{
                  borderRight: index !== _children.length - 1 ? `1px dashed ${deepGrey}` : 'none',
                }}
              >
                {_child}
              </div>);
          }) : React.cloneElement(_children, { location: getLocation() })
        }
      </span>
    );
  }
}

export default ActionButtonGroup;
