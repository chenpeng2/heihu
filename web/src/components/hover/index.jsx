import React, { Component } from 'react';

class Hover extends Component {
  props: {
    className: string,
    style: {},
    childrenContainerStyle: {},
    children: React.element,
    hoverComponent: React.element,
  };
  state = {
    hover: false,
  };

  render() {
    const { hoverComponent, children, style, childrenContainerStyle, className, ...rest } = this.props;
    return (
      <div style={{ position: 'relative', ...style }} className={className} onMouseLeave={() => this.setState({ hover: false })} {...rest}>
        <div style={childrenContainerStyle} onMouseEnter={() => this.setState({ hover: true })}>
          {children}
        </div>
        {this.state.hover ? hoverComponent : null}
      </div>
    );
  }
}

export default Hover;
