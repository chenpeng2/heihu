import React from 'react';
import { withForm, Button, message } from 'components';
import { formatUnixMoment } from 'utils/time';
import { getAttachments } from 'src/services/attachment';
import { getInjectionMouldingWorkOderDetail, editInjectionMouldingWorkOrder } from 'services/cooperate/plannedTicket';
import InjectionMouldingBaseForm, {
  formatInjectionMouldingSubmitValue,
} from 'containers/plannedTicket/base/InjectionMouldingBaseForm';
import { toWorkOrderDetail } from 'views/cooperate/plannedTicket/navigation';
import { PLAN_TICKET_INJECTION_MOULDING, replaceSign } from 'constants';
import { arrayIsEmpty } from 'utils/array';
import styles from '../styles.scss';

class EditInjectionMoulding extends React.PureComponent {
  state = {
    dataSource: [],
  };

  componentDidMount() {
    this.setInitialValue();
  }

  setInitialValue = async () => {
    const {
      match: {
        params: { id },
      },
      form: { setFieldsValue },
    } = this.props;
    const {
      data: { data },
    } = await getInjectionMouldingWorkOderDetail(id);
    const {
      type,
      planners,
      managers,
      subs,
      planBeginTime,
      planEndTime,
      attachments,
      purchaseOrderCode,
      toolCode,
      toolName,
      fieldDTO,
    } = data;
    const customFields = {};
    if (!arrayIsEmpty(fieldDTO)) {
      fieldDTO.forEach(e => (customFields[e.name] = e.content));
    }
    if (!arrayIsEmpty(attachments)) {
      const {
        data: { data: _attachments },
      } = await getAttachments(attachments);
      data.attachments = _attachments;
    }
    let outAmount;
    if (!arrayIsEmpty(subs)) {
      outAmount = (subs[0].totalAmount / subs[0].perAmount).toFixed(6);
    }
    setFieldsValue({
      ...data,
      type,
      outAmount,
      toolCode: toolCode ? { key: toolCode, label: `${toolCode}/${toolName || replaceSign}` } : undefined,
      planners: planners && planners.map(({ id, name }) => ({ key: id, label: name })),
      managers: managers && managers.map(({ id, name }) => ({ key: id, label: name })),
      planEndTime: planEndTime && formatUnixMoment(planEndTime),
      planBeginTime: planBeginTime && formatUnixMoment(planBeginTime),
      customFields,
    });
    setTimeout(() => {
      setFieldsValue({
        purchaseOrder: purchaseOrderCode ? { key: purchaseOrderCode, label: purchaseOrderCode } : undefined,
        customFields,
      });
    });
    this.setState({ dataSource: subs.map(({ desc, unitName }, index) => ({ key: index, desc, unitName })) }, () => {
      setFieldsValue({
        customFields,
        outMaterials: subs.map(({ code, name, totalAmount, perAmount, mbomVersion }) => ({
          code: { key: code, label: `${code}/${name}` },
          totalAmount,
          perAmount,
          mbomVersion,
        })),
      });
    });
  };

  handleSubmit = () => {
    const {
      form: { validateFields },
      history: { push },
      match: {
        params: { id },
      },
    } = this.props;
    validateFields(async (err, values) => {
      if (!err) {
        const submitValue = formatInjectionMouldingSubmitValue(values);
        const {
          data: { data },
        } = await editInjectionMouldingWorkOrder(submitValue);
        message.success('操作成功!');
        push(toWorkOrderDetail({ code: id, category: PLAN_TICKET_INJECTION_MOULDING }));
      }
    });
  };

  render() {
    return (
      <div>
        <div className={styles.pageStyle}>
          <div className={styles.pageHeader}>
            <p>编辑注塑计划工单</p>
          </div>
        </div>
        <InjectionMouldingBaseForm form={this.props.form} dataSource={this.state.dataSource} editing />
        <div style={{ paddingLeft: 120, marginTop: 30 }}>
          <Button type="default" className={styles.buttonStyle}>
            取消
          </Button>
          <Button onClick={this.handleSubmit} className={styles.buttonStyle}>
            保存
          </Button>
        </div>
      </div>
    );
  }
}

export default withForm({}, EditInjectionMoulding);
