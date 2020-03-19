import React, { Component } from 'react';
import { withRouter, Prompt } from 'react-router-dom';
import _, { cloneDeep } from 'lodash';

import { Spin, FormattedMessage } from 'src/components';
import { black } from 'src/styles/color';
import { getProcessRoutingCode, getProcessRoutingByCode, addProcessRouting } from 'src/services/bom/processRouting';
import {
  createUUID,
  validatePostProcessRouteData,
  formatPostProcessRouteData,
  convertPreparationTimeToRightFormat,
} from 'src/containers/processRouting/util';
import BasicForm from 'src/containers/processRouting/base/form';
import { LEAVING_MESSAGE } from 'src/containers/processRouting/constant';
import SaveConfirmModal from 'src/containers/processRouting/create/saveConfirmModal';
import { history } from 'routes';
import { toProcessRouteDetail } from './utils';
import { changeChineseToLocaleWithoutIntl } from '../../../utils/locale/utils';

const getProcessRoutingData = async code => {
  const res = await getProcessRoutingByCode({ code });
  return _.get(res, 'data.data');
};

type Props = {
  match: any,
  viewer: any,
  router: any,
};

class CopyProcessRoute extends Component {
  props: Props;

  state = {
    loading: false,
    confirmType: null,
    visible: false,
    errorMessage: null,
    processRoutingId: null,
    processRoutingData: null,
  };

  componentDidMount() {
    this.getProcessRoutingDataAndSet(this.props);
  }

  getProcessRoutingDataAndSet = props => {
    const { match } = props;
    const code = _.get(match, 'params.id');

    this.setState({ loading: true });

    getProcessRoutingData(code)
      .then(data => {
        const { processList } = data || {};

        const formatProcessData = processData => {
          if (!processData) {
            return [];
          }
          if (processData && Array.isArray(processData.nodes)) {
            processData.nodes.map(node => {
              const {
                preparationTime,
                preparationTimeCategory,
                qcConfigDetails,
                workstationDetails,
                processName,
                processCode,
                attachmentFiles,
              } = node;

              node.qcConfigs = qcConfigDetails || [];
              node.processUUID = createUUID();
              node.process = { code: processCode, name: processName };
              node.workstations = workstationDetails
                .filter(e => e.status === 1)
                .map(e => ({ value: `WORKSTATION-${e.id}`, label: e.name }));
              node.attachments = Array.isArray(attachmentFiles)
                ? attachmentFiles.map(item => {
                    item.restId = item ? item.id : null;
                    return item;
                  })
                : [];
              node.preparationTime = convertPreparationTimeToRightFormat(preparationTime, preparationTimeCategory);
              node.preparationTimeCategory = preparationTimeCategory;

              return node;
            });
          }

          processData.processContainerUUID = createUUID();
          return processData;
        };

        if (Array.isArray(processList)) {
          processList.map(processData => {
            return formatProcessData(processData);
          });
        }

        return data;
      })
      .then(data => {
        getProcessRoutingCode().then(res => {
          data.code = _.get(res, 'data.data');
          this.setState({
            processRoutingData: data,
          });
        });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  saveData = _data => {
    const { match } = this.props;
    let data = cloneDeep(_data);

    const code = _.get(match, 'params.id');

    // 数据验证
    const validateRes = validatePostProcessRouteData(data);
    if (!validateRes.res) {
      this.setState({
        confirmType: 'error',
        visible: true,
        errorMessage: validateRes.message,
      });
      return;
    }

    // 数据适配
    data = formatPostProcessRouteData(data);
    data.copiedCode = decodeURIComponent(code);

    addProcessRouting(data).then(res => {
      if (!res) {
        return null;
      }

      const code = _.get(res, 'data.data.code');
      if (!code) {
        return null;
      }

      this.setState({
        confirmType: 'success',
        visible: true,
        processRoutingCode: code,
      });
      history.push(toProcessRouteDetail(code));

      return null;
    });
  };

  render() {
    const { loading } = this.state;
    const { confirmType, visible, errorMessage, processRoutingCode, processRoutingData } = this.state;

    return (
      <Spin spinning={loading}>
        <div style={{ padding: '20px 20px' }}>
          <Prompt message={changeChineseToLocaleWithoutIntl(LEAVING_MESSAGE)} when={confirmType !== 'success'} />
          <div style={{ fontSize: 16, color: black }}>
            <FormattedMessage defaultMessage={'创建工艺路线'} />
          </div>
          <BasicForm
            editingProcessRouteGraph
            processRoutingData={processRoutingData}
            onSaveButtonClick={this.saveData}
          />
          <SaveConfirmModal
            onVisibleChange={value => {
              this.setState({ visible: value });
            }}
            confirmType={confirmType}
            visible={visible}
            errorMessage={errorMessage}
            processRoutingCode={processRoutingCode}
          />
        </div>
      </Spin>
    );
  }
}

export default withRouter(CopyProcessRoute);
