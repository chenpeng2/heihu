import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'src/utils/locale/utils';
import { greyWhite } from 'src/styles/color/index';
import Icon from '../icon';
import ActionButtonGroup from './group';
import styles from './styles.scss';

/**
 * @api {ActionButton} 动作按钮.有独特的按钮样式。
 * @APIGroup ActionButton.
 * @apiParam {Obj} style ActionButton样式,不传为默认样式.
 * @apiParam {String} iconType Icon标签的iconType属性.
 * @apiParam {String} background 当hover为true时,鼠标移上去时的背景颜色.
 * @apiParam {Function} onClick 点击事件处理函数.
 * @apiParam {String} text 按钮文字.
 * @apiParam {React.node} children -.
 * @apiParam {Boolean} hover 可传true或不传,决定当鼠标放上去时button背景色是否变化.
 * @apiParam {String} location
 * 决定borderRadius的位置,borderRadius默认为4,location有四个值'left','right','middle','alone',不传值默认为'alone'.
 * @apiExample {js} Example usage:
 *  <ActionButton
 *    iconType="edit"
 *    location="left"
 *    text="创建物料"
 *    style={{ color: white, backgroundColor: blacklakeGreen }}
 *    onClick={() =>
 *      openModal(
 *        {
 *          title: '创建物料',
 *          footer: null,
 *          width: '60%',
 *          container: CreateMaterial,
 *        },
 *        this.context,
 *      )}
 *  >
 *    <Icon type="plus" />
 *    创建物料
 *  </ActionButton>
 */

type Props = {
  children: any,
  background: string,
  iconType: string,
  click: any,
  text: string,
  style: {},
  hover: boolean,
  location: 'left' | 'middle' | 'right' | 'alone',
  isGcIcon: boolean,
  iconSize: number,
};

const borderRadius = 4;

const defaultContainerStyle = {
  fontSize: 12,
  padding: '2px 8px',
  display: 'inline-block',
  width: 'auto',
  cursor: 'pointer',
};

class ActionButton extends Component {
  props: Props;
  state = {
    backgroundColor: 'transparent',
  };

  render() {
    const {
      children,
      iconType,
      text,
      hover,
      location,
      background,
      click,
      style,
      isGcIcon,
      iconSize,
      intl,
      ...rest
    } = this.props;
    const borderRadiusMap = {
      left: { borderTopLeftRadius: borderRadius, borderBottomLeftRadius: borderRadius },
      right: { borderTopRightRadius: borderRadius, borderBottomRightRadius: borderRadius },
      middle: { borderRadius: 'none' },
      alone: { borderRadius },
    };

    const realBorderRadius = location ? borderRadiusMap[location] : borderRadiusMap.alone;
    return (
      <span
        className={styles.actionButtonContainer}
        onMouseOver={() => {
          if (hover) {
            this.setState({ backgroundColor: background || greyWhite });
          }
        }}
        onMouseOut={() => {
          if (hover) {
            this.setState({ backgroundColor: 'transparent' });
          }
        }}
        style={{
          ...defaultContainerStyle,
          backgroundColor: hover ? this.state.backgroundColor : background || greyWhite,
          ...realBorderRadius,
          ...style,
        }}
        onClick={click}
        {...rest}
      >
        <div style={{ display: 'flex', alignItems: 'stretch', justifyContent: 'space-around' }}>
          {children ? (
            <span>
              {children.length >= 2
                ? children.map((child, index) =>
                    index ? (
                      <span key={index} style={{ paddingLeft: 8 }}>
                        {typeof child === 'string' ? changeChineseToLocale(child, intl) : child || ' '}
                      </span>
                    ) : (
                      child
                    ),
                  )
                : children}
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <span>
                {iconType ? <Icon type={iconType} iconType={isGcIcon ? 'gc' : null} size={iconSize} /> : null}
              </span>
              <span>{typeof text === 'string' ? changeChineseToLocale(text, intl) : text || ' '}</span>
            </span>
          )}
        </div>
      </span>
    );
  }
}

const ActionButtonWithIntl = injectIntl(ActionButton);

ActionButtonWithIntl.Group = ActionButtonGroup;

export default ActionButtonWithIntl;
