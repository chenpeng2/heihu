import React, { useState, useEffect } from 'react';
import { withForm, Spin, message } from 'components';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import CreateTransferApplyModel from 'models/stock/transferApply/CreateTransferApplyModel';
import { createTransferApplyDetail, createTransferApply } from 'services/schedule';
import Header from './header';
import styles from './styles.scss';
import Footer from './footer';
import ApplyForm from './applyForm';

type Props = {
  form: any,
  history: any,
  location: any,
};

/** 创建转移申请 */
const CreateTransferApplySingle = (props: Props) => {
  const { form, history, location } = props;
  const initialModel = CreateTransferApplyModel.of();
  const [model, setModel] = useState(initialModel);
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setSpinning(true);
      try {
        const taskCode = _.get(location.state, 'taskCode', null);
        const transactionCode = _.get(location.state, 'transactionCode', null);
        const params = { taskCode, transactionCode };
        const response = await createTransferApplyDetail(params);
        const data = _.get(response, 'data.data', null);
        if (!data) return;
        const newModel = CreateTransferApplyModel.fromJson(data);
        setModel(newModel);
      } catch (error) {
        console.log(error);
      }
      setSpinning(false);
    };
    fetchData();
  }, []);

  const onCancel = () => {
    history.goBack();
  };

  const onConfirm = () => {
    form.validateFields((errors, values) => {
      console.log(values);
      if (errors) return;
      const postData = async () => {
        setSpinning(true);
        try {
          const data = model.formData.toJson(values);
          const response = await createTransferApply(data);
          const hint = _.get(response, 'data.data', null);
          if (hint) {
            message.success(hint);
          }
          history.push('/cooperate/taskSchedule');
        } catch (error) {
          console.log(error);
        }
        setSpinning(false);
      };
      postData();
    });
  };

  const onRemoveMaterial = index => {
    const removed = model.formData.removeMaterialAtIndex(index);
    if (!removed) return;
    setModel(_.cloneDeep(model));
    form.resetFields();
  };

  return (
    <Spin spinning={spinning}>
      <div className={styles.createTransferApply}>
        <Header />
        <ApplyForm form={form} data={model.formData} onRemove={onRemoveMaterial} />
        <Footer onCancel={onCancel} onConfirm={onConfirm} />
      </div>
    </Spin>
  );
};

const FormWrapper = withForm({}, CreateTransferApplySingle);
const RouterWrapper = withRouter(FormWrapper);

export default RouterWrapper;
