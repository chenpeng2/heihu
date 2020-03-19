import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import { Modal } from 'antd';
import _ from 'lodash';

import { Button } from 'components';
import { arrayIsEmpty } from 'utils/array';
import { changeChineseTemplateToLocale, changeChineseToLocale } from 'utils/locale/utils';
import { getWorkOrderProcureMaterials } from 'services/cooperate/plannedTicket';
import { ORGANIZATION_CONFIG, getOrganizationConfigFromLocalStorage } from 'utils/organizationConfig';
import { getProjectProcureMaterial } from 'services/cooperate/project';
import SelectMaterialTable from './select_material_table';
import MaterialsFilter from './materials_filter';

const MODAL_WIDTH = 900;

type Props = {
  intl: any,
  style: {},
  visible: boolean,
  add_value: () => {}, // 将选中的数据添加到外面的form中
  change_visible: () => {},
  last_selected_material_data: [], // 已经被选中的数据，用来过滤后端拉回的数据
};

class Add_Material_Modal extends Component {
  props: Props;
  state = {
    visible: false, // modal是否可见
    material_data: null, // 从后端拉回的数据
    selected_material_data: null, // 被选中的数据
    filter_material_data: null,
    loading: false,
  };

  componentWillMount() {
    const config = getOrganizationConfigFromLocalStorage();
    this.setState({ config });
  }

  componentWillReceiveProps(nextProps) {
    const { visible } = nextProps;

    this.setState({
      visible,
    });
  }

  fetch_materials = params => {
    this.setState({ loading: true });
    const { config } = this.state;
    const configValue =
      config &&
      config[ORGANIZATION_CONFIG.taskDispatchType] &&
      config[ORGANIZATION_CONFIG.taskDispatchType].configValue;
    const fetch_materials = configValue === 'manager' ? getWorkOrderProcureMaterials : getProjectProcureMaterial;
    if (configValue === 'manager') {
      params.code = params.projectCode;
      delete params.projectCode;
    }
    return fetch_materials(params).then(res => {
      const { data } = res || {};
      const { data: real_data } = data || {};
      this.setState({ loading: false });
      return real_data.map(item => {
        const { material, project, workOrder } = item || {};
        const { amount: amountPlanned, amountActual, materialCode, materialName, unit, unitConversions } =
          material || {};
        const unitName = unit;
        const admintAmount = amountActual;
        const { projectCode, purchaseOrder, startTimePlanned, managers: projectManagers } = project || {};
        const { code, purchaseOrderCode: _purchaseOrderCode, planBeginTime, managers: workOrderManagers } =
          workOrder || {};
        const { purchaseOrderCode } = purchaseOrder || {};

        let amount = amountPlanned - amountActual;
        let amountConfirm = '';
        if (amount < 0) {
          amountConfirm = `已超出${Math.abs(amount)}`;
          amount = 0;
        }

        return {
          material: {
            amount, // 合法的amount
            amountConfirm, // 数量为负数时给出的提示
            amountPlanned,
            amountActual,
            admintAmount,
            materialCode,
            materialName,
            unit: {
              label: unit,
              key: `${unit}-1`,
            },
            unitName: {
              label: unitName,
              key: `${unitName}-1`,
            },
            unitConversions,
          },
          project: {
            projectCode,
            purchaseOrderCode,
            demandTime: startTimePlanned, // 计划开始时间是默认的需求时间
            concernedPersonIds: arrayIsEmpty(projectManagers)
              ? null
              : projectManagers.map(({ id, name }) => ({ key: id, label: name })),
          },
          workOrder: {
            workOrderCode: code,
            purchaseOrderCode: _purchaseOrderCode,
            demandTime: planBeginTime,
            concernedPersonIds: arrayIsEmpty(workOrderManagers)
              ? null
              : workOrderManagers.map(({ id, name }) => ({ key: id, label: name })),
          },
        };
      });
    });
  };

