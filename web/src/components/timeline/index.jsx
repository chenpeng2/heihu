import React from 'react';
import { middleGrey, blacklakeGreen } from 'src/styles/color/index';

const Item = ({ title, children }: { title: any, children: string }) => {
  return (
    <div style={{ paddingBottom: 20 }}>
      {typeof title === 'string' ? <p>{title}</p> : title}
      <p>{children}</p>
    </div>
  );
};

const Timeline = ({ children }: { children: string }) => {
  return (
    <div className="timeline">
      {React.Children.map(children, (item, index) => {
        const color = index === 0 ? blacklakeGreen : middleGrey;
        return (
          <div className="item" style={{ color }}>
            <div className="line-container">
              <div className="dot" />
              <div
                className="line"
                style={{
                  display: index === children.length - 1 ? 'none' : 'block',
                }}
              />
            </div>
            {item}
          </div>
        );
      })}
    </div>
  );
};
Timeline.Item = Item;

export default Timeline;
