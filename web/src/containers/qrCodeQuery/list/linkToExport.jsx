import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import { Button } from 'src/components';

class LinkToExport extends Component {
  props: {
    history: any,
    style: any,
  };
  state = {};

  render() {
    const { history, style } = this.props;

    return (
      <Button
        style={style}
        icon={'upload'}
        onClick={() => { history.push('/stock/qrCode/dataExport'); }}
      >
        数据导出
      </Button>
    );
  }
}

export default withRouter(LinkToExport);
