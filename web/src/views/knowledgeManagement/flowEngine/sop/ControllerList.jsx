import React from 'react';
import { SimpleTable } from 'components';
import { getSOPStepDetail } from 'services/knowledgeBase/sop';
import { getSOPTemplateStepDetail } from 'services/knowledgeBase/sopTemplate';
import { replaceSign } from 'constants';
import CONSTANT from '../common/SOPConstant';

class ControllerList extends React.PureComponent {
  state = {
    dataSource: null,
  };

  componentDidMount() {
    this.setDataSource();
  }

  setDataSource = async () => {
    const { stepId, mode, sopId } = this.props;
    const fetchApi = mode === 'template' ? getSOPTemplateStepDetail : getSOPStepDetail;
    const {
      data: {
        data: { controlList },
      },
    } = await fetchApi(stepId, sopId);
    this.setState({ dataSource: controlList });
  };

  render() {
    const { dataSource } = this.state;
    console.log('dataSource', dataSource);
    const columns = [
      { title: '控件名称', dataIndex: 'name' },
      {
        title: '属性',
        dataIndex: 'property',
        render: property => property && CONSTANT.SopControlProperty.get(property),
      },
      { title: '类型', dataIndex: 'type', render: type => type && CONSTANT.SopControlType.get(type) },
      { title: '必填', dataIndex: 'inputRequired', render: required => (required ? '是' : '否') },
      {
        title: '显示逻辑',
        dataIndex: 'showLogic',
        render: (logic, { property }) =>
          property === CONSTANT.PROPERTY_SHOW ? CONSTANT.SopControlShowLogic.get(logic) : replaceSign,
      },
      {
        title: '备注',
        dataIndex: 'inputRemark',
        render: remark => remark || replaceSign,
      },
      {
        title: '默认值逻辑',
        dataIndex: 'inputDefaultLogic',
        render: (logic, { property }) =>
          property === CONSTANT.PROPERTY_INPUT ? CONSTANT.SopControlShowLogic.get(logic) || replaceSign : replaceSign,
      },
    ].map(node => ({
      ...node,
      key: node.title,
    }));
    return (
      <SimpleTable
        scroll={{ y: 400, x: true }}
        columns={columns}
        style={{ width: 1000 }}
        dataSource={dataSource}
        pagination={false}
        rowKey="id"
      />
    );
  }
}

export default ControllerList;
