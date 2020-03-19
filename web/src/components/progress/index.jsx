import React from 'react';
import PropTypes from 'prop-types';
import { Progress } from 'antd';
import './styles.scss';

/**
 * @api {Progress} Progress.
 * @APIGroup Progress.
 * @apiParam {React.node} extra 额外展示的组件.
 * @apiExample {js} Example usage:
 * <Progress
    style={{ flex: 1 }}
    strokeWidth={5}
    percent={(node.assignedAmount / node.total) * 100}
    status="success"
    showInfo={false}
   />
 * 其他参数见antd
 */

const myProgress = props => {
  const { width, extra, style, children, onClick, extraStyle, title, ...rest } = props;

  return (
    <span
      className="ProgressContainer"
      style={{ width: '100%', left: 0, top: 16, position: 'absolute' }}
      onClick={onClick}
    >
      <Progress {...rest} style={{ ...style, width: '100%' }} />{' '}
      {width > 50 && (
        <span style={{ position: 'absolute', left: '50%', top: 2, marginLeft: '-25%', ...extraStyle }}>
          {width > 200 && title && <span>{title}:</span>}
          {extra}
        </span>
      )}{' '}
      {children}
    </span>
  );
};

myProgress.propTypes = {
  className: PropTypes.string,
  title: PropTypes.node,
  style: PropTypes.any,
  extraStyle: PropTypes.any,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  left: PropTypes.string,
  extra: PropTypes.node,
  children: PropTypes.node,
  onClick: PropTypes.func,
};
myProgress.AntProgress = Progress;

export default myProgress;
