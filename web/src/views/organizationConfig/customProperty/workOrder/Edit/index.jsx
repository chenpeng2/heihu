import React, { useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import { Spin } from 'components';
import { withRouter } from 'react-router-dom';
import WorkOrderCPModel from 'models/organizationConfig/WorkOrderCPModel';
import { updateWorkOrderCustomProperty, getWorkOrderCustomProperty } from 'services/cooperate/plannedTicket';
import Form from './Form';
import Header from '../components/Header';
import Footer from '../components/Footer';

type Props = {
  history: any,
};

/** 编辑销售订单自定义字段 */
const Edit = (props: Props) => {
  const [model, setModel] = useState(WorkOrderCPModel.of());
  const [spinning, setSpinning] = useState(true);
  const { history } = props;
  const formRef = useRef(null);

  const onCancel = () => {
    history.push('/customProperty/workOrder/detail');
  };

  const onConfirm = () => {
    const fetchData = async () => {
      if (formRef && formRef.current && formRef.current.wrappedInstance) {
        try {
          const formValue = await formRef.current.wrappedInstance.getFormValue();
          if (formValue) {
            const dto = model.getCustomPropertyDTO(formValue);
            setSpinning(true);
            const response = await updateWorkOrderCustomProperty(dto);
            if (response) {
              history.push('/customProperty/workOrder/detail');
            }
          }
        } catch (error) {
          //
        }
        setSpinning(false);
      }
    };
    fetchData();
  };

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await getWorkOrderCustomProperty();
        const properties = _.get(response, 'data.data', []);
        model.properties = properties;
        setModel(model);
      } catch (error) {
        //
      }
      setSpinning(false);
    };
    fetchProperty();
  }, []);

  return (
    <Spin spinning={spinning}>
      <div>
        <Header title="编辑计划工单自定义字段" />
        <Form initialData={model.properties} wrappedComponentRef={formRef} />
        <Footer onCancel={onCancel} onConfirm={onConfirm} />
      </div>
    </Spin>
  );
};

const routerWrapper = withRouter(Edit);

export default routerWrapper;
