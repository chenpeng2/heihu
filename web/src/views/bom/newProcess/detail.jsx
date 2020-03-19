import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';

import { Spin, Attachment, Row, Col, FormattedMessage } from 'src/components';
import { replaceSign } from 'src/constants';
import { getFifoLabel, getScanNumLabel, getAlwaysOneCodeLabel } from 'src/containers/newProcess/base/Form';
import { getProcessDetail } from 'src/services/process';
import UpdateStatus from 'src/containers/newProcess/base/updateStatus';
import LinkToEditProcess from 'src/containers/newProcess/base/linkToEditProcess';
import LinkToProcessOperationHistory from 'src/containers/newProcess/base/linkToProcessOperationHistory';
import DefetchView from 'src/containers/newProcess/base/defectView';
import { PROCESS_STATUS } from 'src/containers/newProcess/constant';
import {
  useFrozenTime,
  isOrganizationUseQrCode,
  getTaskDeliverableOrganizationConfig,
  includeOrganizationConfig,
  ORGANIZATION_CONFIG,
  configHasSOP,
} from 'src/utils/organizationConfig';
import UnqualifiedProductTip from 'containers/newProcess/base/Form/UnqualifiedProductTip';
import { FIFO_VALUE_DISPLAY_MAP, OUTPUT_FROZEN_CATEGORY } from './utils';

type Props = {
  viewer: any,
  match: {
    params: {
      id: string,
    },
  },
};
const AttachmentFile = Attachment.AttachmentFile;

class ProcessDetail extends Component {
  props: Props;
  state = {
    loading: false,
    processData: null, // 工序的数据
  };

  componentDidMount() {
    this.fetchAndSetData();
  }

