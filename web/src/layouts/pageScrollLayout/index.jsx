import React from 'react';
import PropTypes from 'prop-types';
import omit from 'object.omit';

const PageScrollLayout = ({ children, style, className }) => {
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        ...style,
      }}
      className={className}
    >
      {React.Children.map(children, Child => {
        if (!Child) {
          return null;
        }
        const isScroll = Child.props.scroll;
        if (isScroll) {
          const scrollChildStyle = Object.assign(
            {
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              WebkitOverflowScrolling: 'touch',
            },
            Child.props.style,
          );
          return <Child.type style={scrollChildStyle} {...omit(Child.props, ['scroll', 'style'])} />;
        }
        return Child;
      })}
    </div>
  );
};

PageScrollLayout.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.object]),
  style: PropTypes.shape({
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  className: PropTypes.string,
};

PageScrollLayout.contextTypes = {};

export default PageScrollLayout;
