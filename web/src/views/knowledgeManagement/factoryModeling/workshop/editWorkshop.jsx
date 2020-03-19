import React from 'react';
import { FormItem, Button, withForm, Link, message } from 'components';
import { editWorkshop, getWorkshop } from 'services/knowledgeBase/workshop';
import _ from 'lodash';
import WorkshopBaseForm from './workshopBaseForm';
import style from '../index.scss';

type propsType = {
  form: any,
  history: any,
  match: {
    params: any,
  },
};

class EditWorkshop extends React.PureComponent<propsType> {
  state = {};

  componentDidMount = async () => {
    const { match: { params: { workshopId } }, form: { setFieldsValue } } = this.props;
    const { data: { data } } = await getWorkshop(workshopId);
    setFieldsValue({
      ...data,
      workerKeys: data.workers ? data.workers.map((node, index) => ({ key: index })) : [],
      managerId: { key: data.managerId, label: data.manager },
      attachments:
        data.attachmentsFile &&
        data.attachmentsFile.map(({ originalFileName, id }) => ({
          id,
          restId: id,
          originalFileName,
        })),
    });
    setTimeout(() => {
      setFieldsValue({
        workers: data.workers && data.workers.map(({ id, job, name }) => ({ id: { label: name, key: id }, job })),
      });
    });
  };

  onSubmit = () => {
    const { form: { validateFields }, history: { push }, match: { params: { workshopId } } } = this.props;
    validateFields((err, values) => {
      if (!err) {
        editWorkshop(workshopId, {
          ...values,
          managerId: _.get(values, 'managerId.key', ''),
          parent: undefined,
          attachments: values.attachments && values.attachments.map(({ restId }) => restId),
          workers: values.workers && values.workers.filter(n => n).map(({ job, id: { key } }) => ({ job, id: key })),
        }).then(() => {
          message.success('编辑成功！');
          push(location.pathname.split('/edit')[0]);
        });
      }
    });
  };

  render() {
    const { form } = this.props;
    return (
      <div className={style.formWrapper}>
        <div className={style.header}>编辑车间</div>
        <div>
          <WorkshopBaseForm form={form} inEdit />
          <FormItem label=" ">
            <Button type="default" className={style.cancelButton}>
              <Link to={location.pathname.split('/edit')[0]}>取消</Link>
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

export default withForm({}, EditWorkshop);
