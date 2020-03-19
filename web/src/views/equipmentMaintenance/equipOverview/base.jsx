import React from 'react';
import moment from 'src/utils/time';
import { changeChineseToLocale } from 'utils/locale/utils';
import { fontSub } from 'src/styles/color/index';

export const getFormatParams = values => {
  const { searchDeviceCategory, searchDevice, searchWorkshop, time } = values;
  return {
    searchDeviceCategoryId: (searchDeviceCategory && searchDeviceCategory.key) || '',
    searchDeviceId: (searchDevice && searchDevice.key) || '',
    searchWorkshopId: (searchWorkshop && searchWorkshop.key) || '',
    searchStartTime: time && time.length && Date.parse(moment(time[0]).startOf('day')),
    searchEndTime: time && time.length && Date.parse(moment(time[1]).startOf('day')),
  };
};

export const renderBadgeGroup = (config, intl) => {
  return (
    <div style={{ position: 'absolute', zIndex: 10, top: 45, left: '92%' }}>
      <div>
        <span style={{ width: 9, height: 9, display: 'inline-block', backgroundColor: config[0].color }} />
        <span style={{ color: fontSub, marginLeft: 5 }}>{changeChineseToLocale(config[0].text, intl)}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'relative' }}>
          <div style={{ width: 4, height: 1, position: 'absolute', background: config[1].color, top: 4, left: 9 }} />
          <div style={{ width: 9, height: 9, borderRadius: 10, border: `1px solid ${config[1].color}` }} />
          <div style={{ width: 4, height: 1, position: 'absolute', background: config[1].color, top: 4, left: -4 }} />
        </div>
        <div style={{ color: fontSub, marginLeft: 5 }}>{changeChineseToLocale(config[1].text, intl)}</div>
      </div>
    </div>
  );
};

export default 'dummy';
