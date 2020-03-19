import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Tabs } from 'src/components';
import OutStorageList from './outStorageList';
import InStorageList from './inStorageList';

const TabPane = Tabs.TabPane;

class List extends Component {
  state = {
    tabKey: '1',
  };

  render() {
    const { tabKey } = this.state;
    const { changeChineseToLocale } = this.context;

    return (
      <div>
        <Tabs onChange={key => { this.setState({ tabKey: key }); }} style={{ paddingBottom: 100 }} defaultActiveKey="1" >
          <TabPane tab={changeChineseToLocale('出库记录')} key="1"><OutStorageList tabKey={tabKey} /></TabPane>
          <TabPane tab={changeChineseToLocale('入库记录')} key="2"><InStorageList /></TabPane>
        </Tabs>
      </div>
    );
  }
}

List.propTypes = {
  style: PropTypes.object,
};

List.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default List;
