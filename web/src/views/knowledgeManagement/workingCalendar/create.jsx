import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';

import { Button } from 'src/components';
import { black } from 'src/styles/color';
import BaseForm, { formatValue as formatBaseFormValue } from 'src/containers/workingCalendar/base/baseForm';
import { createWorkingCalendar } from 'src/services/knowledgeBase/workingCalendar';

type Props = {
  style: {},
  history: any,
}

class Create extends Component {
  props: Props;
  state = {};

  renderTile = () => {
    const style = {
      margin: '20px 0 30px 20px',
      color: black,
      fontSize: 16,
    };

    return <div style={style}>创建规则</div>;
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
            this.props.history.push('/knowledgeManagement/workingCalendar');
          }}
        >
          取消
        </Button>
        <Button
          style={buttonStyle}
          onClick={async () => {
            const formValue = await this.BaseFormRef.wrappedInstance.getFormValue();

            if (!formValue) return;

            const _value = formatBaseFormValue(formValue);

            createWorkingCalendar(_value).then(res => {
              const id = _.get(res, 'data.data');
              this.props.history.push(`/knowledgeManagement/workingCalendar/${id}/detail`);
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
