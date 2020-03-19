import React from 'react';
import { Tabs } from 'src/components';
import { setLocation } from 'utils/url';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'src/utils/locale/utils';
import { getQuery } from 'src/routes/getRouteParams';
import DeviceRepairTask from './device';
import ToolingRepairTask from './tooling';
import styles from './styles.scss';

const TabPane = Tabs.TabPane;

type Props = {
  match: any,
  intl: any,
};

const RepairTask = (props: Props) => {
  const { match, intl } = props;
  const { pageType = '1' } = getQuery(match) || {};

  const handleChange = activeKey => {
    setLocation(props, p => ({ ...p, pageType: activeKey }));
  };

  return (
    <div className={styles.repairTask}>
      <Tabs defaultActiveKey={pageType} onChange={handleChange}>
        <TabPane tab={changeChineseToLocale('设备', intl)} key="1">
          <DeviceRepairTask />
        </TabPane>
        <TabPane tab={changeChineseToLocale('模具', intl)} key="2">
          <ToolingRepairTask />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default injectIntl(RepairTask);
