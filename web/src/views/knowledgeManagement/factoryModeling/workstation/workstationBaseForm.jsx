import React from 'react';
import { FormItem, Input, Textarea, Attachment, Radio, Tooltip, Icon, Select, TreeSelect } from 'components';
import _ from 'lodash';
import { getWorkstationParents, getWorkstation } from 'services/knowledgeBase/workstation';
import SearchSelect from 'components/select/searchSelect';
import { codeFormat, qrCodeFormat } from 'components/form';
import RelationWorkerFormItem from '../common/RelationWorkerFormItem';
import RelationWorkerTooltip from '../common/RelationWorkerTooltip';

const RadioGroup = Radio.Group;
const Option = Select.Option;
export const WORKSTATION_WORKERS_QC = 'QC'; // 质检工
export const StationDefine = {
  OP: '操作工',
  QC: '质检工',
  MM: '机械维修工',
  EM: '电气维修工',
  PS: '排程员',
};

export const handleFormData = values => {
  const submitValue = {};
  const { workers, equipments, parent } = values;
  if (parent) {
    const _parent = parent.split('/');
    submitValue[_parent[0]] = _parent[1];
  }
  return {
    ...values,
    ...submitValue,
    parent: undefined,
    workers: workers && workers.filter(n => n).map(({ job, id: { key } }) => ({ job, id: key })),
    groupId: _.get(values, 'groupId.key', ''),
    attachments: values.attachments && values.attachments.map(({ restId }) => restId),
    equipments: equipments && equipments.map(({ key }) => key),
  };
};

class WorkstationBaseForm extends React.PureComponent<any> {
  state = {
    parentData: [],
  };

  componentDidMount() {
    this.setInitValue();
    this.setParentData();
  }

  setParentData = async params => {
    const {
      data: { data },
    } = await getWorkstationParents(params);
    this.setState({
      parentData: data.map(workshop => ({
        key: `workshopId/${workshop.id}`,
        title: workshop.name,
        value: `workshopId/${workshop.id}`,
        children: workshop.children.map(prodLine => ({
          key: `productionLineId/${prodLine.id}`,
          title: prodLine.name,
          value: `productionLineId/${prodLine.id}`,
        })),
      })),
    });
  };

  setInitValue = async () => {
    if (this.props.inEdit) {
      const {
        form: { setFieldsValue },
        match: {
          params: { id },
        },
      } = this.props;
      const {
        data: { data },
      } = await getWorkstation(id);
      const { equipments, ...rest } = data;
      if (equipments && equipments.length > 0) {
        setFieldsValue({
          equipments: equipments.map(({ entity: { id } }, i) => ({ key: id })),
        });
      }
      setFieldsValue({
        ...rest,
        workerKeys: data.workers ? data.workers.map((node, index) => ({ key: index })) : [],
        groupId: { key: data.groupId, label: data.group },
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
    }
  };

  render() {
    const {
      form: { getFieldDecorator, getFieldValue, resetFields },
      formItemWidth,
      inModal,
      inEdit,
    } = this.props;
    const width = formItemWidth || 300;
    const { parentData } = this.state;
    const form = [
      {
        label: '上级区域',
        name: 'parent',
        options: {
          rules: [{ required: true, message: '上级区域为必填' }],
        },
        component: inEdit ? (
          <Input disabled={inEdit} style={{ width }} />
        ) : (
          <TreeSelect style={{ width }} treeDefaultExpandAll treeData={parentData} />
        ),
      },
      {
        label: '工位编码',
        name: 'code',
        options: {
          rules: [
            { required: true, message: '工位编码为必填' },
            { validator: codeFormat('编码') },
            {
              max: 20,
              message: '不超过20个字',
            },
          ],
        },
        component: <Input style={{ width }} disabled={inEdit} />,
      },
      {
        label: '工位名称',
        name: 'name',
        options: {
          rules: [{ required: true, message: '工位名称为必填' }, { max: 20, message: '不超过20个字' }],
        },
        component: <Input style={{ width }} />,
      },
      {
        label: '工位组',
        name: 'groupId',
        component: <SearchSelect type="workstationGroup" style={{ width }} />,
      },
      {
        label: (
          <span>
            <Tooltip title="工位派工时是否允许同一时段有多个任务派发到当前工位">
              <Icon type="info-circle-o" style={{ marginRight: 5 }} />
            </Tooltip>
            多任务工位
          </span>
        ),
        name: 'toManyTask',
        component: (
          <RadioGroup style={{ width }}>
            <Radio value={1} style={{ marginRight: 100 }}>
              是
            </Radio>
            <Radio value={0}>否</Radio>
          </RadioGroup>
        ),
      },
      {
        label: '报工设备',
        name: 'equipments',
        component: <SearchSelect mode="multiple" type="device" style={{ width }} />,
      },
      {
        label: '二维码',
        name: 'qrCode',
        component: <Input style={{ width }} />,
        options: {
          rules: [{ max: 30, message: '不超过30个字' }, { validator: qrCodeFormat('二维码') }],
        },
      },
      {
        label: '备注',
        name: 'remark',
        component: <Textarea style={{ width, height: 100 }} maxLength={50} />,
      },
      {
        label: '附件',
        name: 'attachments',
        component: <Attachment style={{ width }} />,
      },
    ];
    if (inModal) {
      form.shift();
    }

    return (
      <React.Fragment>
        {form.map(({ label, name, options, component }) => (
          <FormItem label={label} key={name}>
            {getFieldDecorator(name, options || {})(component)}
          </FormItem>
        ))}
        <FormItem
          label={
            <span>
              关联人员
              <RelationWorkerTooltip />
            </span>
          }
        >
          <RelationWorkerFormItem form={this.props.form} />
        </FormItem>
      </React.Fragment>
    );
  }
}

export default WorkstationBaseForm;