  // 将数据进行过滤，已经选择的数据无法被看见
  filter_material_data = (material_data, last_selected_material_data) => {
    const { config } = this.state;
    const configValue =
      config &&
      config[ORGANIZATION_CONFIG.taskDispatchType] &&
      config[ORGANIZATION_CONFIG.taskDispatchType].configValue;
    if (Array.isArray(material_data) && Array.isArray(last_selected_material_data)) {
      return material_data.filter(a => {
        let already_select = false;
        if (Array.isArray(last_selected_material_data)) {
          last_selected_material_data.forEach(item => {
            const { project, material, workOrder } = a || {};
            const { project: lastProject, workOrder: lastworkOrder, material: lastMaterial } = item || {};
            if (configValue !== 'manager') {
              if (
                material &&
                lastMaterial &&
                material.materialCode === lastMaterial.materialCode &&
                project &&
                lastProject &&
                project.projectCode === lastProject.projectCode
              ) {
                already_select = true;
              }
            } else if (
              material &&
              lastMaterial &&
              material.materialCode === lastMaterial.materialCode &&
              workOrder &&
              lastworkOrder &&
              workOrder.workOrderCode === lastworkOrder.workOrderCode
            ) {
              already_select = true;
            }
          });
        }
        return !already_select;
      });
    }
    return material_data;
  };

  close_modal = () => {
    const { change_visible } = this.props;
    this.setState(
      {
        visible: false,
        selected_material_data: null,
        material_data: null,
        filter_material_data: null,
      },
      () => {
        change_visible(false);
      },
    );
  };

  get_selected_material_value = selectedRows => {
    this.setState({
      selected_material_data: selectedRows,
    });
  };

  render_buttons = () => {
    const { add_value } = this.props;

    const on_ok = () => {
      const { selected_material_data } = this.state;
      add_value(selected_material_data);

      this.close_modal();
    };

    const container_style = { width: 288, margin: 'auto', marginTop: 10 };
    const button_style = { width: 114 };

    return (
      <div style={container_style}>
        <Button
          type={'default'}
          onClick={() => {
            this.close_modal();
          }}
          style={{ ...button_style, marginRight: 60 }}
        >
          取消
        </Button>
        <Button type={'primary'} onClick={() => on_ok()} style={button_style}>
          确定
        </Button>
      </div>
    );
  };

  render_selected_amount = () => {
    const { selected_material_data } = this.state;
    const { intl } = this.props;

    const amount = Array.isArray(selected_material_data) ? selected_material_data.length : 0;
    const style = { margin: '5px auto', width: 786 };

    // return <div style={style}>{`已选择${amount}个物料`}</div>;
    return <div style={style}>{changeChineseTemplateToLocale('已选择{amount}个物料', { amount }, intl)}</div>;
  };

  render() {
    const { config, visible, material_data, filter_material_data, loading } = this.state;
    const { intl } = this.props;
    const configValue =
      config &&
      config[ORGANIZATION_CONFIG.taskDispatchType] &&
      config[ORGANIZATION_CONFIG.taskDispatchType].configValue;
    const { last_selected_material_data } = this.props;
    const filter_on_search = value => {
      this.fetch_materials(value).then(res => {
        const material_data = this.filter_material_data(res, last_selected_material_data);
        const filter_material_data = material_data.map(item => {
          const { material } = item || {};
          const { materialCode, materialName } = material || {};

          return {
            text: `${materialCode}/${materialName}`,
            value: `${materialCode}/${materialName}`,
          };
        });

        this.setState({
          material_data,
          filter_material_data: _.uniqWith(filter_material_data, _.isEqual),
        });
      });
    };
    return (
      <Modal
        destroyOnClose
        title={changeChineseToLocale('添加物料', intl)}
        width={MODAL_WIDTH}
        style={{ height: 503 }}
        visible={visible}
        footer={null}
        onCancel={() => {
          this.close_modal();
        }}
      >
        <MaterialsFilter configValue={configValue} on_search={filter_on_search} />
        <SelectMaterialTable
          configValue={configValue}
          loading={loading}
          filter_material_data={filter_material_data}
          change_selected_material_value={this.get_selected_material_value}
          data={material_data}
        />
        {this.render_selected_amount()}
        {this.render_buttons()}
      </Modal>
    );
  }
}

export default injectIntl(Add_Material_Modal);
