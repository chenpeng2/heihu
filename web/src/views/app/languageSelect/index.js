/**
 * @description: 语言选择
 *
 * @date: 2019/6/21 下午3:38
 */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Radio, Popover } from 'src/components/index';
import { LANGUAGE_LIST, findLanguage, getInitialLanguageType } from 'src/utils/locale/utils';
import { arrayIsEmpty } from 'src/utils/array';

const RadioGroup = Radio.Group;
const GroupData = Object.values(LANGUAGE_LIST).filter(i => i && i.value !== LANGUAGE_LIST.default.value);
const radioStyle = {
  display: 'block',
  height: '30px',
  lineHeight: '30px',
};

const LanguageSelect = (props, context) => {
  const { changeLanguageType, intl } = context || {};
  const [languageType, setLanguageType] = useState(_.get(intl, 'locale') || getInitialLanguageType());
  const { label: languageName } = findLanguage(languageType) || {};

  useEffect(() => {
    // 每一次刷新都需要重新判断语言类型
    setLanguageType(_.get(intl, 'locale') || getInitialLanguageType());
  });

  return (
    <div style={{ width: 100 }}>
      <Popover
        content={
          <RadioGroup
            onChange={e => {
              const value = e.target.value;
              changeLanguageType(value);
              setLanguageType(value);
              window.location.reload();
            }}
            value={languageType}
          >
            {arrayIsEmpty(GroupData)
              ? []
              : GroupData.map(i => {
                  const { label, value } = i || {};
                  return (
                    <Radio style={radioStyle} value={value}>
                      {label}
                    </Radio>
                  );
                })}
          </RadioGroup>
        }
      >
        <div>{languageName}</div>
      </Popover>
    </div>
  );
};

LanguageSelect.propTypes = {
  style: PropTypes.any,
};
LanguageSelect.contextTypes = {
  changeLanguageType: PropTypes.any,
  locale: PropTypes.any,
  intl: PropTypes.any,
};

export default LanguageSelect;
