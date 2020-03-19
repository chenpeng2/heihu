import React, { Component } from 'react';
import { white, borderGrey } from 'src/styles/color';

/**
 * @api {BlPopover} hover时显现组件.
 * @APIGroup BlPopover.
 * @apiParam {React.node} hoverComponent hover时的显现组件.
 * @apiParam {Obj} style -
 * @apiParam {React.node} children children中的某个有isHoverSwitch为true它就是hover的开关.
 * @apiExample {js} Example usage:
 * <BlPopover style={{ display: 'flex' }} hoverComponent={this.getHoverComponent()}>
    <div style={{ fontSize: 20, ...containerStyle }} isHoverSwitch>
      <span style={{ marginRight: 16 }}> {product.code} </span>
      <Icon type="caret-down" />
    </div>
   </BlPopover>
 */

const HOVER_SWITCH_HEIGHT = 78;
const HOVER_SWITCH_WIDTH = 550;

type Props = {
  hoverComponent: any,
  children: any,
  style: {},
  onMouseLeave: () => {},
};

class BlPopover extends Component {
  props: Props;
  state = {
    hover: false,
  };

  renderOriginalChildren = children => {
    // 渲染原本的children
    const _children = !children.map ? [children] : children;
    return _children.map(node => {
      if (!node) {
        return null;
      }
      const { onMouseEnter: originOnMouseEnter, style: originStyle } = node.props;
      const containerStyle = {
        display: 'inline-block',
        verticalAlign: 'top',
        boxSizing: 'border-box',
        padding: '16px 0 4px 20px',
      };

      // 如果children中的某个有isHoverSwitch为true它就是hover的开关
      if (node.props.isHoverSwitch) {
        return React.cloneElement(node, {
          onMouseEnter: () => {
            this.setState(
              {
                hover: true,
              },
              () => {
                if (originOnMouseEnter) {
                  originOnMouseEnter();
                }
              },
            );
          },
          style: Object.assign(
            {},
            {
              ...containerStyle,
              height: HOVER_SWITCH_HEIGHT,
              width: HOVER_SWITCH_WIDTH,
            },
            originStyle || {},
          ),
        });
      }

      return React.cloneElement(node, {
        style: {
          ...originStyle,
          ...containerStyle,
        },
      });
    });
  };

  renderHoverComponent = hoverComponent => {
    const { hover } = this.state;

    if (hover) {
      return React.cloneElement(hoverComponent, {
        // 渲染hoverComponent
        style: {
          position: 'absolute',
          top: HOVER_SWITCH_HEIGHT - 1,
          left: 0,
          width: '100%',
          zIndex: 999,
          background: white,
          boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
          padding: '20px 0px',
          borderTop: `1px solid ${borderGrey}`,
        },
      });
    }

    return null;
  };

  render() {
    const { children, hoverComponent, style, onMouseLeave: originOnMouseLeave } = this.props;
    return (
      <div
        style={Object.assign({}, { position: 'relative' }, style)}
        onMouseLeave={() => {
          this.setState({ hover: false, hoverSwitchStyle: {} }, () => {
            if (originOnMouseLeave) {
              originOnMouseLeave();
            }
          });
        }}
      >
        {this.renderOriginalChildren(children)}
        {this.renderHoverComponent(hoverComponent)}
      </div>
    );
  }
}

export default BlPopover;
