import React, { useState, useEffect } from 'react';
import { FormItem, Icon, Input, Link, SimpleTable, Tooltip } from 'components';
import Color from 'styles/color';
import { Tooltip as AntTooltip } from 'antd';

const LimitLoginDevice = props => {
  const {
    form: { getFieldDecorator, setFieldsValue },
    deviceIds,
  } = props;
  const [dataSource, setDataSource] = useState([0]);
  useEffect(() => {
    if (deviceIds && deviceIds.length > 0) {
      setDataSource(deviceIds.map((key, index) => index));
    }
  }, [props.deviceIds]);
  const addColumn = () => {
    setDataSource([...dataSource, dataSource[dataSource.length - 1] + 1]);
  };

  const removeColumn = key => {
    setDataSource(dataSource.filter(n => n !== key));
  };

  const columns = [
    {
      title: '序列',
      key: 'index',
      dataIndex: 'key',
      render: (key, record, index) => (
        <span>
          {dataSource.length > 1 && (
            <Icon type="minus-circle" style={{ marginRight: 4, cursor: 'pointer' }} onClick={() => removeColumn(key)} />
          )}
          {index + 1}
        </span>
      ),
    },
    {
      title: (
        <span>
          设备标签编码
          <Tooltip.AntTooltip title="您可以在黑湖智造移动端登录页面长按&quot;获取设备号&quot;查看您的设备标签">
            <Icon type="exclamation-circle-o" style={{ color: Color.primary, marginLeft: 4 }} />
          </Tooltip.AntTooltip>
        </span>
      ),
      key: 'code',
      dataIndex: 'key',
      render: key => (
        <FormItem>
          {getFieldDecorator(`deviceIds[${key}]`, {
            rules: [{ required: true, message: '设备标签编码必填' }],
            initialValue: deviceIds && deviceIds[key],
          })(<Input />)}
        </FormItem>
      ),
    },
  ];

  return (
    <FormItem label="设备标签">
      <SimpleTable
        pagination={false}
        style={{ width: 300, margin: 0 }}
        columns={columns}
        dataSource={dataSource && dataSource.map(key => ({ key }))}
        footer={() => (
          <Link icon="circle-o-plus" onClick={addColumn}>
            添加一行
          </Link>
        )}
      />
    </FormItem>
  );
};

export default LimitLoginDevice;
