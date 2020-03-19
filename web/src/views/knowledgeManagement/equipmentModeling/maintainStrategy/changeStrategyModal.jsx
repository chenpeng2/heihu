import React, { useState, useEffect } from 'react';
import { addStrategyGroup, updateStrategyGroup } from 'src/services/equipmentMaintenance/base';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';
import { withForm, FormItem, Input, Button, Spin, Select } from 'src/components';
import log from 'src/utils/log';
import { STRATEGY_APPLiCATION_SCOPE } from './constants';

type Props = {
  form: {},
  intl: any,
  fetchData: () => {},
  onCancel: () => {},
  data: {},
  type: String,
};

const itemStyle = { width: 300 };

const ChangeStrategyModal = (props: Props) => {
  const { form, intl } = props;
  const { getFieldDecorator } = form;
  const [loading, setLoading] = useState(false);
  delete STRATEGY_APPLiCATION_SCOPE.ALL;

  const handleSubmit = () => {
    const { form, fetchData, type, data, onCancel } = props;
    const { validateFieldsAndScroll } = form;
    validateFieldsAndScroll((err, values) => {
      if (!err) {
        try {
          let changeStrategyGroup;
          if (type === 'create') {
            changeStrategyGroup = addStrategyGroup;
          } else {
            values.id = data.id;
            changeStrategyGroup = updateStrategyGroup;
          }
          setLoading(true);
          changeStrategyGroup(values)
            .then(() => {
              fetchData();
              onCancel();
            })
            .finally(() => {
              setLoading(false);
            });
        } catch (e) {
          log.error(e);
        }
      }
    });
    return null;
  };

  const renderButton = () => {
    const { onCancel } = props;
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 30 }}>
        <Button type="ghost" onClick={() => onCancel()} style={{ width: 114, height: 32 }}>
          取消
        </Button>
        <Button type="primary" onClick={() => handleSubmit()} style={{ width: 114, height: 32, marginLeft: 30 }}>
          完成
        </Button>
      </div>
    );
  };

  useEffect(() => {
    const { form, data, type } = props;
    const { setFieldsValue } = form;
    if (type === 'edit') {
      setFieldsValue(data);
    }
  }, []);

  return (
    <Spin spinning={loading}>
      <div style={{ display: 'inline-block', marginTop: 20 }}>
        <FormItem label="策略组">
          {getFieldDecorator('title', {
            rules: [
              { required: true, message: changeChineseToLocale('策略组名称必填', intl) },
              { max: 10, message: changeChineseToLocale('最多可输入10个字符', intl) },
            ],
          })(<Input style={itemStyle} placeholder={changeChineseToLocale('请填写策略组', intl)} />)}
        </FormItem>
        <FormItem label="适用范围">
          {getFieldDecorator('categoryType')(
            <Select style={itemStyle} placeholder={changeChineseToLocale('请输入', intl)}>
              {Object.values(STRATEGY_APPLiCATION_SCOPE).map(({ key, label }) => (
                <Select.Option key={key} value={key}>
                  {changeChineseToLocale(label, intl)}
                </Select.Option>
              ))}
            </Select>,
          )}
        </FormItem>
      </div>
      {renderButton()}
    </Spin>
  );
};

export default withForm({ showFooter: false }, injectIntl(ChangeStrategyModal));
