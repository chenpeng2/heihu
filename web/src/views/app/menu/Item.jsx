import React from 'react';
import { Menu, Link } from 'components';

const Item = Menu.Item;

const MenuItem = (props: { children: string, eventKey: string, auth: string }) => {
  const { children, ...rest } = props;
  return (
    <Item {...rest}>
      <Link to={`/${props.eventKey}`} data-auth={props.auth}>
        {children}
      </Link>
    </Item>
  );
};

export default MenuItem;
