import React from 'react';
import { PlainText } from 'components';
import { black } from 'styles/color';

type Props = {};

function Header(props: Props) {
  const style = {
    margin: '20px 0 30px 20px',
    color: black,
    fontSize: 16,
  };
  return <PlainText style={style} text="编辑销售订单" />;
}

export default Header;
