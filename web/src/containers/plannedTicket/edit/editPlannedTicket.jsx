import React, { Component } from 'react';
import _ from 'lodash';
import { Spin } from 'antd';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { Button, withForm } from 'src/components';
import { queryPlannedTicketDetail, editPlannedTicket } from 'src/services/cooperate/plannedTicket';

import { formatFormValueForSubmit, getDisableListForPlannedTicket } from '../util';
import PlannedTicketBaseForm from '../base/plannedTicketForm';
import styles from '../styles.scss';

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
    this.setState({ loading: false, data });
  };

  onSubmit = () => {
    const {
      form: { validateFieldsAndScroll },
    } = this.props;
    validateFieldsAndScroll(async (err, values) => {
      if (!err) {
        const format = formatFormValueForSubmit(values);
        const { code } = format;
        await editPlannedTicket(format).then(({ data: { data, statusCode } }) => {
          if (sensors) {
            sensors.track('web_cooperate_plannedTicket_edit', {});
          }
          if (statusCode === 200) {
            this.context.router.history.push(`/cooperate/plannedTicket/detail/${encodeURIComponent(code)}`);
          }
        });
      }
    });
  };

  render() {
    const { loading, data } = this.state;
    const { form } = this.props;

    const disabledList = getDisableListForPlannedTicket(_.get(data, 'status'));

    return (
      <Spin spinning={loading}>
        <div className={styles.pageStyle}>
          <div className={styles.pageHeader}>
            <p>编辑计划工单</p>
          </div>
          <PlannedTicketBaseForm data={data} form={form} editing disabledList={disabledList} />
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
