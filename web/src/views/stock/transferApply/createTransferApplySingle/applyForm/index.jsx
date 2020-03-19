import React from 'react';
import { FormItem, Input, SingleStorageSelect, DatePicker, Textarea } from 'components';
import SearchSelect from 'components/select/searchSelect';
import { CreateTransferApplyFormModel } from 'models/stock/transferApply/CreateTransferApplyModel';
import { inputWidth, dateTimeFormat } from '../constants';
import styles from './styles.scss';
import { requiredRule } from '../util';
import InfoLabel from './infoLabel';
import MaterialTable from './materialTable';
import ApplyRadioGroup from './applyRadioGroup';

/** 编号 */
const CodeItem = ({ form, initialValue }) => {
  const rules = [requiredRule('编号必填')];
  const options = { rules, initialValue };
  const inputStyle = { width: inputWidth };

  return <FormItem label="编号">{form.getFieldDecorator('code', options)(<Input style={inputStyle} />)}</FormItem>;
};

/** 移动事务 */
const MoveTransactionItem = ({ form, initialValue }) => {
  const inputStyle = { width: inputWidth };

  return (
    <FormItem label="移动事务" required>
      <Input style={inputStyle} defaultValue={initialValue} disabled />
    </FormItem>
  );
};

/** 需要审批 */
const ApproveItem = ({ form, initialValue }) => {
  const options = { initialValue };

  return (
    <FormItem
      label={
        <InfoLabel
          title="需要审批"
          info="需要审批选择「是」时创建的转移申请状态为「已创建」，选择「否」时创建的转移申请状态为「已下发」。"
        />
      }
    >
      {form.getFieldDecorator('approve', options)(<ApplyRadioGroup />)}
    </FormItem>
  );
};

/** 发出仓库 */
const SourceWarehouseItem = ({ form, initialValue, onChange }) => {
  const rules = [requiredRule('发出仓库必填')];
  const options = { rules, onChange, initialValue };
  const style = { width: inputWidth };

  return (
    <FormItem
      label={<InfoLabel title="发出仓库" info="优先占用物料上配置的默认存储仓库，如果没有配置则占用此次选择的仓库" />}
    >
      {form.getFieldDecorator('sourceWarehouse', options)(
        <SearchSelect style={style} params={{ status: 1 }} type="wareHouseWithCode" />,
      )}
    </FormItem>
  );
};

/** 目标仓位 */
const TargetStorageItem = ({ form, initialValue, onChange }) => {
  const rules = [requiredRule('目标仓位必填')];
  const options = { rules, initialValue, onChange };
  const cascaderStyle = { height: '100%' };
  const style = { width: inputWidth };

  return (
    <FormItem label="目标仓位">
      {form.getFieldDecorator('targetStorage', options)(
        <SingleStorageSelect cascaderStyle={cascaderStyle} style={style} />,
      )}
    </FormItem>
  );
};

/** 需求时间 */
const RequireTimeItem = ({ form, initialValue }) => {
  const rules = [requiredRule('需求时间必填')];
  const options = { rules, initialValue };
  const style = { width: inputWidth };

  return (
    <FormItem label="需求时间">
      {form.getFieldDecorator('requireTime', options)(
        <DatePicker format={dateTimeFormat} showTime={{ format: 'HH:mm' }} style={style} />,
      )}
    </FormItem>
  );
};

/** 物料列表 */
const MaterialTableItem = ({ form, dataSource, onRemove, onChangeAmount, onChangeRemark }) => {
  return (
    <FormItem label="物料列表" required>
      <MaterialTable
        form={form}
        dataSource={dataSource}
        onRemove={onRemove}
        onChangeAmount={onChangeAmount}
        onChangeRemark={onChangeRemark}
      />
    </FormItem>
  );
};

/** 备注 */
const RemarkItem = ({ form }) => {
  const options = { initialValue: '' };
  const textAreaStyle = { width: inputWidth, height: 100 };

  return (
    <FormItem label="备注">
      {form.getFieldDecorator('remark', options)(
        <Textarea placeholder="请输入备注" style={textAreaStyle} maxLength={500} />,
      )}
    </FormItem>
  );
};

type Props = {
  form: any,
  data: CreateTransferApplyFormModel,
  onRemove: (index: Number) => void,
};

/** 表单 */
const ApplyForm = (props: Props) => {
  const { form, data, onRemove } = props;
  const {
    code,
    needApprove,
    formattedTargetStorage,
    materials,
    requireTime,
    transactionName,
    sourceWarehouseOption,
  } = data;

  const onChangeAmount = (value, index) => {
    data.updateMaterialAtIndex({ planAmount: value }, index);
  };

  const onChangeRemark = (value, index) => {
    data.updateMaterialAtIndex({ remark: value }, index);
  };

  const onChangeSourceWarehouse = value => {
    data.setSourceWarehouse(value);
  };

  const onChangeTargetWarehouse = value => {
    data.setTargetStorage(value);
  };

  return (
    <div className={styles.form}>
      <CodeItem form={form} initialValue={code} />
      <MoveTransactionItem form={form} initialValue={transactionName} />
      <ApproveItem form={form} initialValue={needApprove} />
      <SourceWarehouseItem form={form} initialValue={sourceWarehouseOption} onChange={onChangeSourceWarehouse} />
      <TargetStorageItem form={form} initialValue={formattedTargetStorage} onChange={onChangeTargetWarehouse} />
      <RequireTimeItem form={form} initialValue={requireTime} />
      <MaterialTableItem
        form={form}
        dataSource={materials}
        onRemove={onRemove}
        onChangeAmount={onChangeAmount}
        onChangeRemark={onChangeRemark}
      />
      <RemarkItem form={form} />
    </div>
  );
};

export default ApplyForm;
