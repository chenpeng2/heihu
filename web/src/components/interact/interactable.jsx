import React, { Component } from 'react';
import interact from 'interactjs';

class Interactable extends Component {
  props: {
    children: React.node,
    style: {},
    className: String,
    bindEvents: () => {},
    unbindEvents: () => {},
  };
  state = {};

  componentDidMount() {
    const { bindEvents } = this.props;
    if (bindEvents) {
      bindEvents(interact(this.container));
    }
  }

  componentWillUnmount() {
    const { unbindEvents } = this.props;
    if (unbindEvents) {
      unbindEvents(interact(this.container));
    }
  }

  render() {
    const { children, style, className, ...rest } = this.props;
    return (
      <div className={className} style={style} ref={e => (this.container = e)} {...rest}>
        {children}
      </div>
    );
  }
}

export default Interactable;
