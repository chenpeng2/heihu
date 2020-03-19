import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';

import { Button } from 'src/components';
import { black } from 'src/styles/color';
import BaseForm from 'src/containers/workingTime/base/form/baseForm';
import { createWorkingTime } from 'src/services/knowledgeBase/workingTime';
import { formatTimeToString } from 'src/containers/workingTime/utils';

type Props = {
  history: any,
};

class Create extends Component {
  props: Props;
  state = {};

  renderTile = () => {
    const style = {
      margin: '20px 0 30px 20px',
      color: black,
      fontSize: 16,
    };

    return <div style={style}>创建工作时间</div>;
  };

  renderBaseForm = () => {
    return <BaseForm wrappedComponentRef={inst => (this.BaseFormRef = inst)} />;
  };

  renderFooterButtons = () => {
    const containerStyle = { marginLeft: 120 };
    const buttonStyle = { marginRight: 60, width: 114 };

    return (
      <div style={containerStyle}>
        <Button
          type={'default'}
          style={buttonStyle}
          onClick={() => {
            this.props.history.push('/knowledgeManagement/workingTime');
          }}
        >
          取消
        </Button>
        <Button
          style={buttonStyle}
          onClick={() => {
            const formValue = this.BaseFormRef.wrappedInstance.getFormValue();

            if (!formValue) return;

            const { name, status, timeBucket } = formValue;

            createWorkingTime({
              name,
              status,
              period: timeBucket
                .filter(
                  item =>
                    item &&
                    item.startTime &&
                    item.startTime.hour &&
                    item.startTime.minute &&
                    item.endTime &&
                    item.endTime.hour &&
                    item.endTime.minute,
                )
                .map(({ seq, startTime, endTime }) => {
                  if (!startTime || !endTime) return null;

                  return {
                    seq,
                    startTime: `${formatTimeToString(startTime.hour)}:${formatTimeToString(startTime.minute)}`,
                    endTime: `${formatTimeToString(endTime.hour)}:${formatTimeToString(endTime.minute)}`,
                  };
                })
                .filter(a => a),
            }).then(res => {
              const id = _.get(res, 'data.data');
              this.props.history.push(`/knowledgeManagement/workingTime/${id}/detail`);
            });
          }}
        >
          保存
        </Button>
      </div>
    );
  };

  render() {
    return (
      <div>
        {this.renderTile()}
        {this.renderBaseForm()}
        {this.renderFooterButtons()}
      </div>
    );
  }
}

export default withRouter(Create);
