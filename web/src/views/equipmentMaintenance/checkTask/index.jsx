import React from 'react';
import { Tabs } from 'src/components';
import { setLocation } from 'utils/url';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'src/utils/locale/utils';
import { getQuery } from 'src/routes/getRouteParams';
import DeviceCheckTask from './device';
import ToolingCheckTask from './tooling';
import styles from './styles.scss';

const TabPane = Tabs.TabPane;

type Props = {
  match: any,
  intl: any,
};

const CheckTask = (props: Props) => {
  const { match, intl } = props;
  const { pageType = '1' } = getQuery(match) || {};

  const handleChange = activeKey => {
    setLocation(props, p => ({ ...p, pageType: activeKey }));
  };

  return (
    <div className={styles.checkTask}>
      <Tabs defaultActiveKey={pageType} onChange={handleChange}>
        <TabPane tab={changeChineseToLocale('设备', intl)} key="1">
          <DeviceCheckTask />
        </TabPane>
        <TabPane tab={changeChineseToLocale('模具', intl)} key="2">
          <ToolingCheckTask />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default injectIntl(CheckTask);
