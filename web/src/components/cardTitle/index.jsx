// 主要用于将已经创建的计划和任务的名字和编码
import React from 'react';
import { stringEllipsis } from 'utils/string';

/**
 * @api {CardTitle} 卡片头部.
 * @APIGroup CardTitle.
 * @apiParam {String} title 卡片头部第一行展示的信息
 * @apiParam {String} subTitle 卡片头部第二行展示的信息
 * @apiExample {js} Example usage:
 * <CardTitle title={productOrderBomNode.material.code} subTitle={productOrderBomNode.material.name} />
 * 主要用于将已经创建的计划和任务的名字和编码
 */

type Props = {
  title: string,
  subTitle: string,
}

// 已创建计划和任务的名字和编码
const CardTitle = (props: Props) => {
  const { title, subTitle } = props;
  return (
    <div>
      <div style={{ fontWeight: 'bold', fontSize: 14 }}>
        {title || '-'}
      </div>
      <div>
        { subTitle ? stringEllipsis(subTitle, 23) : '-'}
      </div>
    </div>
  );
};

export default CardTitle;
