import React, { Component } from 'react';
import { withRouter, Prompt } from 'react-router-dom';
import _, { cloneDeep } from 'lodash';
import { history } from 'src/routes';
import { black } from 'src/styles/color';
import SaveConfirmModal from 'src/containers/processRouting/edit/saveConfirmModal';
import { FormattedMessage } from 'components';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';
import {
  createUUID,
  formatPostProcessRouteData,
  validatePostProcessRouteData,
  convertPreparationTimeToRightFormat,
} from 'src/containers/processRouting/util';
import BasicForm from 'src/containers/processRouting/base/form';
import { getProcessRoutingByCode, updateProcessRouting } from 'src/services/bom/processRouting';
import { getMbomByProcessRouting } from 'src/services/bom/mbom';
import { LEAVING_MESSAGE } from 'src/containers/processRouting/constant';
import { arrayIsEmpty } from 'utils/array';
import { toProcessRouteDetail } from './utils';

const getProcessRoutingData = async code => {
  const res = await getProcessRoutingByCode({ code });
  return _.get(res, 'data.data');
};

type Props = {
  router: any,
  match: {},
};

class EditProcessRoute extends Component {
  props: Props;

  state = {
    visible: false,
    successMessage: null,
    mBomsData: [],
    errorMessage: null,
    confirmType: null,
    processRoutingData: {},
    effectStandardCapacitys: [],
  };

  async componentDidMount() {
    await this.getProcessRoutingDataAndSet(this.props);
  }

  getProcessRoutingDataAndSet = async props => {
    const { match } = props;
    const code = _.get(match, 'params.id');

    this.setState({ loading: true });

    return getProcessRoutingData(code)
      .then(data => {
        const { processList } = data || {};
        const formatProcessData = processData => {
          if (!processData) {
            return [];
          }
          if (processData && Array.isArray(processData.nodes)) {
            processData.nodes = processData.nodes.map(node => {
              const {
                preparationTime,
                preparationTimeCategory,
                qcConfigDetails,
                processName,
                processCode,
                attachmentFiles,
                workstationDetails,
              } = node;

              node.qcConfigs = qcConfigDetails || [];
              node.processUUID = createUUID();
              node.workstations = workstationDetails
                .filter(e => e.status === 1)
                .map(e => ({ value: `WORKSTATION-${e.id}`, label: e.name }));
              node.process = { code: processCode, name: processName };
              node.attachments = Array.isArray(attachmentFiles)
                ? attachmentFiles.map(item => {
                    item.restId = item ? item.id : null;
                    return item;
                  })
                : [];
              node.preparationTimeCategory = preparationTimeCategory;
              node.preparationTime = convertPreparationTimeToRightFormat(preparationTime, preparationTimeCategory);

              return node;
            });
          }

          processData.processContainerUUID = createUUID();
          return processData;
        };

        if (Array.isArray(processList)) {
          data.processList = processList.map(processData => {
            return formatProcessData(processData);
          });
        }

        this.setState({
          processRoutingData: data,
        });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  saveData = _data => {
    const { match } = this.props;
    let data = cloneDeep(_data);

    // id
    const code = _.get(match, 'params.id');
    data.id = decodeURIComponent(code);
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

    updateProcessRouting(code, data).then(res => {
      const status = _.get(res, 'status');
      const { effectStandardCapacitys } = res.data.data;
      if (status === 200) {
        getMbomByProcessRouting(code).then(res => {
          const mBoms = _.get(res, 'data.data');
          const mBomLength = Array.isArray(mBoms) && mBoms.length;
          if (sensors) {
            sensors.track('web_bom_processRoute_edit', {});
          }
          if (!mBomLength && arrayIsEmpty(effectStandardCapacitys)) {
            this.setState({ confirmType: 'success' });
            const processRoutingId = _.get(this, 'props.match.params.id');
            history.push(toProcessRouteDetail(processRoutingId));
            return;
          }

          this.setState({
            visible: mBomLength > 0 || !arrayIsEmpty(effectStandardCapacitys),
            confirmType: 'success',
            mBomsData: mBoms,
            successMessage: null,
            effectStandardCapacitys,
          });
        });
      }
    });
  };

  render() {
    const { visible, errorMessage, mBomsData, confirmType, processRoutingData, effectStandardCapacitys } = this.state;

    return (
      <div style={{ padding: '20px 20px' }}>
        <Prompt message={changeChineseToLocaleWithoutIntl(LEAVING_MESSAGE)} when={confirmType !== 'success'} />
        <div style={{ fontSize: 16, color: black }}>
          <FormattedMessage defaultMessage={'编辑工艺路线'} />
        </div>
        <BasicForm
          editingProcessRouteGraph
          isEdit
          saveButtonText={'保存'}
          processRoutingData={processRoutingData}
          onSaveButtonClick={this.saveData}
          isCodeDisable
        />
        <SaveConfirmModal
          code={_.get(this.props.match, 'params.id')}
          onVisibleChange={value => {
            this.setState({ visible: value });
          }}
          visible={visible}
          errorMessage={errorMessage}
          listData={mBomsData}
          effectStandardCapacitys={effectStandardCapacitys}
        />
      </div>
    );
  }
}

export default withRouter(EditProcessRoute);
