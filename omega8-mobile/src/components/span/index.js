import React, { PureComponent } from 'react';

import './index.less'

class Span extends PureComponent {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <span className="spin-dot spin-dot-spin">
                <i className="spin-dot-item"></i>
                <i className="spin-dot-item"></i>
                <i className="spin-dot-item"></i>
                <i className="spin-dot-item"></i>
            </span>
        )
    }
}

export default Span