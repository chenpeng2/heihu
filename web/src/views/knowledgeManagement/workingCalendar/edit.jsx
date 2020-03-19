import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';

import moment from 'src/utils/time';
import { Button, Spin } from 'src/components';
import { black } from 'src/styles/color';
import BaseForm, { formatValue as formatBaseFormValue } from 'src/containers/workingCalendar/base/baseForm';
import { editWorkingCalendar, getWorkingCalendarDetail } from 'src/services/knowledgeBase/workingCalendar';
import { AVAILABLE_DATE_TYPE } from 'src/containers/workingCalendar/constant';

const formatInitialValue = value => {
  if (!value) return null;

  const { availableDateType, availableDateValue, workstations, startTime, endTime, workingDay, operatingHour, priority, status } = value;

  // format availableDate
  let _availableDate = null;
  if (availableDateType && AVAILABLE_DATE_TYPE[availableDateType].type === 'specified') {
    _availableDate = { type: availableDateType, date: Array.isArray(availableDateValue) ? availableDateValue.join(',') : undefined };
  }
  if (availableDateType && AVAILABLE_DATE_TYPE[availableDateType].type === 'holiday') {
    _availableDate = { type: availableDateType, date: undefined };
  }
  if (availableDateType && (AVAILABLE_DATE_TYPE[availableDateType].type === 'week' || AVAILABLE_DATE_TYPE[availableDateType].type === 'month')) {
    _availableDate = {
      type: availableDateType,
      date: Array.isArray(availableDateValue) ? availableDateValue.map(value => Number(value)) : undefined,
    };
  }

  const res = {
    availableDate: _availableDate,
    workstations: Array.isArray(workstations) ? workstations.map(({ id, name }) => ({ value: `WORKSTATION-${id}`, label: name })) : null,
    availableDateRange: {
      startTime: startTime ? moment(startTime) : undefined,
      endTime: endTime ? moment(endTime) : undefined,
    },
    workingDay,
    priority,
    workingTime: operatingHour ? { label: operatingHour.name, key: operatingHour.id } : null,
    status: status ? status.code : undefined,
  };

  return res;
};

type Props = {
  style: {},
  history: any,
  match: any,
};

class Edit extends Component {
  props: Props;
  state = {
    id: null,
    loading: false,
    detailData: null,
  };

  componentDidMount() {
    this.fetchAndSetDetailData();
  }

  fetchAndSetDetailData = () => {
    const id = _.get(this.props, 'match.params.id');

    this.setState({ id, loading: true });

    getWorkingCalendarDetail(id)
      .then(res => {
        const data = _.get(res, 'data.data');

        this.setState({ detailData: formatInitialValue(data) });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  renderTile = () => {
    const style = {
      margin: '20px 0 30px 20px',
      color: black,
      fontSize: 16,
    };

    return <div style={style}>编辑规则</div>;
  };

  renderBaseForm = () => {
    const { detailData } = this.state;
    return <BaseForm isEditing wrappedComponentRef={inst => (this.BaseFormRef = inst)} initialValue={detailData} />;
  };

  renderFooterButtons = () => {
    const { id } = this.state;
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

            editWorkingCalendar({ ..._value, id }).then(res => {
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
    const { loading } = this.state;

    return (
      <Spin spinning={loading}>
        {this.renderTile()}
        {this.renderBaseForm()}
        {this.renderFooterButtons()}
      </Spin>
    );
  }
}

export default withRouter(Edit);
