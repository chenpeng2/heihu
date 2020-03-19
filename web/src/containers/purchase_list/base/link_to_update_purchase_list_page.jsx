import React from 'react';
import auth from 'utils/auth';

import { Link, buttonAuthorityWrapper } from 'src/components';

const LinkWithAuth = buttonAuthorityWrapper(Link);

const Link_To_Update_Purchase_List_Page = (props: { render: () => {}, style: {}, purchase_list_code: string }) => {
  const { render, purchase_list_code, style } = props || {};
  const path = `/cooperate/purchaseLists/${purchase_list_code}/update`;

  return (
    <LinkWithAuth auth={auth.WEB_UPDATE_DISTRIBUTE_PROGRESS} to={path} style={{ margin: '0 5px', ...style }}>
      {render ? render() : '更新'}
    </LinkWithAuth>
  );
};

export default Link_To_Update_Purchase_List_Page;
