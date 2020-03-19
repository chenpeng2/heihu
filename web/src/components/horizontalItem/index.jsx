import React, { Component } from 'react';
import _ from 'lodash';
import { Row, Col } from 'antd';
import DetailpageItem from './detailPageItem';

/**
 * @api {HorizontalItem} HorizontalItem是水平方向的Item组件.
 * @APIGroup HorizontalItem.
 * @apiParam {String} model 决定组件的样式只可以选择samll或者default(默认default，不用声明).
 * @apiParam {String} label item左边的文字内容.
 * @apiParam {String} content item右边的显示内容.
 * @apiParam {Number} gutter是antd的row组件所需要的prop,默认24.
 * @apiParam {Number} offset是antd的col组件所需要的prop.
 * @apiParam {Number} labelSpan是antd的col组件所需要的prop.
 * @apiParam {Number} contentSpan是antd的col组件所需要的prop,默认14.
 * @apiExample {js} Example usage:
 * <HorizontalItem label="编码" model="default" content={plan.product.code} />
 */

const allStyle = {
  small: {
    default: {
      padding: '5px 0',
      color: '#182027',
      marginLeft: 0,
      marginRight: 0,
      fontSize: '10px',
    },
    left: {
      offset: 5,
      span: 5,
      style: {
        color: 'rgba(0, 0, 0, 0.6)',
      },
    },
    right: {
      style: {
        wordWrap: 'break-word',
      },
    },
  },
  default: {
    default: {
      padding: '10px 0',
      marginLeft: 0,
      marginRight: 0,
      fontSize: 12,
    },
    left: {
      offset: 4,
      span: 6,
      style: {
        color: 'rgba(0, 0, 0, 0.6)',
      },
    },
    right: {
      style: {
        color: '#182027',
        wordWrap: 'break-word',
      },
    },
  },
};

type Props = {
  model: 'samll' | 'default' | null,
  label: string,
  content: React.node,
  gutter: number,
  offset: number,
  labelSpan: number,
  contentSpan: number,
};

class HorizontalItem extends Component {
  props: Props;

  state = {};

  render() {
    const { label, content, gutter, offset, labelSpan, contentSpan } = this.props;
    const model = this.props.model || 'default';
    const styles = allStyle[model];
    const { left, right } = styles;
    const _left = _.cloneDeep(left);
    if (offset) {
      _left.offset = offset;
    }

    return (
      <Row gutter={gutter || 24} style={allStyle[model].default}>
        <Col span={labelSpan} {..._left}>
          {label}
        </Col>
        <Col span={contentSpan || 14} {...right}>
          {content}
        </Col>
      </Row>
    );
  }
}

HorizontalItem.DetailpageItem = DetailpageItem;

export default HorizontalItem;
