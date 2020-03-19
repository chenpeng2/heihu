import React, { Component } from 'react';
import { injectIntl } from 'react-intl';

import { OpenModal } from 'components';
import { changeChineseToLocale } from 'src/utils/locale/utils';
import Button from '../button';
import Exporter from './exporter';

const FileBasedDataExporterButton = (props: { intl: any, type: String, baseUrl: String, generateForPast: Boolean }) => {
  const { dataType, intl, baseUrl, generateForPast, children, ...remaining } = props;
  return (
    <Button
      onClick={() => {
        OpenModal({
          title: `${typeof dataType === 'string' ? changeChineseToLocale(dataType, intl) : dataType}${changeChineseToLocale('数据导出', intl)}`,
          width: 1200,
          footer: null,
          children: <Exporter type={dataType} baseUrl={baseUrl} generateForPast={generateForPast} />,
        });
      }}
      {...remaining}
    >
      {children || changeChineseToLocale('数据导出', intl)}
    </Button>
  );
};

export default injectIntl(FileBasedDataExporterButton);
