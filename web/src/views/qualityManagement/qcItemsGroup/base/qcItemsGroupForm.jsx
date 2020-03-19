import React, { Component } from 'react';
import _ from 'lodash';
import { checkStringLength, QcItemsGroupValidator, checkTwoSidesTrim } from 'components/form';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';
import { AntTextarea, withForm, Form, FormItem } from 'components';
import { updateQcItemsGroup, createQcItemsGroup } from 'src/services/knowledgeBase/qcItems';

type Props = {
  form: {
    getFieldDecorator: () => {},
  },
  data: {},
  onCancel: () => {},
  onSuccess: () => {},
};

class QcItemsGroup extends Component {
  props: Props;

  state = {};

  submit = async value => {
    const { onSuccess } = this.props;
    const payload = value;
    const id = _.get(this, 'props.data.id', undefined);
    if (id) {
      await updateQcItemsGroup(id, { name: payload.name });
      return onSuccess ? onSuccess() : null;
    }
    const {
      data: { data },
    } = await createQcItemsGroup({ name: payload.name });
    return onSuccess ? onSuccess(data) : null;
  };

  render = () => {
    const {
      form: { getFieldDecorator },
      data,
    } = this.props;

    return (
      <div>
        <Form layout="vertical" style={{ paddingLeft: 50, paddingTop: 22 }}>
          <FormItem label="名称">
            {getFieldDecorator('name', {
              rules: [
                { required: true, message: changeChineseToLocaleWithoutIntl('质检项分类名称必填') },
                { validator: checkStringLength(100) },
                { validator: checkTwoSidesTrim(changeChineseToLocaleWithoutIntl('质检项分类名称')) },
                { validator: QcItemsGroupValidator(changeChineseToLocaleWithoutIntl('质检项分类名称')) },
              ],
              initialValue: data && data.name,
            })(
              <AntTextarea
                autosize={{ maxRows: 3 }}
                style={{ width: 300, height: 28, resize: 'none', marginBottom: 5 }}
                placeholder={changeChineseToLocaleWithoutIntl('请输入名称')}
              />,
            )}
          </FormItem>
        </Form>
      </div>
    );
  };
}

const QcItemsGroupForm = withForm({ showFooter: true }, QcItemsGroup);

export default QcItemsGroupForm;