  fetchAndSetData = () => {
    const { match } = this.props;
    const processId = _.get(match, 'params.id');

    this.setState({ loading: true });
    getProcessDetail(decodeURIComponent(processId))
      .then(res => {
        const data = _.get(res, 'data.data');

        this.setState({
          processData: data,
        });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  getHeader = (router, id) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 30px 20px' }}>
      <FormattedMessage defaultMessage={'工序详情'} style={{ fontSize: 16 }} />
      <div>
        <LinkToEditProcess iconType={'edit'} code={id} />
        <LinkToProcessOperationHistory code={id} iconType={'bars'} />
      </div>
    </div>
  );

  getStatus = (id, status) => {
    return (
      <React.Fragment>
        <FormattedMessage defaultMessage={`${PROCESS_STATUS[status]}中`} style={{ marginRight: 10 }} />
        <UpdateStatus statusNow={status} code={id} fetchData={this.fetchAndSetData} />
      </React.Fragment>
    );
  };

  getWorkstationName = (workstations, workstationDetails, workstationGroups) => {
    const names = [];

    if (Array.isArray(workstations) && Array.isArray(workstationDetails) && workstationDetails.length) {
      workstations.forEach(i => {
        workstationDetails
          .filter(j => j && j.id === i)
          .forEach(i => {
            names.push(i.name);
          });
      });
    }
    if (Array.isArray(workstationGroups) && workstationGroups.length > 0) {
      workstationGroups.forEach(i => {
        names.push(i.name);
      });
    }

    return names.filter(a => a).join(',');
  };

  render() {
    const { router } = this.context;
    const { processData, loading } = this.state;
    const {
      status,
      code,
      name,
      workstations,
      workstationDetails,
      workstationGroupDetails,
      codeScanNum,
      fifo,
      productDesc,
      attachmentFiles,
      deliverable,
      processDefects: defects,
      outputFrozenCategory,
      batchTemplate,
      alwaysOneCode,
      unqualifiedProducts,
    } = processData || {};
    const useQrCode = isOrganizationUseQrCode();
    const useProduceTaskDeliverable = getTaskDeliverableOrganizationConfig();
    const enableBatch = includeOrganizationConfig(ORGANIZATION_CONFIG.BatchRecord); // 是否启用批记录
    return (
      <Spin spinning={loading}>
        {this.getHeader(router, code)}
        <Row>
          <Col type={'title'}>{'编号'}</Col>
          <Col type={'content'}>{code}</Col>
        </Row>
        <Row>
          <Col type={'title'}>{'名称'}</Col>
          <Col type={'content'}>{name}</Col>
        </Row>
        <Row>
          <Col type={'title'}>{'状态'}</Col>
          <Col type={'content'}>{this.getStatus(code, status)}</Col>
        </Row>
        <Row>
          <Col type={'title'}>{'工位'}</Col>
          <Col type={'content'} style={{ display: 'flex', flex: 1, maxWidth: 900 }}>
            {this.getWorkstationName(workstations, workstationDetails, workstationGroupDetails)}
          </Col>
        </Row>
        {useQrCode ? (
          <Row>
            <Col type={'title'}>{getScanNumLabel()}</Col>
            <Col type={'content'}>{codeScanNum === 1 ? '是' : '否'}</Col>
          </Row>
        ) : null}
        {useQrCode && !configHasSOP() ? (
          <Row>
            <Col type="title">{getAlwaysOneCodeLabel()}</Col>
            <Col type="content">{alwaysOneCode ? '是' : '否'}</Col>
          </Row>
        ) : null}
        {useQrCode ? (
          <Row>
            <Col type={'title'}>{getFifoLabel()}</Col>
            <Col type={'content'}>{FIFO_VALUE_DISPLAY_MAP[fifo]}</Col>
          </Row>
        ) : null}
        {useQrCode && (
          <Row>
            <Col type={'title'}>
              <UnqualifiedProductTip />
            </Col>
            <Col type={'content'}>{unqualifiedProducts ? '允许' : '不允许'}</Col>
          </Row>
        )}
        <Row>
          <Col type={'title'}>{'次品项列表'}</Col>
          <Col type={'content'} style={{ display: 'flex', flex: 1, maxWidth: 900 }}>
            <DefetchView
              value={
                Array.isArray(defects)
                  ? defects.map(({ defect }) => {
                      return defect;
                    })
                  : []
              }
            />
          </Col>
        </Row>
        {useProduceTaskDeliverable ? (
          <Row>
            <Col type={'title'}>{'任务下发审批'}</Col>
            <Col type={'content'} style={{ display: 'flex', flex: 1, maxWidth: 900 }}>
              {deliverable ? '是' : '否'}
            </Col>
          </Row>
        ) : null}
        {useFrozenTime() ? (
          <Row>
            <Col type={'title'}>{'产出是否冻结'}</Col>
            <Col type={'content'} style={{ display: 'flex', flex: 1, maxWidth: 900 }}>
              {outputFrozenCategory === OUTPUT_FROZEN_CATEGORY.frozen.value ? '是' : '否'}
            </Col>
          </Row>
        ) : null}
        {enableBatch && (
          <Row>
            <Col type="title">批记录模板链接</Col>
            <Col type="content" style={{ display: 'flex', flex: 1, maxWidth: 900 }}>
              {batchTemplate ? `${batchTemplate.templateName}  ${batchTemplate.templateUrl}` : replaceSign}
            </Col>
          </Row>
        )}
        <Row>
          <Col type={'title'}>{'生产描述'}</Col>
          <Col type={'content'} style={{ display: 'flex', flex: 1, maxWidth: 900 }}>
            {productDesc || replaceSign}
          </Col>
        </Row>
        <Row style={{ alignItems: 'flex-start' }}>
          <Col type={'title'}>{'附件'}</Col>
          <Col type={'content'} style={{ display: 'flex', flex: 1, marginTop: 10 }}>
            {attachmentFiles && attachmentFiles.length > 0 ? AttachmentFile(attachmentFiles) : replaceSign}
          </Col>
        </Row>
      </Spin>
    );
  }
}
ProcessDetail.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default ProcessDetail;
