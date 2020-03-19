import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import { Table, Button, Radio } from 'components';

const RadioGroup = Radio.Group;
type props = {
  units: [],
  proUseUnitId: string,
  proHoldUnitId: string,
  inputFactoryUnitId: string,
  disabled: boolean,
  onOk: () => {},
  onCancel: () => {},
};

class UnitSettingModal extends Component<props> {
  state = {};

  componentDidMount() {
    const { units, proUseUnitId: _proUseUnitId, proHoldUnitId: _proHoldUnitId, inputFactoryUnitId: _inputFactoryUnitId } = this.props;
    const unitsFiltered = Array.isArray(units)
      ? units
          .filter(e => e && e.unit)
          .sort((a, b) => {
            if (a.key === 'mainUnit') {
              return -1;
            } else if (b.key === 'mainUnit') {
              return 1;
            }
            return 0;
          })
          .map(e => e.unit)
      : [];
    const mainUnit = Array.isArray(units) && units.find(e => e && e.key === 'mainUnit');
    this.setState({
      units: unitsFiltered,
    });
    if (mainUnit) {
      let proUseUnitId = _proUseUnitId;
      let proHoldUnitId = _proHoldUnitId;
      let inputFactoryUnitId = _inputFactoryUnitId;
      if (!unitsFiltered.find(e => e.id === proUseUnitId)) {
        proUseUnitId = mainUnit && _.get(mainUnit, 'unit.id');
      }
      if (!unitsFiltered.find(e => e.id === proHoldUnitId)) {
        proHoldUnitId = mainUnit && _.get(mainUnit, 'unit.id');
      }
      if (!unitsFiltered.find(e => e.id === inputFactoryUnitId)) {
        inputFactoryUnitId = mainUnit && _.get(mainUnit, 'unit.id');
      }
      this.setState({
        proUseUnitId,
        proHoldUnitId,
        inputFactoryUnitId,
      });
    }
  }

  getColumns = () => {
    const { disabled } = this.props;
    const { proUseUnitId, proHoldUnitId, inputFactoryUnitId } = this.state;
    const columns = [
      {
        title: '单位',
        key: 'unit',
        dataIndex: 'name',
      },
      {
        title: '投料单位',
        key: 'proUseUnit',
        dataIndex: 'id',
        render: id => (
          <RadioGroup
            disabled={disabled}
            value={proUseUnitId}
            onChange={e => {
              this.setState({ proUseUnitId: e.target.value });
            }}
          >
            <Radio value={id} />
          </RadioGroup>
        ),
      },
      {
        title: '产出单位',
        key: 'proHoldUnit',
        dataIndex: 'id',
        render: id => (
          <RadioGroup disabled={disabled} value={proHoldUnitId} onChange={e => this.setState({ proHoldUnitId: e.target.value })}>
            <Radio value={id} />
          </RadioGroup>
        ),
      },
      {
        title: '入厂单位',
        key: 'admitUnit',
        dataIndex: 'id',
        render: id => (
          <RadioGroup
            disabled={disabled}
            value={inputFactoryUnitId}
            onChange={e => {
              this.setState({ inputFactoryUnitId: e.target.value });
            }}
          >
            <Radio value={id} />
          </RadioGroup>
        ),
      },
    ];
    return columns;
  };

  render() {
    const { onOk, onCancel, disabled } = this.props;
    const { units } = this.state;

    return (
      <Fragment>
        <Table pagination={false} columns={this.getColumns()} dataSource={units} />
        <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
          {disabled ? null : (
            <Button style={{ width: 114, marginRight: 60 }} type="ghost" onClick={() => onCancel()}>
              取消
            </Button>
          )}
          <Button
            type="primary"
            style={{ width: 114 }}
            onClick={async () => {
              const { proUseUnitId, proHoldUnitId, inputFactoryUnitId } = this.state;
              onOk({ proUseUnitId, proHoldUnitId, inputFactoryUnitId });
            }}
          >
            {disabled ? '确定' : '完成'}
          </Button>
        </div>
      </Fragment>
    );
  }
}

export default UnitSettingModal;
