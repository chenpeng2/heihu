import React from 'react';
import { Drawer } from 'components';
import { format } from 'utils/time';

const Timeline = Drawer.Timeline;
const Item = Timeline.Item;

class CheckItemHistory extends React.PureComponent<any> {
  state = {};
  render() {
    const { data } = this.props;
    return (
      <div>
        <Timeline>
          {data &&
            data.map(({ userName, description, createdAt, id }) => (
              <Item title={format(createdAt)} key={id}>
                {userName} {description}
              </Item>
            ))}
        </Timeline>
      </div>
    );
  }
}

export default CheckItemHistory;
