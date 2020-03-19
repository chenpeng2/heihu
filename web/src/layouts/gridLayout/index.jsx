import React from 'react';

type Props = {
  children: any;
}

const GridLayout = (props: Props) => {
  return (
    <div>
      {
        React.Children.map(props.children, child => (
          <div>
            {
              child
            }
          </div>
        ))
      }
    </div>
  );
};

export default GridLayout;
