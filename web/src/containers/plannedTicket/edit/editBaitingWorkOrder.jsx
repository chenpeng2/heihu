import React, { Component } from 'react';
import _ from 'lodash';
import { Spin } from 'antd';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { Button, withForm } from 'src/components';
import { queryBaitingWorkOrderDetail, editBaitingWorkOrder } from 'src/services/cooperate/plannedTicket';

import { formatFormValueForSubmit, getDisableListForPlannedTicket } from '../util';
import BaitingWorkOrderBaseForm from '../base/baitingWorkOrderBaseForm';
import styles from '../styles.scss';

type Props = {
  match: any,
  form: {
    validateFieldsAndScroll: () => {},
  },
};

class EditBaitingWorkOrder extends Component {
  props: Props;
  constructor(props) {
    super(props);
    this.baitingWorkOrderBaseForm = React.createRef();
    this.state = {
      data: {},
      loading: false,
    };
  }

  componentDidMount = () => {
    this.fetchData();
  };

  fetchData = async () => {
    const id = _.get(this.props, 'match.params.id');
    this.setState({ loading: true });
    const {
      data: { data },
    } = await queryBaitingWorkOrderDetail(decodeURIComponent(id));
    this.setState({ loading: false, data });
  };

  formatValue = values => {
    const { planners, managers, purchaseOrder, attachments: files, customFields, ...rest } = values;
    const attachments = files && files.map(({ id }) => id);
    const purchaseOrderCode = purchaseOrder && purchaseOrder.key;
    const plannerId = Array.isArray(planners) && planners.length > 0 ? planners.map(({ key }) => key) : null;
    const managerId = Array.isArray(managers) && managers.length > 0 ? managers.map(({ key }) => key) : null;

    return {
      purchaseOrderCode,
      attachments,
      plannerId,
      managerId,
      customFields: customFields
        ? _.map(customFields, (value, key) => ({
            name: key,
            content: value,
          }))
        : undefined,
      ...rest,
    };
  };

  onSubmit = () => {
    const {
      form: { validateFieldsAndScroll },
    } = this.props;
    validateFieldsAndScroll(async (err, values) => {
      if (!err) {
        const materials = this.baitingWorkOrderBaseForm.current.onSubmit();
        const format = this.formatValue({ ...values, ...materials });
        const { code } = format;
        await editBaitingWorkOrder(format).then(({ data: { data, statusCode } }) => {
          if (statusCode === 200) {
            this.context.router.history.push(`/cooperate/plannedTicket/baiting/detail/${encodeURIComponent(code)}`);
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
          <BaitingWorkOrderBaseForm
            ref={this.baitingWorkOrderBaseForm}
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

EditBaitingWorkOrder.contextTypes = {
  router: PropTypes.object,
};

export default withForm({}, withRouter(EditBaitingWorkOrder));
