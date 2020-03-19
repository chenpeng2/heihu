import React from 'react';
import { FormItem, Button, withForm, message } from 'components';
import { createWorkshop } from 'services/knowledgeBase/workshop';
import _ from 'lodash';
import WorkshopBaseForm from './workshopBaseForm';
import { baseUrl } from './index';
import style from '../index.scss';

type propsType = {
  form: any,
  history: any,
};

class CreateWorkshop extends React.PureComponent<propsType> {
  state = {};

  onSubmit = () => {
    const { form: { validateFields }, history: { push } } = this.props;
    validateFields((err, values) => {
      if (!err) {
        createWorkshop({
          ...values,
          managerId: _.get(values, 'managerId.key'),
          parent: undefined,
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
        <div className={style.header}>创建车间</div>
        <div>
          <WorkshopBaseForm form={this.props.form} />
          <FormItem label=" ">
            <Button
              type="default"
              className={style.cancelButton}
              onClick={() => this.props.history.push(baseUrl)}
            >
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

export default withForm({}, CreateWorkshop);
