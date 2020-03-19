import React from 'react';
import { Tabs } from 'src/components';
import { setLocation } from 'utils/url';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'src/utils/locale/utils';
import { getQuery } from 'src/routes/getRouteParams';
import DeviceMaintenanceTask from './device';
import ToolingMaintenanceTask from './tooling';
import styles from './styles.scss';

const TabPane = Tabs.TabPane;

type Props = {
  match: any,
  intl: any,
};

const MaintenanceTask = (props: Props) => {
  const { match, intl } = props;
  const { pageType = '1' } = getQuery(match) || {};

  const handleChange = activeKey => {
    setLocation(props, p => ({ ...p, pageType: activeKey }));
  };
  return (
    <div className={styles.maintenanceTask}>
      <Tabs defaultActiveKey={pageType} onChange={handleChange}>
        <TabPane tab={changeChineseToLocale('设备', intl)} key="1">
          <DeviceMaintenanceTask />
        </TabPane>
        <TabPane tab={changeChineseToLocale('模具', intl)} key="2">
          <ToolingMaintenanceTask />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default injectIntl(MaintenanceTask);
