import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ProcessRouteChart, Icon, Popover, Tooltip } from 'src/components';
import { grey, fontSub, primary } from 'src/styles/color';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';
import { replaceSign } from '../../../constants';

type Props = {
  value: [],
  form: any,
  onNodeClick: () => {},
  onContainerClick: () => {},
  activeNodeIndex: {
    processContainerNo: Number,
    processNo: Number,
  },
  editing: boolean,
  hidePreProcessMaterial: boolean,
};

// 根据是否有分数改变展示的格式
const getAmountStringByType = (amount, amountFraction) => {
  if (amountFraction && amountFraction.numerator && amountFraction.denominator) {
    const { numerator, denominator } = amountFraction;
    return `${numerator}/${denominator}`;
  }
  return amount;
};

class ProcessRouteGraph extends Component {
  props: Props;
  state = {
    loading: false,
    editing: false,
    open: false,
  };

  componentWillMount() {
    const { editing } = this.props;
    this.setState({
      editing,
    });
  }

  isParallelProcessGroup = processGroup => processGroup && processGroup.nodes.length > 1;

  renderOpenButton() {
    const { open } = this.state;
    return (
      <div
        style={{ margin: 'auto', width: 87 }}
        onClick={() => {
          this.setState({ open: !open });
        }}
      >
        <div style={{ color: fontSub }}> {changeChineseToLocaleWithoutIntl(open ? '收起' : '展开')} </div>
        <div style={{ fontSize: 10, marginLeft: 5, color: fontSub }}>
          {open ? <Icon type={'up'} /> : <Icon type={'down'} />}{' '}
        </div>
      </div>
    );
  }

