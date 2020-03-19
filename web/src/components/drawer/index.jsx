import React from 'react';
import PropTypes from 'prop-types';
import Drawer from 'rc-drawer';
import { Icon } from 'components';
import 'rc-drawer/assets/index.css';
import Timeline from './timeline';
import './styles.scss';

/**
 * @api {Drawer} 抽屉.
 * @APIGroup Drawer.
 * @apiParam {React.node} children -
 * @apiParam {Function} onCancel
 * 如果传了onCancel会有一个<Icon style={closeIconStyle} type="close-circle" onClick={() => onCancel()} />}.
 * @apiExample {js} Example usage:
 * <Drawer
    sidebar={
      <OperateHistory
        storageId={choosedStorageId}
        viewer={viewer}
      />
    }
    position="right"
    transition
    open={choosedStorageId}
    onCancel={() => this.setState({ choosedStorageId: null })}
   />
 * 其他属性见rc-drawer的属性
 */

export const drawerContentStyle = {
  padding: '24px 0 5px 25px',
};

class MyDrawer extends React.PureComponent {
  componentWillUnmount() {
    document.removeEventListener('mouseup', this.removeMouseEvent);
  }

  handlerResize = e => {
    const sideDom = document.getElementsByClassName('rc-drawer-sidebar')[0];
    const width = window.innerWidth - e.clientX;
    if (width < window.innerWidth - 200 && width > 300) {
      sideDom.style.width = `${width}px`;
    }
  };

  removeMouseEvent = () => {
    document.removeEventListener('mousemove', this.handlerResize);
  };

  render() {
    const { open, sidebar, onCancel, children, title, ...rest } = this.props;

    const wrappedSidebar = (
      <div style={{ height: '100%' }}>
        <div
          style={{ height: '100%', width: 20, cursor: 'col-resize', position: 'absolute' }}
          className="resize-side-bar"
          onMouseDown={e => {
            document.addEventListener('mousemove', this.handlerResize);
            document.addEventListener('mouseup', () => {
              this.removeMouseEvent();
            });
          }}
        />
        <div style={{ padding: 20 }}>
          <div
            style={{
              lineHeight: '16px',
              fontSize: 16,
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 30,
              float: title ? 'none' : 'right',
            }}
          >
            {title ? <span>{title}</span> : null}
            {onCancel && <Icon style={{ fontSize: 18, cursor: 'pointer' }} type="close" onClick={() => onCancel()} />}
          </div>
          {sidebar}
        </div>
      </div>
    );
    return (
      <Drawer
        style={{ width: 310, maxWidth: window.innerWidth - 180 }}
        open={open}
        sidebar={wrappedSidebar}
        position="right"
        {...rest}
      >
        {children || <div />}
      </Drawer>
    );
  }
}

MyDrawer.propTypes = {
  ...Drawer.propTypes,
  open: PropTypes.bool,
  sidebar: PropTypes.node,
  onCancel: PropTypes.func,
  children: PropTypes.node,
  title: PropTypes.string, // 标题
};

MyDrawer.Timeline = Timeline;

export default MyDrawer;
