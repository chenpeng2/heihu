import React from 'react';

import { Link } from 'src/components';

const Link_To_Purchase_List_Detail_Page = (props: { render: () => {}, style: {}, purchase_list_code: number, code: string }) => {
  const { render, purchase_list_code, style, code } = props || {};
  const path = `/cooperate/purchaseLists/${code}/detail/${purchase_list_code}`;

  return (
    <Link style={{ margin: '0 5px', ...style }} to={path}>
      {render ? render() : '查看'}
    </Link>
  );
};

export default Link_To_Purchase_List_Detail_Page;
