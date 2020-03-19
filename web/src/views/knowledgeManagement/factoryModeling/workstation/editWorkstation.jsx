import React from 'react';
import { FormItem, Button, withForm } from 'components';
import { editWorkstation } from 'services/knowledgeBase/workstation';
import WorkstationBaseForm, { handleFormData } from './workstationBaseForm';
import style from '../index.scss';

class EditWorkstation extends React.PureComponent<any> {
  state = {};

  submit = () => {
    const { form: { validateFields }, history: { push }, match: { params: { id } }, location } = this.props;
    validateFields((err, values) => {
      if (!err) {
        editWorkstation(id, handleFormData(values)).then(() => {
          push(location.pathname.split('/edit')[0]);
        });
      }
    });
  };

  render() {
    const { history: { push }, location } = this.props;
    return (
      <div className={style.formWrapper}>
        <div className={style.header}>编辑工位</div>
        <div>
          <WorkstationBaseForm {...this.props} inEdit />
          <FormItem label=" ">
            <Button
              type="default"
              className={style.cancelButton}
              onClick={() => {
                push(location.pathname.split('/edit')[0]);
              }}
            >
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

export default withForm({}, EditWorkstation);
