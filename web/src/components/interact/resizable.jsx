import React, { Component } from 'react';
import interact from 'interactjs';

class Resizable extends Component {
  props: {
    children: React.node,
    style: {},
  };
  state = {};

  componentDidMount() {
    interact(this.container)
      .resizable({
        // resize from all edges and corners
        edges: { right: true },
        // minimum size
        restrictSize: {
          min: { width: 100, height: 50 },
        },
        inertia: true,
      })
      .on('resizestart', event => {
        const target = event.target;
        target.setAttribute('data-lastWidth', target.style.width);
        target.setAttribute('data-lastHeight', target.style.height);
      })
      .on('resizemove', event => {
        const target = event.target;
        let x = parseFloat(target.getAttribute('data-x')) || 0;
        let y = parseFloat(target.getAttribute('data-y')) || 0;
        // update the element's style
        target.style.width = `${event.rect.width}px`;
        target.style.height = `${event.rect.height}px`;
        // translate when resizing from top or left edges
        x += event.deltaRect.left;
        y += event.deltaRect.top;
        target.style.webkitTransform = `translate(${x}px,${y}px)`;
        target.style.transform = `translate(${x}px,${y}px)`;
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
      })
      .on('resizeend', () => {
        // console.log(event);
      });
  }

  componentWillUnmount() {
    interact(this.container)
      .off('resizemove')
      .off('resizeend');
  }

  render() {
    const { children, style } = this.props;
    return (
      <div style={{ width: 100, ...style }} ref={e => (this.container = e)}>
        {children}
      </div>
    );
  }
}

export default Resizable;
