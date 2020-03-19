import React from 'react';
import { Link } from 'components';

class ProjectStatus extends React.PureComponent {
  state = {};

  render() {
    return (
      <div>
        <Link>暂停</Link>
        <Link>结束</Link>
      </div>
    );
  }
}

export default ProjectStatus;
