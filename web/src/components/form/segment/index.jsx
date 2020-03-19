import React from 'react';
import ItemHeader from 'components/itemHeader';

/**
 * @api {Segment} Segment.
 * @APIGroup Segment.
 * @apiParam {String} title 表单每一行信息.
 * @apiParam {React.node} children -
 * @apiExample {js} Example usage:
 * <Segment title="基本信息">
    <BasicInfo form={form} edit={edit} organization={viewer.organization} />
   </Segment>
 */

type Props = {
  title: string;
  children: any;
}

const Segment = (props: Props) => {
  return (
    <div>
      <ItemHeader title={props.title} />
      {props.children}
    </div>
  );
};

export default Segment;
