import React from 'react';
import { FormItem, Button, withForm } from 'components';
import { createWorkstation } from 'services/knowledgeBase/workstation';
import WorkstationBaseForm, { handleFormData } from './workstationBaseForm';
import { baseUrl } from './index';
import style from '../index.scss';

type propsType = {
  form: any,
  history: any,
};

class CreateWorkstation extends React.PureComponent<propsType> {
  state = {
    dataSource: [{ key: 1 }],
  };

  submit = () => {
    const { form: { validateFields }, history: { push } } = this.props;
    validateFields((err, values) => {
      if (!err) {
        createWorkstation(handleFormData(values)).then(({ data: { data } }) => {
          push(`${baseUrl}/detail/${data.id}`);
        });
      }
    });
  };

  render() {
    const { form, history: { push } } = this.props;
    return (
      <div className={style.formWrapper}>
        <div className={style.header}>创建工位</div>
        <div>
          <WorkstationBaseForm form={form} />
          <FormItem label=" ">
            <Button type="default" className={style.cancelButton} onClick={() => push(baseUrl)}>
              取消
            </Button>
            <Button className={style.confirmButton} onClick={this.submit}>
              保存
            </Button>
          </FormItem>
        </div>
      </div>
    );
  }
}

export default withForm({}, CreateWorkstation);
