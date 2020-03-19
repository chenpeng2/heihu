import React from 'react';
import { FormItem, Button, withForm, message } from 'components';
import _ from 'lodash';
import { createProdLine } from 'services/knowledgeBase/prodLine';
import ProdLineBaseForm from './prodLineBaseForm';
import { baseUrl } from './index';
import style from '../index.scss';

class CreateProdLine extends React.Component<any> {
  state = {};

  onSubmit = () => {
    const { form: { validateFields }, history: { push } } = this.props;
    validateFields((err, values) => {
      if (!err) {
        createProdLine({
          ...values,
          managerId: _.get(values, 'managerId.key'),
          workshopId: _.get(values, 'workshopId.key'),
          attachments: values.attachments && values.attachments.map(({ restId }) => restId),
          workers: values.workers && values.workers.filter(n => n).map(({ job, id: { key } }) => ({ job, id: key })),
        }).then(({ data: { data: { id } } }) => {
          message.success('创建成功！');
          push(`${baseUrl}/detail/${id}`);
        });
      }
    });
  };
  render() {
    return (
      <div className={style.formWrapper}>
        <div className={style.header}>创建产线</div>
        <div>
          <ProdLineBaseForm form={this.props.form} />
          <FormItem label=" ">
            <Button type="default" className={style.cancelButton} onClick={() => this.props.history.push(baseUrl)}>
              取消
            </Button>
            <Button className={style.confirmButton} onClick={this.onSubmit}>
              保存
            </Button>
          </FormItem>
        </div>
      </div>
    );
  }
}

export default withForm({}, CreateProdLine);
