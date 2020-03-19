import React from 'react';
import { withForm, FormItem, Input, Select, message } from 'components';
import { createProdLine } from 'services/knowledgeBase/prodLine';
import { createWorkshop } from 'services/knowledgeBase/workshop';
import { createWorkstation } from 'services/knowledgeBase/workstation';
import _ from 'lodash';
import { requiredRule } from 'components/form';
import WorkshopBaseForm from '../workshop/workshopBaseForm';
import WorkstationBaseForm, { handleFormData as workstationHandleFormData } from '../workstation/workstationBaseForm';
import ProdLineBaseForm from '../prodLine/prodLineBaseForm';

const Option = Select.Option;
const width = 400;

const areaDefine = {
  WORKSHOP: '车间',
  WORKSTATION: '工位',
  PRODUCTION_LINE: '产线',
};

class CreateChildrenArea extends React.PureComponent<any> {
  state = {
    areaType: '',
  };

  componentDidMount() {
    const {
      form: { setFieldsValue },
      parentAreaType,
    } = this.props;
    if (parentAreaType !== 'WORKSHOP') {
      setFieldsValue({ area: parentAreaType });
    }
  }

  switchRender(type) {
    let BaseForm = null;
    const { areaType } = this.state;
    const { parent } = this.props;
    if (type === 'ORGANIZATION') {
      BaseForm = WorkshopBaseForm;
      this.onSubmit = values =>
        createWorkshop({
          ...values,
          managerId: _.get(values, 'managerId.key'),
          parent: undefined,
          attachments: values.attachments && values.attachments.map(({ restId }) => restId),
          workers: values.workers && values.workers.filter(n => n).map(({ job, id: { key } }) => ({ job, id: key })),
        });
    } else if ((type === 'WORKSHOP' && areaType === 'WORKSTATION') || type === 'PRODUCTION_LINE') {
      BaseForm = WorkstationBaseForm;
      this.onSubmit = values => {
        return createWorkstation({
          ...values,
          ...workstationHandleFormData(values),
          productionLineId: parent.type === 'PRODUCTION_LINE' ? parent.id : undefined,
          workshopId: areaType === 'WORKSTATION' ? parent.id : undefined,
          workers: values.workers && values.workers.filter(n => n).map(({ job, id: { key } }) => ({ job, id: key })),
        });
      };
    } else if (type === 'WORKSHOP' && areaType === 'PRODUCTION_LINE') {
      BaseForm = ProdLineBaseForm;
      this.onSubmit = values =>
        createProdLine({
          ...values,
          managerId: _.get(values, 'managerId.key'),
          workshopId: _.get(parent, 'id'),
          attachments: values.attachments && values.attachments.map(({ restId }) => restId),
          workers: values.workers && values.workers.filter(n => n).map(({ job, id: { key } }) => ({ job, id: key })),
        });
    } else {
      return null;
    }
    return <BaseForm form={this.props.form} formItemWidth={width} inModal />;
  }

  submit = callback => {
    const {
      form: { validateFields },
      parent: { id, key, type },
      setDataSource,
      handleChildren,
    } = this.props;
    const onSubmit = this.onSubmit;
    validateFields((err, values) => {
      if (!err) {
        onSubmit({ ...values, area: undefined }).then(() => {
          this.props.onClose();
          message.success('创建成功！');
          if (type === 'ORGANIZATION') {
            setDataSource();
          } else {
            handleChildren({ type, id, key });
          }
        });
      }
    });
  };

  render() {
    const {
      form: { getFieldDecorator },
      parentAreaType,
      parent,
    } = this.props;
    return (
      <div>
        <FormItem label="上级区域">
          <Input style={{ width }} disabled value={parent.name} />
        </FormItem>
        <FormItem label="区域类型">
          {getFieldDecorator('area', {
            rules: [requiredRule('区域类型')],
          })(
            parentAreaType !== 'WORKSHOP' ? (
              <Select style={{ width }} disabled>
                <Option value="ORGANIZATION">{areaDefine.WORKSHOP}</Option>
                <Option value="PRODUCTION_LINE">{areaDefine.WORKSTATION}</Option>
              </Select>
            ) : (
              <Select style={{ width }} onSelect={value => this.setState({ areaType: value })}>
                <Option value="WORKSTATION">{areaDefine.WORKSTATION}</Option>
                <Option value="PRODUCTION_LINE">{areaDefine.PRODUCTION_LINE}</Option>
              </Select>
            ),
          )}
        </FormItem>
        {this.switchRender(parentAreaType)}
      </div>
    );
  }
}

export default withForm({ showFooter: true }, CreateChildrenArea);
