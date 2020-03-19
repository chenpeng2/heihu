import React, { Component } from 'react';
import styles from './index.scss';

/**
 * @api {Card} 卡片.
 * @APIGroup Card.
 * @apiParam {Obj} style -
 * @apiParam {React.node} children 一般搭配antd的row和col使用.
 * @apiExample {js} Example usage:
 * <Card style={{ margin: 0 }}>
    <Row gutter={24} style={{ padding: '0 0 0 36px' }}>
      <Col span={24} style={{ fontSize: 20 }}>
        <span style={{ marginRight: 16 }}>{product.code}</span>
        <Icon type="caret-up" />
      </Col>
    </Row>
   </Card>
 */

type Props = {
  children: React.node,
  style: any,
};

class Card extends Component {
  props: Props;

  state = {};

  render = () => {
    const { children, style, ...restProps } = this.props;
    return (
      <div style={style} className={styles.card} {...restProps}>
        {children}
      </div>
    );
  };
}

export default Card;
