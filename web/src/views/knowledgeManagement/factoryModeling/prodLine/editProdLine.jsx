import React from 'react';
import { FormItem, Button, withForm, message } from 'components';
import { getProdLine, editProdLine } from 'services/knowledgeBase/prodLine';
import _ from 'lodash';
import ProdLineBaseForm from './prodLineBaseForm';
import style from '../index.scss';

class EditProdLine extends React.Component<any> {
  state = {};

  componentDidMount = async () => {
    const { match: { params: { prodLineId } }, form: { setFieldsValue } } = this.props;
    const { data: { data } } = await getProdLine(prodLineId);
    setFieldsValue({
      ...data,
      workerKeys: data.workers ? data.workers.map((node, index) => ({ key: index })) : [],
      managerId: { key: data.managerId, label: data.manager },
      workshopId: { key: data.parent, label: data.parent },
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
    const { form: { validateFields }, history: { push }, match: { params: { prodLineId } } } = this.props;
    validateFields((err, values) => {
      if (!err) {
        editProdLine(prodLineId, {
          ...values,
          managerId: _.get(values, 'managerId.key', ''),
          workshopId: undefined,
          code: undefined,
          workers: values.workers && values.workers.filter(n => n).map(({ job, id: { key } }) => ({ job, id: key })),
          attachments: values.attachments && values.attachments.map(({ restId }) => restId),
        }).then(() => {
          message.success('编辑成功！');
          push(location.pathname.split('/edit')[0]);
        });
      }
    });
  };
  render() {
    const { history: { push } } = this.props;
    return (
      <div className={style.formWrapper}>
        <div className={style.header}>编辑产线</div>
        <div>
          <ProdLineBaseForm form={this.props.form} isEdit />
          <FormItem label=" ">
            <Button
              type="default"
              className={style.cancelButton}
              onClick={() => push(location.pathname.split('/edit')[0])}
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

export default withForm({}, EditProdLine);
