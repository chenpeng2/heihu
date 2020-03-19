import React from 'react';
import { black } from 'styles/color';

type Props = {
  title: String,
};

function Header(props: Props) {
  const { title } = props;
  const style = {
    margin: '20px 0 30px 20px',
    color: black,
    fontSize: 16,
  };
  return <div style={style}>{title}</div>;
}

export default React.memo(Header);
