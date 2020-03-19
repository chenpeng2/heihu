import React from 'react';
import auth from 'utils/auth';

import { Link, buttonAuthorityWrapper } from 'src/components';

const LinkWithAuth = buttonAuthorityWrapper(Link);

const Link_To_Edit_Purchase_List_Page = (props: { render: () => {}, style: {}, purchase_list_code: string }) => {
  const { render, purchase_list_code, style } = props || {};
  const path = `/cooperate/purchaseLists/${purchase_list_code}/edit`;

  return (
    <LinkWithAuth auth={auth.WEB_EDIT_PROCURE_ORDER} style={{ margin: '0 5px', ...style }} to={path}>
      {render ? render() : '编辑'}
    </LinkWithAuth>
  );
};

export default Link_To_Edit_Purchase_List_Page;
