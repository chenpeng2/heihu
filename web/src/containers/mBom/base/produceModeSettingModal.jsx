import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import { Table, Button, Radio, Tooltip, Link, FormattedMessage } from 'components';
import { configHasSOP } from 'utils/organizationConfig';

const RadioGroup = Radio.Group;
type props = {
  materials: [],
  preMaterialProductionMode: Number,
  isFirstNode: Boolean,
  disabled: Boolean,
  onOk: () => {},
  onCancel: () => {},
  primaryMaterialCode: string,
};

class ProduceSettingModal extends Component<props> {
  state = {};

  componentDidMount() {
    const { materials = [], preMaterialProductionMode, isFirstNode } = this.props;
    const _materials = (!isFirstNode
      ? [
          {
            material: {
              name: '前序产出物料',
            },
            materialProductionMode: preMaterialProductionMode || 1,
          },
        ]
      : []
    ).concat(
      Array.isArray(materials)
        ? materials
            .filter(e => _.get(e, 'material.name'))
            .map(({ materialProductionMode = 1, ...rest }) => ({
              ...rest,
              materialProductionMode,
            }))
        : [],
    );
    this.setState({ materials: _materials });
  }

  handleAllSelectMode = type => {
    const { materials } = this.state;
    this.setState({
      materials:
        Array.isArray(materials) &&
        materials.map(material => {
          if (this.shouldBeDisabled(material.material)) {
            return material;
          }
          return {
            ...material,
            materialProductionMode: type,
          };
        }),
    });
  };

  shouldBeDisabled = material => {
    const { primaryMaterialCode, isAlwaysOneCode } = this.props;
    return isAlwaysOneCode && (primaryMaterialCode === material.code || material.name === '前序产出物料');
  };

  getColumns = () => {
    const columns = [
      {
        title: '投入物料',
        key: 'material',
        dataIndex: 'material',
        render: material => (
          <Tooltip text={`${material.code ? `${material.code}／` : ''}${material.name}`} length={20} />
        ),
      },
      ...[
        { title: '扫码投产', key: 1 },
        { title: '线边仓投产', key: 2 },
        configHasSOP() && { title: '收料投产', key: 4 },
        { title: '扫码投产和线边仓投产', key: 3 },
      ]
        .filter(n => n)
        .map(({ title, key }) => ({
          title: (
            <span>
              <FormattedMessage defaultMessage={title} />{' '}
              <Link onClick={() => this.handleAllSelectMode(key)}>选择全部</Link>
            </span>
          ),
          key,
          dataIndex: 'material',
          render: (material, record) => (
            <RadioGroup
              disabled={this.shouldBeDisabled(material)}
              value={record.materialProductionMode}
              onChange={e => {
                record.materialProductionMode = e.target.value;
                const { materials } = this.state;
                this.setState({ materials });
              }}
            >
              <Radio value={key} />
            </RadioGroup>
          ),
        })),
    ];
    return columns;
  };

  render() {
    const { onOk, onCancel, disabled, isFirstNode } = this.props;
    const { materials } = this.state;
    console.log('materials', materials);
    return (
      <Fragment>
        <Table pagination={false} columns={this.getColumns()} dataSource={materials} />
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
              if (isFirstNode) {
                onOk({
                  inputMaterials: materials,
                });
              } else {
                const [{ materialProductionMode: preMaterialProductionMode }, ...rest] = materials;
                onOk({
                  preMaterialProductionMode,
                  inputMaterials: rest,
                });
              }
            }}
          >
            {disabled ? '确定' : '完成'}
          </Button>
        </div>
      </Fragment>
    );
  }
}

export default ProduceSettingModal;
