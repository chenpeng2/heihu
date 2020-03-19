import React, { PureComponent } from 'react';

export default class extends PureComponent {
    constructor(props) {
      super(props);
      this.state = { };
    }

    render() {
      return (
        <div className="bottom-border detail-1">
            <div className="title">基于门店详情</div>
            {/* <div className="meta">
            <span>07-17-2019</span>
            <span>Updated 1h ago</span>
            </div> */}
        </div>
      )
    }
  };  