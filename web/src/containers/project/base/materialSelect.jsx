import * as React from 'react';
import PropTypes from 'prop-types';
import _, { debounce } from 'lodash';

import { Select, Link, OpenModal } from 'src/components';
import { stringEllipsis } from 'utils/string';
import { replaceSign } from 'src/constants';
import moment from 'src/utils/time';
import CreateMaterialForm from 'src/views/bom/materials/create';
import { queryMaterialList } from 'src/services/bom/material';
import { getPurchaseOrderDetail } from 'src/services/cooperate/purchaseOrder';

const Option = Select.Option;
const OptGroup = Select.OptGroup;

type MaterialSelectType = {
  style: any,
  className: string,
  disabledValues: Array<string>,
  hideCreateButton: boolean,
  params: {
    from: Number,
    first: Number,
    code: String,
    name: String,
    search: String,
    status: 'all' | 1 | 0,
  },
  value: any,
  onChange: any,
  onlyId: boolean,
  purchaseOrderCode: string,
};

type MaterialSelectStateType = {
  materials: Array<mixed>,
  search: string,
};

class MaterialSelect extends React.Component<MaterialSelectType, MaterialSelectStateType> {
  constructor(props) {
    super(props);
    this.handleSearch = debounce(this.handleSearch, 800);
    this.lastFetchId = 0;
  }
  state = {
    materials: {
      purchaseOrderMaterial: [],
      all: [],
    },
    basicInfo: {},
    search: '',
    value: undefined,
  };

  componentDidMount() {
    this.handleSearch();
  }

  componentWillReceiveProps(nextProps) {
    if (!this.state.value !== nextProps.value) {
      const searchRes = this.handleSearch();
      if (searchRes) {
        searchRes.then(() => {
          this.setState({ value: nextProps.value });
        });
      }
    }
  }

  handleSearch = async search => {
    const { params, purchaseOrderCode } = this.props;
    this.lastFetchId += 1;
    const fetchId = this.lastFetchId;
    this.setState({ search });
    if (fetchId !== this.lastFetchId) {
      // for fetch callback order
      return null;
    }

    const materials = {};

    // 获取订单中的物料
    if (purchaseOrderCode) {
      await getPurchaseOrderDetail(purchaseOrderCode).then(res => {
        const materialList = _.get(res, 'data.data.materialList');

        materials.purchaseOrderMaterial = Array.isArray(materialList)
          ? materialList
              .filter(i => {
                // 过滤掉停用的物料
                return i && i.status === 1;
              })
              .map(i => {
                // todo: 拿到对应销售订单中的交货日期
                const { materialCode, materialName, targetDate, id } = i || {};
                return {
                  label: `${materialCode}/${materialName}`,
                  value: materialCode,
                  targetDate,
                  id,
                };
              })
          : [];
      });
    }

    // 获取其他物料
    return await queryMaterialList({ page: 1, size: 20, search, status: 1 }).then(res => {
      const data = _.get(res, 'data.data');

      const dataAfterFormat = Array.isArray(data)
        ? data.map(data => ({
            label: `${data.code}/${data.name}`,
            value: data.code,
          }))
        : [];

      // 将订单中的物料去除
      const dataAfterFilter = [];
      dataAfterFormat.forEach(i => {
        let inPurchaseOrderMaterials = false;

        if (Array.isArray(materials.purchaseOrderMaterial)) {
          materials.purchaseOrderMaterial.forEach(j => {
            if (j && i && j.value === i.value) {
              inPurchaseOrderMaterials = true;
            }
          });
        }

        if (!inPurchaseOrderMaterials) {
          dataAfterFilter.push(i);
        }
      });

      materials.all = dataAfterFilter;

      this.setState({
        materials,
      });
    });
  };

  getOptions = () => {
    const { materials } = this.state;
    const { disabledValues, hideCreateButton, params } = this.props;

    const options = [];

    options.push(
      <OptGroup label={'订单中的物料'}>
        {Array.isArray(materials.purchaseOrderMaterial)
          ? materials.purchaseOrderMaterial.map(node => {
              const { showTargetDate } = this.props;
              let disabled = false;
              if (disabledValues) {
                disabled = !!disabledValues.find(material => JSON.parse(material).code === node.node.code);
              }
              const { label, value, targetDate, id } = node || {};

              return (
                <Option
                  key={value}
                  value={showTargetDate ? `${value}@${id}` : value}
                  orderMaterialId={id}
                  targetDate={targetDate}
                  disabled={disabled}
                >
                  {showTargetDate
                    ? `${stringEllipsis(label, 22)}—<${
                        targetDate ? moment(targetDate).format('YYYY/MM/DD') : replaceSign
                      }>`
                    : `${stringEllipsis(label, 28)}`}
                </Option>
              );
            })
          : null}
      </OptGroup>,
    );

    options.push(
      <OptGroup label={'其他物料'}>
        {Array.isArray(materials.all)
          ? materials.all.map(node => {
              let disabled = false;
              if (disabledValues) {
                disabled = !!disabledValues.find(material => JSON.parse(material).code === node.node.code);
              }
              const { label, value } = node || {};

              return (
                <Option key={value} title={label} value={value} disabled={disabled}>
                  {label}
                </Option>
              );
            })
          : null}
      </OptGroup>,
    );

    if (!hideCreateButton) {
      options.unshift(
        <Option value="create" key="add" disabled>
          <Link
            icon="plus-circle-o"
            onClick={() => {
              this.setState({ createModal: true }, () => {
                OpenModal(
                  {
                    title: '创建物料',
                    footer: null,
                    children: (
                      <CreateMaterialForm
                        inModal="true"
                        status={params && params.status}
                        onSuccess={data => {
                          const value = {
                            key: data.code,
                            label: `${data.code}/${data.name}`,
                          };
                          this.setState({ value }, () => {
                            if (this.props.onChange) {
                              this.props.onChange({ ...value, material: data });
                            }
                          });
                        }}
                      />
                    ),
                  },
                  this.context,
                );
              });
            }}
            style={{ width: '100%' }}
          >
            添加新物料
          </Link>
        </Option>,
      );
    }

    return options;
  };

  render() {
    const options = this.getOptions();

    return (
      <Select
        style={{ width: 200 }}
        placeholder="请选择物料"
        value={this.state.value}
        onSearch={this.handleSearch}
        labelInValue
        filterOption={false}
        {...this.props}
        onChange={(value, option) => {
          this.setState({ value });
          if (this.props.onChange) {
            this.props.onChange(value, option);
          }
        }}
      >
        {options}
      </Select>
    );
  }
}

const convert = data => JSON.parse(data.key);
MaterialSelect.convert = convert;
MaterialSelect.contextTypes = {
  router: PropTypes.object,
};

export default MaterialSelect;
