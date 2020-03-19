import React, { Component } from 'react';

import { Spin, Icon } from 'src/components';
import { black, middleGrey, primary, white, error } from 'src/styles/color';
import LinkToEditProductivityStandard from 'src/containers/productivityStandard/base/linkToEditProductivityStandardPage';
import LinkToProductivityStandardOperationHistory from 'src/containers/productivityStandard/base/linkToProductivityStandardOperationHistoryPage';
import { replaceSign } from 'src/constants';
import { getProductivityStandardDetail } from 'src/services/knowledgeBase/productivityStandard';

import { statusDisplay } from 'src/containers/productivityStandard/base/constant';
import { getStandardMessage, getProcessMessage } from 'src/containers/productivityStandard/base/util';
import ChangeStatus from 'src/containers/productivityStandard/base/stopUseOrReUseProductivityStandard';
import Tooltip from '../../../components/tooltip';

type Props = {
  match: {},
};

const fetchProductivityStandardDetailData = async code => {
  const res = await getProductivityStandardDetail(code);
  const { data } = res || {};
  const { data: detailData } = data || {};

  return detailData;
};

class ProductivityStandardDetail extends Component {
  props: Props;
  state = {
    loading: false,
    data: null,
    code: null,
  };

  componentDidMount() {
    this.fetchAndSetData();
  }

  fetchAndSetData = () => {
    const { match } = this.props;
    const { params } = match || {};
    const { code } = params || {};

    this.setState({
      code,
      loading: true,
    });

    fetchProductivityStandardDetailData(code)
      .then(res => {
        this.setState({
          data: res,
        });
      })
      .finally(() => {
        this.setState({
          loading: false,
        });
      });
  };

  renderTitle = () => {
    return <span style={{ color: black, fontSize: 16 }}>标准产能详情</span>;
  };

  renderOperation = () => {
    const { code } = this.state;

    if (!code) return null;

    return (
      <div>
        <LinkToEditProductivityStandard
          code={code}
          render={() => {
            return (
              <span>
                <Icon type={'bianji'} iconType={'gc'} style={{ verticalAlign: 'middle' }} />
                <span style={{ verticalAlign: 'middle' }}>编辑</span>
              </span>
            );
          }}
        />
        <LinkToProductivityStandardOperationHistory
          code={code}
          render={() => {
            return (
              <span>
                <Icon type={'chakanjilu'} iconType={'gc'} style={{ verticalAlign: 'middle' }} />
                <span style={{ verticalAlign: 'middle' }}>查看操作记录</span>
              </span>
            );
          }}
        />
      </div>
    );
  };

  renderItemContainer = (label, content) => {
    const commonStyle = { display: 'inline-block' };

    return (
      <div style={{ margin: '20px 0', display: 'flex', alignItems: 'flex-start' }}>
        <div style={{ ...commonStyle, color: middleGrey, width: 80, textAlign: 'right' }}>{label}</div>
        <div style={{ ...commonStyle, color: black, marginLeft: 10, maxWidth: 500, wordWrap: 'break-word' }}>
          {content || replaceSign}
        </div>
      </div>
    );
  };

  render() {
    const { loading, data, code: productivityStandardCode } = this.state;

    const {
      code,
      status,
      materialCode,
      materialName,
      workstationName,
      timeInterval,
      timeUnit,
      amount,
      unit,
      toolingCode,
      toolingName,
      standardType,
    } = data || {};

    const _status = status >= 0 ? statusDisplay[status] : null;
    const _process = getProcessMessage(data);
    const _material = materialName && materialCode ? `${materialCode}/${materialName}` : null;
    const _workstation = workstationName || replaceSign;
    const tooling = toolingCode ? `${toolingCode}/${toolingName}` : replaceSign;
    const standardMessage = getStandardMessage(timeInterval, timeUnit, amount, unit, standardType);

    return (
      <div style={{ padding: 20 }}>
        <div style={{ margin: '10px 0px 20px 0', display: 'flex', alignItems: 'center' }}>
          {this.renderTitle()}
          <div style={{ flex: 1, textAlign: 'right' }}>{this.renderOperation()}</div>
        </div>
        <Spin spinning={loading}>
          {this.renderItemContainer('编号', code)}
          {this.renderItemContainer(
            '状态',
            <div style={{ display: 'inline-block' }}>
              <span>{_status}</span>
              <ChangeStatus
                statusNow={status}
                fetchData={this.fetchAndSetData}
                code={productivityStandardCode}
                render={str => {
                  return (
                    <span
                      style={{
                        background: str === '停用' ? error : primary,
                        color: white,
                        width: 40,
                        borderRadius: 8,
                        padding: '0px 5px',
                        marginLeft: 5,
                        cursor: 'pointer',
                      }}
                    >
                      {str}
                    </span>
                  );
                }}
              />
            </div>,
          )}
          {this.renderItemContainer('工序', <div style={{ width: 700 }}>{_process}</div>)}
          {this.renderItemContainer('物料', _material)}
          {toolingCode ? this.renderItemContainer('模具', tooling) : null}
          {this.renderItemContainer('工位', _workstation)}
          {this.renderItemContainer('标准', standardMessage || replaceSign)}
        </Spin>
      </div>
    );
  }
}

export default ProductivityStandardDetail;
