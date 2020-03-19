import React, { Component } from 'react';
import { Tabs } from 'antd';
import PropTypes from 'prop-types';
import ExportByDay from './exportByDay';
import ExportByMonth from './exportByMonth';
import styles from './styles.scss';

const TabPane = Tabs.TabPane;

type Props = {};

class Export extends Component {
  props: Props;
  state = {}

  render() {
    const { changeChineseToLocale } = this.context;

    return (
      <div style={{ display: 'flex', justifyContent: 'space-between' }} className={styles.export}>
        <Tabs style={{ width: '100%' }} style={{ paddingBottom: 100, width: '100%' }} >
          <TabPane tab={changeChineseToLocale('按天导出')} key={'1'}>
            <ExportByDay />
          </TabPane>
          <TabPane tab={changeChineseToLocale('按月导出')} key={'2'}>
            <ExportByMonth />
          </TabPane>
        </Tabs>
      </div>
    );
  }
}

Export.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default Export;
