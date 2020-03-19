import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Spin } from 'antd';
import { connect } from 'react-redux';
import { borderGrey, oldLightGrey } from 'styles/color';
import WeighingTask from './weighingTask';
import CreatedProduceTask from './createdProduceTask';

type Props = {
  relay: any,
  viewer: any,
  form: any,
  productOrderBomNode: {},
  productOrder: {},
  save: () => {},
  showRelevantPlan: () => {},
  selectedProcess: {},
  match: {},
  fetchData: () => {},
};

class MiddleComponent extends Component {
  props: Props;
  state = {};

  renderConstantTask = ({ type, projectCode }, task) => {
    if (type === 'weighingTask') {
      return <WeighingTask projectCode={projectCode} task={task} key={task.id} />;
    }

    return null;
  };

  render() {
    const { selectedProcess, fetchData } = this.props;
    const { changeChineseToLocale } = this.context;
    const noTaskContent = (
      <div style={{ margin: 20, textAlign: 'center', backgroundColor: '#FFF' }}>
        {changeChineseToLocale('暂无任务')}
      </div>
    );

    if (!selectedProcess) {
      return null;
    }

    return (
      <div>
        {selectedProcess.isConstant
          ? _.get(selectedProcess, 'tasks.length') > 0
            ? selectedProcess.tasks.map(task => this.renderConstantTask(selectedProcess, task))
            : noTaskContent
          : selectedProcess.produceTasks && selectedProcess.produceTasks.length
          ? selectedProcess.produceTasks.map(task => {
              return <CreatedProduceTask key={task.id} fetchData={fetchData} task={task} />;
            })
          : noTaskContent}
      </div>
    );
  }
}

MiddleComponent.contextTypes = {
  router: PropTypes.object,
  changeChineseToLocale: () => {},
};

export default connect(({ lastFormPayload }) => ({ lastFormPayload }))(MiddleComponent);
