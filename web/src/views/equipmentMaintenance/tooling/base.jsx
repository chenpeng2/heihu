import React from 'react';
import Proptypes from 'prop-types';
import { Input, Attachment, Button, FormItem, Searchselect, Radio, DatePicker } from 'src/components';
import { codeFormat, nullCharacterVerification, checkStringLength } from 'src/components/form';
import { getCustomLanguage } from 'src/utils/customLanguage';
import { getToolingListUrl } from './utils';

type Props = {
  history: any,
  type: string,
  form: any,
  handleSubmit: () => {},
};

const customLanguage = getCustomLanguage();
const RadioGroup = Radio.Group;
const itemStyle = { width: 300, height: 30 };

const Base = (props: Props, context) => {
  const {
    history,
    handleSubmit,
    type,
    form: { getFieldDecorator },
  } = props;
  const { changeChineseToLocale } = context;

  const renderButton = () => {
    const buttonStyle = { width: 114, height: 32 };
    return (
      <div style={{ margin: '0 0 100px 120px', display: 'flex', alignItems: 'flex-end' }}>
        <Button
          type="ghost"
          style={buttonStyle}
          onClick={() => {
            history.push(getToolingListUrl());
          }}
        >
          取消
        </Button>
        <Button
          style={{ ...buttonStyle, marginLeft: 72 }}
          onClick={() => {
            handleSubmit();
          }}
        >
          保存
        </Button>
      </div>
    );
  };

  return (
    <div style={{ marginLeft: 20 }}>
      <div
        style={{
          margin: '20px 0 30px 0',
          fontSize: 16,
        }}
      >
        {changeChineseToLocale(`${type === 'create' ? '创建' : '编辑'}模具`)}
      </div>
      <FormItem label={customLanguage.equipment_machining_material}>
        {getFieldDecorator('defCode', {
          rules: [
            {
              required: true,
              message: `${customLanguage.equipment_machining_material}${changeChineseToLocale('必填')}`,
            },
          ],
        })(
          <Searchselect
            disabled={type === 'edit'}
            style={itemStyle}
            labelInValue={false}
            type="machiningMaterial"
            params={{ searchDraft: 0, searchType: 2, searchToolingType: 2, searchMgmtElectronicLabel: 1 }}
            placeholder={`${changeChineseToLocale('请选择')}${customLanguage.equipment_machining_material}`}
          />,
        )}
      </FormItem>
      <FormItem label="编号">
        {getFieldDecorator('code', {
          rules: [
            { required: true, message: changeChineseToLocale('编号必填') },
            { validator: codeFormat(changeChineseToLocale('编号')) },
            { validator: checkStringLength(32) },
          ],
        })(<Input disabled={type === 'edit'} style={itemStyle} placeholder={'请输入'} />)}
      </FormItem>
      <FormItem label="名称">
        {getFieldDecorator('name', {
          rules: [
            { required: true, message: changeChineseToLocale('名称必填') },
            { validator: checkStringLength(50) },
            { validator: nullCharacterVerification(changeChineseToLocale('名称')) },
          ],
        })(<Input style={itemStyle} placeholder={'请输入'} />)}
      </FormItem>
      <FormItem label="电子标签">
        {getFieldDecorator('qrcode', {
          rules: [
            { required: true, message: changeChineseToLocale('电子标签必填') },
            { validator: checkStringLength(32, 6) },
          ],
        })(<Input style={itemStyle} placeholder={'请输入'} />)}
      </FormItem>
      <FormItem label="制造商">
        {getFieldDecorator('manufacturerId')(
          <Searchselect style={itemStyle} type="manufacturer" labelInValue={false} />,
        )}
      </FormItem>
      <FormItem label="型号">
        {getFieldDecorator('model', {
          rules: [{ validator: checkStringLength(80) }],
        })(<Input style={itemStyle} placeholder={'请输入'} />)}
      </FormItem>
      <FormItem label="序列号">
        {getFieldDecorator('serialNumber', {
          rules: [{ validator: checkStringLength(50) }],
        })(<Input style={itemStyle} placeholder={'请输入'} />)}
      </FormItem>
      <FormItem label="供应商出厂日期">{getFieldDecorator('deliverDate')(<DatePicker style={itemStyle} />)}</FormItem>
      <FormItem label="入厂日期">{getFieldDecorator('admitDate')(<DatePicker style={itemStyle} />)}</FormItem>
      <FormItem label="首次启用日期">{getFieldDecorator('firstEnableDate')(<DatePicker style={itemStyle} />)}</FormItem>
      <FormItem label="状态">
        {getFieldDecorator('enableStatus', {
          initialValue: 1,
        })(
          <RadioGroup style={itemStyle}>
            <Radio value={2}>{changeChineseToLocale('启用中')}</Radio>
            <Radio value={1}>{changeChineseToLocale('闲置中')}</Radio>
          </RadioGroup>,
        )}
      </FormItem>
      <FormItem label="附件">{getFieldDecorator('attachments', {})(<Attachment max={5} />)}</FormItem>
      {renderButton()}
    </div>
  );
};

Base.contextTypes = {
  changeChineseToLocale: Proptypes.func,
};

export default Base;
