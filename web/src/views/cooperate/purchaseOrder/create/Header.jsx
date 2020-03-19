import React from 'react';
import { black } from 'styles/color';

const Header = () => {
  const style = {
    margin: '20px 0 30px 20px',
    color: black,
    fontSize: 16,
  };
  return <div style={style}>创建销售订单</div>;
};

export default Header;
