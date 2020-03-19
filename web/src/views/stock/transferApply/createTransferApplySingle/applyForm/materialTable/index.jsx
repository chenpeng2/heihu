import React from 'react';
import _ from 'lodash';
import { Table, FormItem, Input, InputNumber } from 'components';
import { lengthValidate, amountValidator } from 'components/form';
import { includeOrganizationConfig, ORGANIZATION_CONFIG } from 'utils/organizationConfig';
import { replaceSign } from 'constants';
import { columnWidth } from '../../constants';
import RemoveButton from '../RemoveButton';
import UnitSelect from './unitSelect';
import styles from '../styles.scss';

type Props = {
  form: any,
  dataSource: any[],
  onRemove: (index: Number) => void,
  onChangeAmount: (amount: Number, index: Number) => void,
  onChangeRemark: (remark: String, index: Number) => void,
};

/** 物料列表 */
const MaterialTable = (props: Props) => {
  const { dataSource, form, onRemove, onChangeAmount, onChangeRemark } = props;
  const { getFieldDecorator, setFieldsValue } = form;

  const renderDelete = (_, record, index) => {
    const onClick = () => onRemove(index);

    return (
      <FormItem>
        <RemoveButton onClick={onClick} />
      </FormItem>
    );
  };

  const renderLineNum = (data, record, index) => {
    const options = { initialValue: data };

    return <FormItem>{form.getFieldDecorator(`materials[${index}].lineNum`, options)(<p>{data}</p>)}</FormItem>;
  };

  const renderCodeAndName = (_, record, index) => {
    const { code, name } = record;
    const codeOptions = { initialValue: code };
    const nameOptions = { initialValue: name };
    getFieldDecorator(`materials[${index}].code`, codeOptions);
    getFieldDecorator(`materials[${index}].name`, nameOptions);

    return (
      <FormItem>
        <p>{`${code}/${name}`}</p>
      </FormItem>
    );
  };

  const renderAmount = (data, record, index) => {
    const requiredRule = { required: true, message: '计划数不能为空' };
    const amountRule = { validator: amountValidator(null, { value: 0, equal: false, message: '数字必需大于0' }) };
    const rules = [requiredRule, amountRule];
    const options = { rules, initialValue: data };
    const inputStyle = { width: 100 };
    const { units, unit } = record;
    const unitOptions = { initialValue: unit };

    const onChange = value => onChangeAmount(value, index);

    return (
      <FormItem>
        {getFieldDecorator(`materials[${index}].amount`, options)(
          <InputNumber style={inputStyle} onChange={onChange} />,
        )}
        {getFieldDecorator(`materials[${index}].unit`, unitOptions)(<UnitSelect units={units} />)}
      </FormItem>
    );
  };

  const renderRemark = (data, _, index) => {
    const rules = [
      {
        validator: lengthValidate(null, 20),
      },
    ];
    const options = { rules, initialValue: data };
    const inputStyle = { width: 100 };

    const onChange = value => onChangeRemark(value, index);

    return (
      <FormItem>
        {getFieldDecorator(`materials[${index}].remark`, options)(<Input style={inputStyle} onChange={onChange} />)}
      </FormItem>
    );
  };

  const renderRatio = (ratio, record, index) => {
    const { amount, unitName, unitId } = ratio || {};
    getFieldDecorator(`materials[${index}].ratio.amount`, {
      initialValue: amount,
    });
    getFieldDecorator(`materials[${index}].ratio.unitId`, {
      initialValue: unitId,
    });
    if (!ratio) {
      return replaceSign;
    }
    return `${amount}${unitName}`;
  };

  const columns = [
    {
      key: 'delete',
      width: 30,
      render: renderDelete,
    },
    {
      title: '行号',
      dataIndex: 'lineNum',
      width: columnWidth,
      render: renderLineNum,
    },
    {
      title: '物料编号/名称',
      key: 'code/name',
      width: columnWidth,
      render: renderCodeAndName,
    },
    {
      title: '计划数',
      dataIndex: 'planAmount',
      width: 200,
      render: renderAmount,
    },
    {
      title: '行备注',
      dataIndex: 'remark',
      width: columnWidth,
      render: renderRemark,
    },
  ];
  if (includeOrganizationConfig(ORGANIZATION_CONFIG.configMaterialTransferDisplayUnit)) {
    columns.push({
      title: 'BOM配比',
      key: 'bom',
      dataIndex: 'ratio',
      width: 150,
      render: renderRatio,
    });
  }
  const scroll = { y: 280, x: 800 };
  const style = { margin: 0, width: 800 };

  return (
    <Table
      className={styles.table}
      style={style}
      scroll={scroll}
      dataSource={dataSource}
      columns={columns}
      pagination={false}
    />
  );
};

export default MaterialTable;
