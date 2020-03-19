import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';

import { replaceSign } from 'src/constants';
import moment from 'src/utils/time';
import { black, border, fontSub } from 'src/styles/color';
import { Row, Col, Spin, FormattedMessage } from 'src/components';
import { getProcessRoutingByCode } from 'src/services/bom/processRouting';
import Table from 'src/containers/processRouting/detail/table';
import UpdateStatus from 'src/containers/processRouting/base/updateStatus';
import LinkToEdit from 'src/containers/processRouting/base/linkToEdit';
import LinkToCopy from 'src/containers/processRouting/base/linkToCopy';
import LinkToHistory from 'src/containers/processRouting/base/linkToOperationHistory';
import { STATUS } from 'src/containers/processRouting/constant';
import ProcessRouteGraph from 'src/containers/processRouting/base/form/graph';
import ProcessListClass from 'src/containers/processRouting/base/form/processListClass';
import { convertPreparationTimeToRightFormat } from 'src/containers/processRouting/util';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';

const colStyle = { marginRight: 60 };
const labelStyle = {
  width: 100,
  marginRight: 10,
  textAlign: 'right',
  paddingRight: 10,
  display: 'inline-block',
  color: fontSub,
  verticalAlign: 'top',
};
const valueStyle = { width: 200, display: 'inline-block', textAlign: 'left' };

const getFormatDate = timestamp => {
  if (!timestamp) {
    return null;
  }
  return moment(Number(timestamp)).format('YYYY/MM/DD');
};

type Props = {
  viewer: any,
  match: {},
};

class ProcessRouteDetail extends Component {
  props: Props;
  state = {
    loading: false,
    data: {},
  };

  componentDidMount() {
    this.fetchAndSetData();
  }

  fetchAndSetData = () => {
    const { match } = this.props;
    const code = _.get(match, 'params.id');

    this.setState({ loading: true });
    getProcessRoutingByCode({ code })
      .then(res => {
        const data = _.get(res, 'data.data');
        this.setState({ data });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  renderProcessListChart = () => {
    const { processList } = this.state.data;

    const _formatData =
      Array.isArray(processList) &&
      _.cloneDeep(processList).map(data => {
        const { nodes } = data;
        if (Array.isArray(nodes)) {
          data.nodes = nodes.map(({ processCode, processName }) => {
            return {
              process: {
                code: processCode,
                name: processName,
              },
            };
          });
        }
        return data;
      });

    return <ProcessRouteGraph ProcessListData={new ProcessListClass(_formatData)} />;
  };

  renderProcessListTable = () => {
    const { processList } = this.state.data;

    const _data = [];
    if (processList) {
      processList.forEach(({ nodes, seq, name }) => {
        const isParallelProcess = nodes && nodes.length > 1;
        if (nodes) {
          nodes.forEach(
            ({
              nodeCode,
              processCode,
              processName,
              process,
              productDesc,
              attachmentFiles,
              qcConfigDetails,
              workstationDetails,
              successionMode,
              preparationTime,
              preparationTimeCategory,
              deliverable,
            }) => {
              let _workstations = [];
              if (Array.isArray(workstationDetails)) {
                _workstations = _workstations.concat(workstationDetails.map(({ name }) => name));
              }
              const { unqualifiedProducts } = process || {};
              _data.push({
                alwaysOneCode: process && process.alwaysOneCode,
                No: nodeCode,
                codeAndName: `${processCode}/${processName}`,
                workstations: _workstations.join(' '),
                isParallelProcess,
                successionMode,
                preparationTime: convertPreparationTimeToRightFormat(preparationTime, preparationTimeCategory),
                preparationTimeCategory,
                parallelProcessName: name,
                codeScanNum: process ? process.codeScanNum : null,
                fifo: process ? process.fifo : null,
                productDesc,
                deliverable,
                attachments: attachmentFiles,
                defects:
                  process && Array.isArray(process.processDefects)
                    ? process.processDefects.map(e => _.get(e, 'defect.name'))
                    : null,
                qcConfigDetails,
                outputFrozen: process ? process.outputFrozenCategory : null,
                unqualifiedProducts,
              });
            },
          );
        }
      });
    }

    return <Table dataSource={_data} />;
  };

  renderReleaseState = () => {
    const { data } = this.state;
    const { status } = data;

    return (
      <div>
        <FormattedMessage style={labelStyle} defaultMessage={'发布状态'} />
        {typeof status === 'number' ? (
          <div style={{ display: 'inline-block' }}>
            <FormattedMessage
              style={{ ...valueStyle, width: 'auto', paddingRight: 10 }}
              defaultMessage={STATUS[status]}
            />
            <UpdateStatus processRouting={data} fetchData={this.fetchAndSetData} />
          </div>
        ) : (
          replaceSign
        )}
      </div>
    );
  };

  renderOperationButtonGroups = () => {
    const { code, status } = this.state.data;
    return (
      <div>
        <LinkToEdit style={{ margin: '0px 20px' }} iconType={'edit'} id={code} statusNow={status} />
        <LinkToCopy style={{ margin: '0px 20px' }} iconType={'copy'} id={code} />
        <LinkToHistory style={{ margin: '0px 20px' }} iconType={'bars'} id={code} />
      </div>
    );
  };

  render() {
    const { data, loading } = this.state;
    const { code, name, validFrom, validTo } = data || {};

    return (
      <Spin spinning={loading}>
        <div style={{ padding: '20px 20px' }}>
          <Row style={{ justifyContent: 'space-between', marginBottom: 30 }}>
            <Col>
              <div style={{ fontSize: 16, color: black }}>{changeChineseToLocaleWithoutIntl('工艺路线详情')}</div>
            </Col>
            <Col>{this.renderOperationButtonGroups()}</Col>
          </Row>
          <Row style={{ marginBottom: 20 }}>
            <Col style={colStyle}>
              <FormattedMessage style={labelStyle} defaultMessage={'编号'} />
              <span style={valueStyle}>{code || replaceSign}</span>
            </Col>
            <Col style={colStyle}>
              <FormattedMessage style={labelStyle} defaultMessage={'名称'} />
              <span style={valueStyle}>{name || replaceSign}</span>
            </Col>
            <Col>
              <FormattedMessage style={labelStyle} defaultMessage={'有效期'} />
              <span style={valueStyle}>
                {getFormatDate(validFrom)}~{getFormatDate(validTo)}
              </span>
            </Col>
          </Row>
          <Row style={{ marginBottom: 20 }}>
            <Col>{this.renderReleaseState()}</Col>
          </Row>
          <Row>
            <Col style={{ width: '100%' }}>
              <span style={{ ...labelStyle, display: 'inline-block' }}>
                {changeChineseToLocaleWithoutIntl('工序列表')}
              </span>
              <div
                style={{
                  display: 'inline-block',
                  verticalAlign: 'top',
                  border: `1px solid ${border}`,
                  width: 'calc( 100% - 150px )',
                }}
              >
                {this.renderProcessListChart()}
                <div style={{ paddingTop: 20, height: 550, overflow: 'scroll' }}>{this.renderProcessListTable()}</div>
              </div>
            </Col>
          </Row>
        </div>
      </Spin>
    );
  }
}

export default withRouter(ProcessRouteDetail);
