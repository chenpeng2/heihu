import React from 'react';

import { Link, Button } from 'src/components';

const Link_To_Purchase_List_Operation_History_Page = (props: {
  render: () => {},
  purchase_list_code: string,
  style: {},
  id: any,
}) => {
  const { render, purchase_list_code, id, style } = props || {};
  const path = `/cooperate/purchaseLists/${purchase_list_code}/detail/${id}/operationHistory`;

  return (
    <Link style={{ margin: '0 5px', ...style }} to={path}>
      {render ? render() : '查看操作记录'}
    </Link>
  );
};

export default Link_To_Purchase_List_Operation_History_Page;
