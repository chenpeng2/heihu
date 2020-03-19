import React from 'react';
import { Form } from 'antd';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'src/utils/locale/utils';
import styles from './index.scss';

/**
 * @api {FormItem} FormItem.
 * @APIGroup FormItem.
 * @apiParam {String} label 表单每一行信息.
 * @apiParam {Boolean} short 为true就是formItemLayoutShort,否则formItemLayout.
 * @apiParam {Obj} style -
 * @apiParam {Obj} actionStyle -
 * @apiParam {any} action -
 * @apiParam {React.node} children -
 * @apiExample {js} Example usage:
 * <FormItem label="名称" {...formItemLayout}>
    {getFieldDecorator('name', {
      rules: [{ required: true, message: '角色名称是必须的!' }],
    })(<Input />)}
   </FormItem>
 */

type Props = {
  label: any,
  intl: any,
  children: any,
  style: {},
  action: any,
  actionStyle: {},
};

const Item = (props: Props) => {
  const { intl, style, label, children, action, actionStyle, help, ...rest } = props;
  const colonLabel =
    label && typeof label === 'string'
      ? label.endsWith('：') || label.endsWith(':')
        ? label.slice(0, -1)
        : label
      : label;
  const _help = help && typeof help === 'string' ? changeChineseToLocale(help, intl) : help;

  return (
    <Form.Item
      label={colonLabel ? changeChineseToLocale(colonLabel, intl) : ''}
      help={_help}
      colon={false}
      style={style}
      className={styles.modalFormItem}
      {...rest}
    >
      {action ? (
        <div style={{ display: 'flex' }}>
          <div style={{ flex: 1 }}>{children}</div>
          {action ? <span style={{ paddingLeft: 20, ...actionStyle }}>{action}</span> : null}
        </div>
      ) : (
        <div>{children}</div>
      )}
    </Form.Item>
  );
};

Item.defaultProps = {
  style: {},
};

export default injectIntl(Item);
