import * as React from 'react';
import PropTypes from 'prop-types';
import { Tooltip, Select, Link, OpenModal, FormattedMessage } from 'src/components';
import debounce from 'lodash.debounce';
import CreateMaterialForm from 'src/views/bom/materials/create';
import { queryMaterialList } from 'src/services/bom/material';

const Option = Select.Option;
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
  useTooltipOption: boolean, // 是否将option改为tooltip
};

type MaterialSelectStateType = {
  materials: Array<mixed>,
  search: string,
};
// form 中使用 需要 JSON.parse(value.key)

class MaterialSelect extends React.Component<MaterialSelectType, MaterialSelectStateType> {
  constructor(props) {
    super(props);
    this.handleSearch = debounce(this.handleSearch, 800);
    this.lastFetchId = 0;
  }

  state = {
    materials: [],
    basicInfo: {},
    search: '',
    value: undefined,
  };

  componentDidMount() {
    this.handleSearch();
  }

  componentWillReceiveProps(nextProps) {
    if (!this.state.value !== nextProps.value) {
      this.setState({ value: nextProps.value });
    }
  }

  handleSearch = async search => {
    const { params } = this.props;
    this.lastFetchId += 1;
    const fetchId = this.lastFetchId;
    this.setState({ search });
    if (fetchId !== this.lastFetchId) {
      // for fetch callback order
      return;
    }
    await queryMaterialList({ page: 1, size: 50, search, ...params })
      .then(({ data: { data } }) => {
        this.setState({
          materials: data.map(data => ({
            node: data,
            text: `${data.code}/${data.name}`,
            value: data.id,
          })),
        });
      })
      .catch(e => console.log(e));
  };

  getOptions = () => {
    const { materials } = this.state;
    const { disabledValues, hideCreateButton, params, useTooltipOption } = this.props;

    const options = materials.map(node => {
      let disabled = false;
      if (disabledValues) {
        disabled = !!disabledValues.find(material => material && JSON.parse(material).code === node.node.code);
      }
      node.node.unit = {
        id: node.node.unitId,
        name: node.node.unitName,
      };
      return (
        <Option title={node.text} key={JSON.stringify(node.node)} node={node.node} disabled={disabled}>
          {useTooltipOption ? <Tooltip text={node.text} length={15} /> : node.text}
        </Option>
      );
    });

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
                            key: JSON.stringify(data),
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
            <FormattedMessage defaultMessage={'添加新物料'} />
          </Link>
        </Option>,
      );
    }

    return options;
  };

  render() {
    const { onChange, ...rest } = this.props;
    const options = this.getOptions();

    return (
      <Select
        style={{ width: 200 }}
        placeholder="请选择物料"
        value={this.state.value}
        onSearch={this.handleSearch}
        labelInValue
        filterOption={false}
        {...rest}
        optionLabelProp={'title'} // 当option为tooltip的时候。从title获取label
        onChange={value => {
          if (value && value.key) {
            value.material = JSON.parse(value.key);
          }
          this.setState({ value });
          if (typeof onChange === 'function') {
            onChange(value);
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
