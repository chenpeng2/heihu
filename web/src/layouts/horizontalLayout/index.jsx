import React from 'react';
import PropTypes from 'prop-types';

const leftContainerStyle = {
  width: '58%',
  display: 'inline-block',
  verticalAlign: 'top',
};
const rightContainerStyle = {
  width: '40%',
  display: 'inline-block',
  verticalAlign: 'top',
  marginLeft: '15px',
};

const HorizontalLayout = ({ leftChildren, rightChildren }) => (
  <div>
    <div style={leftContainerStyle}>{leftChildren}</div>
    <div style={rightContainerStyle}>{rightChildren}</div>
  </div>
);

HorizontalLayout.propTypes = {
  leftChildren: PropTypes.node,
  rightChildren: PropTypes.node,
};

export default HorizontalLayout;
