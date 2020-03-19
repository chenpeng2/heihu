import React, { Component } from 'react';
import Icon from 'components/icon';
import { deepGreen, darkGrey, middleGrey } from 'src/styles/color/index';

/**
 * @api {detailPageHeader} 页面顶部的信息展示,此组件展示信息分两种,一种显示编号和名称,一种显示编号和地址.
 * @APIGroup detailPageHeader.
 * @apiParam {String} title 第一行信息展示.
 * @apiParam {String} subtitle 第二行信息(字体较小)展示.
 * @apiParam {String} location 地址信息的展示.
 * @apiParam {Boolean} clearBorder 是否清除组件左侧长条形div,不传默认不清除.
 * @apiParam {Obj} style -
 * @apiExample {js} Example usage:
 * <DetailPageHeader style={{ paddingBottom: 0 }} title={productOrder.productOrderNo} />
 */

type Props = {
  title: string,
  subtitle: string,
  location: string,
  style: {},
  icon: any,
  titleStyle: {},
  subtitleStyle: {},
};

class DetailPageHeader extends Component {
  props: Props;
  state = {};

  render() {
    const { title, subtitle, titleStyle, subtitleStyle, location, style, icon } = this.props;

    return (
      <div style={{ paddingLeft: 20, marginBottom: 20 }}>
        <div
          style={{
            display: 'flex',
            padding: '20px 0 0 0',
            alignItems: 'center',
            ...style,
          }}
        >
          {icon}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, color: deepGreen, ...titleStyle }}>{title}</div>
            {subtitle && <div style={{ fontSize: 14, color: darkGrey, ...subtitleStyle }}>{subtitle}</div>}
          </div>
        </div>
        {location ? (
          <div style={{ fontSize: 14, ...subtitleStyle }}>
            <Icon color={middleGrey} type="environment-o" />
            <span style={{ paddingLeft: 10, color: middleGrey }}>{location}</span>
          </div>
        ) : null}
      </div>
    );
  }
}

export default DetailPageHeader;
