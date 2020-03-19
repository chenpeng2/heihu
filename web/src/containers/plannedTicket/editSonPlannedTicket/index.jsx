import React, { Component } from 'react';
import _ from 'lodash';
import { Spin } from 'antd';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { Button, withForm } from 'components';
import { queryPlannedTicketDetail, editSubPlannedTicket } from 'src/services/cooperate/plannedTicket';

import PlannedTicketBaseForm from '../createSonPlannedTicket/baseForm';
import PlannedTicketDetailCard from '../createSonPlannedTicket/plannedTicketDetailCard';
import styles from '../styles.scss';
import { formatFormValueForSubmit, getDisableListForPlannedTicket } from '../util';

type Props = {
  match: any,
  form: {
    validateFieldsAndScroll: () => {},
  },
};

class EditPlannedTicket extends Component {
  props: Props;
  state = {
    data: {},
    loading: false,
  };

  componentDidMount = () => {
    this.fetchData();
  };

  fetchData = async () => {
    const {
      match: {
        params: { id },
      },
    } = this.props;
    this.setState({ loading: true });
    const {
      data: { data },
    } = await queryPlannedTicketDetail(decodeURIComponent(id));

    let fatherPlanTicketData = null;
    const fatherPlannedTicketCode = _.get(data, 'parentCode');

    if (fatherPlannedTicketCode) {
      const fatherPlannedTicketRes = await queryPlannedTicketDetail(fatherPlannedTicketCode);
      fatherPlanTicketData = _.get(fatherPlannedTicketRes, 'data.data');
    }

    this.setState({ loading: false, data, fatherPlanTicketData });
  };

  onSubmit = () => {
    const {
      form: { validateFieldsAndScroll },
    } = this.props;
    validateFieldsAndScroll(async (err, values) => {
      if (!err) {
        const format = formatFormValueForSubmit(values);
        const { code } = format;

        await editSubPlannedTicket(code, format).then(({ data: { data, statusCode } }) => {
          if (statusCode === 200) {
            this.context.router.history.push(`/cooperate/plannedTicket/detail/${encodeURIComponent(code)}`);
          }
        });
      }
    });
  };

  renderFatherProjectDetail = () => {
    return <PlannedTicketDetailCard fatherProjectDetail={this.state.fatherPlanTicketData} />;
  };

  render() {
    const { loading, data } = this.state;
    const { form } = this.props;

    const disabledList = getDisableListForPlannedTicket(_.get(data, 'status'));

    return (
      <Spin spinning={loading}>
        {this.renderFatherProjectDetail()}
        <div className={styles.pageStyle}>
          <div className={styles.pageHeader}>
            <p>编辑子计划工单</p>
          </div>
          <PlannedTicketBaseForm
            fatherPlannedTicketCode={data ? data.parentCode : null}
            fatherPlannedTicketDetail={this.state.fatherPlanTicketData}
            data={data}
            form={form}
            editing
            disabledList={disabledList}
          />
          <div style={{ paddingLeft: 120, marginTop: 30 }}>
            <Button
              type="default"
              className={styles.buttonStyle}
              onClick={() => {
                const { router } = this.context;
                if (router) {
                  router.history.go(-1);
                }
              }}
            >
              取消
            </Button>
            <Button type="primary" className={styles.buttonStyle} onClick={this.onSubmit}>
              保存
            </Button>
          </div>
        </div>
      </Spin>
    );
  }
}

EditPlannedTicket.contextTypes = {
  router: PropTypes.object,
};

export default withForm({}, withRouter(EditPlannedTicket));
