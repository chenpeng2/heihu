import React, { Component } from 'react';

import { Button } from 'src/components';

class LinkToCreate extends Component {
  props: {
    openCreateModal: () => {},
  };
  state = {};

  render() {
    const { openCreateModal } = this.props;

    return (
      <Button
        style={{ margin: 20, marginLeft: 0 }}
        icon="plus-circle-o"
        onClick={() => {
          if (typeof openCreateModal === 'function') {
            openCreateModal();
          }
        }}
      >
        创建仓储事务配置
      </Button>
    );
  }
}

export default LinkToCreate;
