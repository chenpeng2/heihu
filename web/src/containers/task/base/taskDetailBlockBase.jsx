import React, { Component } from 'react';
import { Row, Col } from 'antd';
import { ItemHeader } from 'components';
import { black, middleGrey } from 'src/styles/color/index';


const labelStyle = {
  color: middleGrey,
  textAlign: 'right',
};
const valueStyle = {
  color: black,
};
const itemContainerStyle = {
  marginTop: 14,
};
const itemHeaderStyle = {
  margin: '20px 0px 20px',
};


type Props = {
  style: {},
  title: string,
  data: [
    {
      name: string,
      value: any,
    },
  ],
};

class BaseTaskDetailBlock extends Component {
  props: Props;
  state = {};

  // TODO:bai 不使用row，col。自己实现样式
  render() {
    const { title, data } = this.props;
    return (
      <div>
        <ItemHeader title={title} style={itemHeaderStyle} />
        {data.map(item => {
          return (
            <Row gutter={24} key={item.name} style={itemContainerStyle}>
              <Col span={6} style={labelStyle}>
                {item.name}
              </Col>
              <Col span={18} style={valueStyle}>
                {item.value}
              </Col>
            </Row>
          );
        })}
      </div>
    );
  }
}

export default BaseTaskDetailBlock;
