import React from 'react';

import { Link, Icon } from 'src/components';

const LinkToOperationHistory = (props: { render: () => {}, id: string }) => {
  const { render, id } = props || {};
  if (!id) return null;

  const path = `/knowledgeManagement/workingCalendar/${id}/detail/operationHistory`;

  return (
    <Link to={path}>
      {render ? (
        render()
      ) : (
        <div style={{ marginRight: '10px', display: 'inline-block' }}>
          <Icon iconType={'gc'} type={'chakanjilu'} style={{ verticalAlign: 'middle' }} />
          <span>查看操作记录</span>
        </div>
      )}
    </Link>
  );
};

export default LinkToOperationHistory;
