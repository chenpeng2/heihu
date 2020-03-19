import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import Table from 'containers/materilCustomProperty/detail/table';
import WorkOrderCPModel from 'models/organizationConfig/WorkOrderCPModel';
import { replaceSign } from 'constants';
import { Spin, Link, Icon } from 'components';
import { getWorkOrderCustomProperty } from 'services/cooperate/plannedTicket';
import Header from '../components/Header';

const Field = ({ text }) => {
  return <span>{text || replaceSign}</span>;
};

const getColumns = () => {
  return [
    {
      title: '字段名称',
      dataIndex: 'name',
      width: 250,
      render: text => <Field text={text} />,
    },
    {
      title: '最大字符数',
      dataIndex: 'maxLen',
      width: 150,
      render: text => <Field text={text} />,
    },
  ];
};

type Props = {
  history: any,
};

/** 销售订单自定义字段 */
const Detail = (props: Props) => {
  const [model, setModel] = useState(WorkOrderCPModel.of());
  const [spinning, setSpinning] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getWorkOrderCustomProperty();
        const properties = _.get(response, 'data.data', []);
        model.properties = properties;
        setModel(model);
      } catch (error) {
        console.log(error);
      }
      setSpinning(false);
    };
    fetchData();
  }, []);

  const columns = getColumns();

  return (
    <Spin spinning={spinning}>
      <div>
        <Header
          title="计划工单自定义字段"
          action={
            <Link to={'/customProperty/workOrder/edit'}>
              <Icon type={'edit'} />
              编辑
            </Link>
          }
        />
        <Table data={model.fields} columns={columns} />
      </div>
    </Spin>
  );
};

const routerWrapper = withRouter(Detail);

export default routerWrapper;