  render() {
    const { value: data, onNodeClick, onContainerClick } = this.props;
    const { open } = this.state;

    const renderNode = (nodeData, dataIndex, nodeContainerIndex, allData) => {
      const {
        process: { name },
        inputMaterials,
        outputMaterial,
      } = nodeData;
      const _inputMaterials = [...(inputMaterials || [])];

      const { processContainerNo, processNo } = this.props.activeNodeIndex || {};
      const isActiveNode = dataIndex === processNo && nodeContainerIndex === processContainerNo;

      const baseStyle = {
        textAlign: 'center',
        height: 56,
        padding: '0 10px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        cursor: 'pointer',
        border: isActiveNode ? `1px solid ${primary}` : 'none', // 如果是被点击的node需要改变边框
        boxShadow: isActiveNode ? `0px 0px 6px ${primary}` : 'none',
        borderRadius: '2px',
      };

      const {
        amount: outputMaterialAmount,
        amountFraction: outputMaterialAmountFraction,
        material: outputMaterialInfo,
        currentUnitId,
      } = outputMaterial || {};
      const _outputMaterialAmount = getAmountStringByType(outputMaterialAmount, outputMaterialAmountFraction);
      let outputMaterialUnitName = replaceSign;
      if (outputMaterialInfo) {
        const { unitName, unitConversions } = outputMaterialInfo;
        outputMaterialUnitName = unitName;
        if (unitConversions && unitConversions.length) {
          const convertUnit = unitConversions.find(e => e.slaveUnitId === currentUnitId);
          if (convertUnit) {
            outputMaterialUnitName = convertUnit.slaveUnitName;
          }
        }
      }

      return (
        <div
          style={baseStyle}
          onClick={e => {
            if (onNodeClick) {
              onNodeClick(nodeData, dataIndex, nodeContainerIndex, allData);
            }
            e.stopPropagation();
          }}
        >
          <Tooltip text={name ? `${name}` : null} length={12} />
          <div
            style={{
              position: 'absolute',
              lineHeight: 1.5,
              textAlign: 'center',
              bottom: 1,
              left: 1,
              right: 1,
              display: 'flex',
            }}
          >
            {_inputMaterials && _inputMaterials.length ? (
              <div
                key="ru"
                style={{
                  flex: 1,
                  borderRight: '1px solid #E8E8E8',
                  borderTop: '1px solid #E8E8E8',
                }}
              >
                <Popover
                  content={_inputMaterials.map(({ material, amount, amountFraction, currentUnitId }, index) => {
                    const _amount = getAmountStringByType(amount, amountFraction);
                    let inputMaterialUnitName = replaceSign;
                    if (material) {
                      const { unitName, unitConversions } = material;
                      inputMaterialUnitName = unitName;
                      if (unitConversions && unitConversions.length) {
                        const convertUnit = unitConversions.find(e => e.slaveUnitId === currentUnitId);
                        if (convertUnit) {
                          inputMaterialUnitName = convertUnit.slaveUnitName;
                        }
                      }
                    }
                    return (
                      <div key={material ? material.code : index}>
                        {material ? `${material.code}/${material.name}` : replaceSign} {_amount || 1}{' '}
                        {inputMaterialUnitName}
                      </div>
                    );
                  })}
                >
                  {changeChineseToLocaleWithoutIntl('投入')}
                </Popover>
              </div>
            ) : null}
            {outputMaterial && (
              <div
                key="chu"
                style={{
                  flex: 1,
                  borderTop: '1px solid #E8E8E8',
                }}
              >
                <Popover
                  content={
                    <div>
                      {outputMaterialInfo ? `${outputMaterialInfo.code} / ${outputMaterialInfo.name}` : replaceSign}{' '}
                      {_outputMaterialAmount || 1} {outputMaterialUnitName}
                    </div>
                  }
                >
                  {changeChineseToLocaleWithoutIntl('产出')}
                </Popover>
              </div>
            )}
          </div>
        </div>
      );
    };

    const renderContainer = (data, dataIndex, allData) => {
      if (data.nodes.length < 2) {
        return null;
      }
      const { inputMaterial, outputMaterial } = data;

      return (
        <div
          style={{
            borderTop: '1px solid #E8E8E8',
            position: 'absolute',
            lineHeight: 1.5,
            textAlign: 'center',
            bottom: 0,
            left: 0,
            right: 0,
            display: 'flex',
          }}
        >
          {inputMaterial && inputMaterial.material ? (
            <div key="ru" style={{ flex: 1, borderRight: '1px solid #E8E8E8' }}>
              <Popover
                content={
                  <div>
                    {inputMaterial.material.code}/{inputMaterial.material.name}
                  </div>
                }
              >
                {changeChineseToLocaleWithoutIntl('投入')}
              </Popover>
            </div>
          ) : null}
          {outputMaterial && (
            <div key="chu" style={{ flex: 1 }}>
              <Popover
                content={
                  <div>
                    {outputMaterial.material
                      ? `${outputMaterial.material.code} / ${outputMaterial.material.name}`
                      : replaceSign}
                    {outputMaterial.amount || 1}{' '}
                    {outputMaterial.material
                      ? outputMaterial.material.unit && outputMaterial.material.unit.name
                      : replaceSign}
                  </div>
                }
              >
                {changeChineseToLocaleWithoutIntl('产出')}
              </Popover>
            </div>
          )}
        </div>
      );
    };

    const { processContainerNo, processNo } = this.props.activeNodeIndex || {};

    return (
      <div
        style={{
          width: '100%',
          background: grey,
          position: 'relative',
          border: '1px solid #e8e8e8',
          borderBottom: 'none',
        }}
        ref={e => {
          this.processRouteChart = e;
        }}
      >
        <div
          style={{
            height: open ? 690 : 320,
            overflow: 'scroll',
            padding: 10,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <ProcessRouteChart
            style={{ marginTop: 'auto', marginBottom: 'auto' }}
            data={data}
            activeNodeContainerIndex={processContainerNo}
            activeNodeIndex={processNo}
            activeNodeContainerStyle={{
              border: `1px solid ${primary}`, // 如果是被点击的node需要改变边框
              boxShadow: `0px 0px 6px ${primary}`,
            }}
            renderNode={renderNode}
            renderContainer={renderContainer}
            onContainerClick={onContainerClick}
          />
        </div>
        {this.renderOpenButton()}
      </div>
    );
  }
}

ProcessRouteGraph.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default ProcessRouteGraph;
