import React, { Component } from 'react';
import { Button } from 'components';
import WorkstationAndAreaSelect from 'src/components/select/workstationAndAreaSelect';

class WorkstationSelectModal extends Component {
  props: {
    onOk: () => {},
    onCancel: () => {},
    intersectionWorkstations: [],
  };
  state = {};
  render() {
    const { onOk, intersectionWorkstations, onCancel } = this.props;
    const { value } = this.state;
    return (
      <div>
        <div style={{ margin: '5px 20px', padding: 30 }}>
          <WorkstationAndAreaSelect
            onChange={value => {
              this.setState({ value });
            }}
            value={value}
            labelInValue
            onlyWorkstations
            options={intersectionWorkstations}
            style={{ width: 276 }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
          <Button style={{ width: 100 }} type="ghost" onClick={() => onCancel()}>
            取消
          </Button>
          <Button style={{ width: 100, marginLeft: 40 }} onClick={() => onOk(this.state.value)}>
            确定
          </Button>
        </div>
      </div>
    );
  }
}

export default WorkstationSelectModal;
