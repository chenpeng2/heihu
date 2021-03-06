import React from 'react';

import { Link } from 'src/components';

const LinkToWorkingTimeDetail = (props: { render: () => {} }) => {
  const { render, code } = props || {};
  if (!code) return null;

  const path = `/knowledgeManagement/workingTime/${code}/detail`;

  return (
    <Link to={path}>
      {render ? (
        render()
      ) : (
        <div style={{ marginRight: '10px', display: 'inline-block' }}>
          查看
        </div>
      )}
    </Link>
  );
};

export default LinkToWorkingTimeDetail;
