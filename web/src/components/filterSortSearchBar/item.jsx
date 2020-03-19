import React from 'react';
import { injectIntl } from 'react-intl';

import { secondaryGrey } from 'src/styles/color/index';
import { changeTextLanguage, changeChineseToLocale } from 'src/utils/locale/utils';

import { Tooltip, Icon } from 'components';
import { border } from 'src/styles/color';
import styles from './item.scss';

const toolTipIconStyle = { color: border, paddingRight: 0, marginRight: 6 };

const Item = ({
  itemWrapperStyle,
  label,
  children,
  required,
  labelStyle,
  wrapperStyle,
  labelTextStyle,
  intl,
  toolTip,
}: {
  itemWrapperStyle: {},
  label: string,
  children: any,
  required: boolean,
  labelStyle: {},
  wrapperStyle: {},
  labelTextStyle: {},
  intl: any,
  toolTip: any,
}) => {
  return (
    <div
      className={styles.filterItem}
      style={{
        display: 'flex',
        width: '33%',
        paddingRight: 40,
        marginBottom: 10,
        ...wrapperStyle,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          height: 28,
          width: 84,
          textAlign: 'right',
          lineHeight: '14px',
          marginRight: 10,
          flexShrink: 0,
          color: secondaryGrey,
          ...labelStyle,
        }}
      >
        <span style={labelTextStyle}>
          {toolTip ? (
            <Tooltip placement="top" title={toolTip}>
              <Icon style={toolTipIconStyle} type="tishi" iconType="gc" />
            </Tooltip>
          ) : null}
          {required && (
            <span
              style={{
                color: '#F5222D',
                textAlign: 'right',
                verticalAlign: 'sub',
              }}
            >
              {'* '}
            </span>
          )}
          {typeof label === 'string' ? changeChineseToLocale(label, intl) : label}
        </span>
      </div>
      <div
        style={{
          width: '100%',
          minWidth: '100%',
          maxWidth: '100%',
          paddingRight: 84,
          ...itemWrapperStyle,
        }}
      >
        {React.cloneElement(children, {
          style: { width: '100%', minWidth: '100%', maxWidth: '100%' },
        })}
      </div>
    </div>
  );
};

export default injectIntl(Item);
