import React, { Component } from 'react';
import _ from 'lodash';

import { Popover, Button, Icon } from 'src/components';
import { alertYellow } from 'src/styles/color';

type Props = {
  style: {},
  children: any,
  visible: boolean,
  cbForVisibleChange: () => {},
};

class MaterialRequestModal extends Component {
  props: Props;
  state = {
    visible: false,
  };

  componentDidMount() {
    this.setVisible(this.props.visible);
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.state.visible, nextProps.visible)) {
      this.setVisible(nextProps.visible);
    }
  }

  setVisible = v => {
    const { cbForVisibleChange } = this.props;
    this.setState(
      {
        visible: !!v,
      },
      () => {
        if (typeof cbForVisibleChange === 'function') cbForVisibleChange(v);
      },
    );
  };

  renderContent = () => {
    return (
      <div style={{ height: 40 }}>
        <div>
          <Icon type="exclamation-circle-o" style={{ color: alertYellow }} />
          <span style={{ marginLeft: 5 }}>请至少选择一个项目</span>
        </div>
        <Button
          type={'default'}
          onClick={() => {
            this.setVisible(false);
          }}
          size={'small'}
          style={{ float: 'right', marginTop: 5 }}
        >
          知道了
        </Button>
      </div>
    );
  };

  render() {
    const { children, ...rest } = this.props;
    return (
      <Popover {...rest} visible={this.state.visible} title={null} content={this.renderContent()}>
        {children}
      </Popover>
    );
  }
}

export default MaterialRequestModal;
