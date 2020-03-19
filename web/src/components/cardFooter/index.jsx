import React, { Component } from 'react';
import RowLayout from 'layouts/rowLayout';

/**
 * @api {CardFooter} 卡片底部.
 * @APIGroup CardFooter.
 * @apiParam {Obj} style -
 * @apiParam {any} data 底部要展示的信息
 * @apiParam {any} extra 额外要展示的,可不填
 * @apiExample {js} Example usage:
 * <CardFooter data={{ 创建时间: formatDateHour(plan.createdAt), 派发人: plan.creator.name }} />
 */

const footerItemStyle = {
  color: '#182027',
  opacity: 0.35,
  marginLeft: '10px',
};
const defaultContainerSytle = {
  paddingRight: 20,
};

class CardFooter extends Component {
  props: {
    style: any,
    data: any,
    extra: any,
  };
  state = {};

  render() {
    const { style, data, extra } = this.props;
    return (
      <div style={{ ...defaultContainerSytle, ...style }}>
        <RowLayout style={{ alignItems: 'center' }}>
          <div />
          <div />
          <div />
          {data
            ? Object.entries(data).map(([key, value]) => {
              return (
                <div key={`${key}${value}`}>
                  <span style={footerItemStyle}>{key}</span>
                  <span style={footerItemStyle}>{value}</span>
                </div>
              );
            })
            : null}
          {extra}
        </RowLayout>
      </div>
    );
  }
}

export default CardFooter;
