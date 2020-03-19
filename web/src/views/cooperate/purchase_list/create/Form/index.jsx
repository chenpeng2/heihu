import React from 'react';
import { Textarea, Form, FormItem, Input, PlainText } from 'components';
import SearchSelect from 'components/select/searchSelect';
import MaterialTable from 'containers/purchase_list/create_purchase_list/MaterialTable';
import { checkStringLength, codeFormat } from 'components/form';

const INPUT_WIDTH = 300;
const TEXT_AREA_HEIGHT = 100;

type Props = {
  form: any,
  useQrCode: any,
  customLanguage: any,
  materialTableRef: (ref: any) => void,
};

function PurchaseOrderCreatedForm(props: Props) {
  const { form, useQrCode, customLanguage, materialTableRef } = props;
  return (
    <Form>
      <FormItem label="编号">
        {form.getFieldDecorator('code', {
          rules: [
            { equired: true, message: `${customLanguage.procure_order}编号必填` },
            { validator: codeFormat(`${customLanguage.procure_order}编号`) },
          ],
        })(<Input style={{ width: INPUT_WIDTH }} />)}
      </FormItem>
      <FormItem label="处理人">
        {form.getFieldDecorator('operator')(
          <SearchSelect style={{ width: INPUT_WIDTH }} type={'account'} className="select-input" />,
        )}
      </FormItem>
      {useQrCode === 'true' ? (
        <FormItem label="供应商">
          {form.getFieldDecorator('supplier')(
            <SearchSelect
              style={{ width: INPUT_WIDTH }}
              params={{ enabled: true }}
              type="supplier"
              className="select-input"
            />,
          )}
        </FormItem>
      ) : null}
      <FormItem label="物料列表">
        {form.getFieldDecorator('materialList', {
          rules: [{ required: true, message: <PlainText text="物料必填" /> }],
        })(<MaterialTable wrappedComponentRef={materialTableRef} style={{ margin: 0 }} />)}
      </FormItem>
      <FormItem label="备注">
        {form.getFieldDecorator('remark', {
          rules: [
            {
              validator: checkStringLength(100),
            },
          ],
        })(<Textarea maxLength={100} style={{ width: INPUT_WIDTH, height: TEXT_AREA_HEIGHT }} />)}
      </FormItem>
    </Form>
  );
}

export default PurchaseOrderCreatedForm;
