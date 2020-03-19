import React, { Component } from 'react';
import _ from 'lodash';
import { Tabs } from 'antd';

import PrintHistory from 'src/containers/electronicTags/printPage/operationHistory/printHistory';
import ExportHistory from 'src/containers/electronicTags/printPage/operationHistory/exportHistory';

const TabPane = Tabs.TabPane;

type Props = {
  style: {},
  match: {}
}

class OperationHistory extends Component {
  state={}
  props: Props

  getLabelId = () => {
    const { match } = this.props;
    return _.get(match, 'params.id');
  }

  render() {
    const tabPaneStyle = { paddingBottom: 50 };
    const labelId = this.getLabelId();

    return (
      <Tabs style={{ padding: 20 }} >
        <TabPane tab={'打印记录'} key={'1'} style={tabPaneStyle} >
          <PrintHistory labelId={labelId} />
        </TabPane>
        <TabPane tab={'导出记录'} key={'2'} style={tabPaneStyle} >
          <ExportHistory labelId={labelId} />
        </TabPane>
      </Tabs>
    );
  }
}

export default OperationHistory;
