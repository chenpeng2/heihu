import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import Table from 'containers/materilCustomProperty/detail/table';
import SaleOrderCPModel from 'models/organizationConfig/SaleOrderCPModel';
import { replaceSign } from 'constants';
import { Spin } from 'components';
import { getSaleOrderCustomProperty } from 'services/cooperate/purchaseOrder';
import Header from '../components/Header';
import Button from '../components/Button';

const Field = ({ text }) => {
  return <span>{text || replaceSign}</span>;
};

const getColumns = () => {
  return [
    {
      title: '字段名称',
      dataIndex: 'keyName',
      width: 250,
      render: text => <Field text={text} />,
    },
    {
      title: '最大字符数',
      dataIndex: 'keyLength',
      width: 150,
      render: text => <Field text={text} />,
    },
    {
      title: '位置',
      dataIndex: 'keyType',
      width: 150,
      render: data => <Field text={data} />,
    },
  ];
};

type Props = {
  history: any,
};

/** 销售订单自定义字段 */
const Detail = (props: Props) => {
  const [model, setModel] = useState(SaleOrderCPModel.of());
  const [spinning, setSpinning] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getSaleOrderCustomProperty();
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

  const { history } = props;
  const onEdit = () => {
    history.push('/customProperty/saleOrder/edit');
  };
  const columns = getColumns();

  return (
    <Spin spinning={spinning}>
      <div>
        <Header title="销售订单自定义字段" action={<Button title="编辑" iconType="edit" onClick={onEdit} />} />
        <Table data={model.fields} columns={columns} />
      </div>
    </Spin>
  );
};

const routerWrapper = withRouter(Detail);

export default routerWrapper;
