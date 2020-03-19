import React, { Component } from 'react';
import { withRouter, Prompt } from 'react-router-dom';
import _ from 'lodash';
import { history } from 'src/routes';
import { black } from 'src/styles/color';
import { getProcessRoutingCode, addProcessRouting } from 'src/services/bom/processRouting';
import { validatePostProcessRouteData, formatPostProcessRouteData } from 'src/containers/processRouting/util';
import BasicForm from 'src/containers/processRouting/base/form';
import SaveConfirmModal from 'src/containers/processRouting/create/saveConfirmModal';
import { LEAVING_MESSAGE } from 'src/containers/processRouting/constant';
import { FormattedMessage } from 'components';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';
import { toProcessRouteDetail } from './utils';

type Props = {
  match: any,
  router: any,
};

class CreateProcessRoute extends Component {
  props: Props;

  state = {
    confirmType: null,
    visible: false,
    errorMessage: null,
    processRoutingId: null,
    processRoutingData: null,
    processRoutingCode: null,
  };

  componentDidMount() {
    // 如果是创建就需要拉取code，编辑不需要
    this.setState({ loading: true });

    getProcessRoutingCode()
      .then(res => {
        const code = _.get(res, 'data.data');
        const processRoutingData = {
          code,
          processList: [],
        };

        this.setState({ processRoutingData });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  }

  saveData = data => {
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
    const _data = formatPostProcessRouteData(data);

    addProcessRouting(_data).then(res => {
      if (!res) {
        return null;
      }

      if (sensors) {
        sensors.track('web_bom_processRoute_create', {
          CreateMode: '手动创建',
          amount: 1,
        });
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
    const { processRoutingData, confirmType, visible, errorMessage, processRoutingCode } = this.state;

    return (
      <div style={{ padding: '20px 20px' }}>
        <Prompt message={changeChineseToLocaleWithoutIntl(LEAVING_MESSAGE)} when={confirmType !== 'success'} />
        <div style={{ fontSize: 16, color: black }}>
          <FormattedMessage defaultMessage={'创建工艺路线'} />
        </div>
        <BasicForm editingProcessRouteGraph onSaveButtonClick={this.saveData} processRoutingData={processRoutingData} />
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
    );
  }
}

export default withRouter(CreateProcessRoute);
