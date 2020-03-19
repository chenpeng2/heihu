/**
* @description: 导出数据。3.5.22版本不做了
*
* @date: 2019/4/30 下午12:20
*/
import React from 'react';

import { Icon, Button } from 'src/components/index';

const ExportData = (props: { style: any }) => {
  const { style } = props;
  return (
    <Button icon style={{ width: 114, ...style }} onClick={() => {}}>
      <Icon iconType={'gc'} type={'piliangcaozuo'} />
      导出数据
    </Button>
  );
};

export default ExportData;
