import React from 'react';
import _ from 'lodash';
import { Icon, Spin, Link, Tooltip } from 'components';
import debounce from 'lodash.debounce';
import { getValidDeviceCategoryList, getValidDeviceList } from 'src/services/equipmentMaintenance/base';
import { getEquipmentCategoryList } from 'src/services/knowledgeBase/equipment';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';
import { getUserInfo } from 'src/services/auth/user';
import log from 'src/utils/log';
import { primary } from 'src/styles/color/index';
import styles from './styles.scss';
import Select from '../select';

const Option = Select.Option;
const storage = window.localStorage;

type propsType = {
  type: 'account' | 'processRouting',
  style: mixed,
  isSubmit: boolean,
  params: mixed,
  value: any,
  intl: any,
  initialValue: [],
  handleData: () => {},
  onSelect: () => {},
  onDeselect: () => {},
  // 值需要从同一个类型里取
  storageType: string,
  // 当需要select组件的值需要从外部传进来
  data: any,
  handleSearch: () => {},
  // 是否需要在搜不到的时候显示新建
  newUrl: string,
};

class RecordHistorySelect extends React.Component<propsType> {
  constructor(props) {
    super(props);
    this.handleSearch = debounce(this.handleSearch, 800);
  }

  state = {
    data: [],
    userInfo: {},
    sort: '倒序',
    loading: false,
    noSearchContent: false,
    showHistoryRecord: false,
    value: [],
  };

  componentDidMount() {
    this.getUserInfo();
  }

  getUserInfo = () => {
    const { initialValue, storageType } = this.props;
    this.setState({ loading: true });
    try {
      getUserInfo().then(res => {
        const userInfo = res.data.data;
        const accountIdentity = `${userInfo.orgId}:${userInfo.name}`;
        this.setState({ userInfo });
        let historyRecord = [];
        if (storageType.indexOf(';') !== -1) {
          storageType.split(';').forEach(_storageType => {
            historyRecord = historyRecord.concat(JSON.parse(storage.getItem(`${accountIdentity}:${_storageType}`)));
          });
        } else {
          historyRecord = JSON.parse(storage.getItem(`${accountIdentity}:${storageType}`));
        }
        const data = _.differenceBy(historyRecord, initialValue, 'key');
        if (historyRecord && historyRecord.length) {
          this.setState({ data: data.slice(0, 10), showHistoryRecord: true, loading: false });
        } else {
          this.handleSearch('');
        }
      });
    } catch (e) {
      log.error(e);
    }
  };

  handleSearch = async search => {
    let selectData = [];
    const { handleData } = this.props;
    const { showHistoryRecord } = this.state;
    const params = {
      search,
      ...this.props.params,
    };
    // 当选择type的时候的处理逻辑
    if (search || (search === '' && !showHistoryRecord)) {
      this.setState({ data: [], loading: true });
      switch (this.props.type) {
        case 'faultCase': {
          const {
            data: { data },
          } = await getValidDeviceCategoryList({ searchContent: params.search });
          selectData = data.map(({ name, id, code, type }) => ({
            key: id || code,
            label: name,
            extra:
              type === 'equipmentProd'
                ? 'equipmentProdCategory'
                : type === 'equipmentModule'
                ? 'equipmentModuleCategory'
                : 'mouldCategory',
          }));
          break;
        }
        case 'deviceCategory': {
          const variables = {
            searchContent: params.search,
            page: 1,
            size: 50,
            ...params,
          };
          delete variables.search;
          const {
            data: { data },
          } =
            variables.searchType === 'mould'
              ? await getValidDeviceCategoryList(variables)
              : await getEquipmentCategoryList(variables);
          selectData = data.map(({ name, id, resourceCategory }) => ({
            key: id,
            extra: resourceCategory === 'equipmentProd' ? 'equipmentProdCategory' : 'equipmentModuleCategory',
            label: name,
          }));
          break;
        }
        case 'device': {
          const variables = {
            searchContent: params.search,
            ...params,
          };
          const {
            data: { data },
          } = await getValidDeviceList(variables);
          selectData = data.map(({ name, id, category, code }) => ({
            // key: `${id};${category.type}`,
            key: id,
            extra: `${category.type};${category.id}`,
            label: `${name} (编码${code})`,
          }));
          break;
        }
        default:
          throw Error('请填写 type');
      }
      if (typeof handleData === 'function') {
        selectData = handleData(selectData);
      }
      this.setState({
        data: selectData,
        showHistoryRecord: false,
        loading: false,
      });
      if (selectData && selectData.length > 0) {
        this.setState({ noSearchContent: false });
      } else {
        this.setState({ noSearchContent: true });
      }
    } else {
      this.getUserInfo();
    }
  };

  storageSetItem = (storageType, value) => {
    const { userInfo } = this.state;
    const accountIdentity = `${userInfo.orgId}:${userInfo.name}`;
    const historyRecord = JSON.parse(storage.getItem(`${accountIdentity}:${storageType}`)) || [];
    value.forEach(n => {
      const index = historyRecord.map(m => m.key).indexOf(n.key);
      if (index !== -1) {
        historyRecord.splice(index, 1);
      }
      historyRecord.unshift(n);
    });
    storage.setItem(`${accountIdentity}:${storageType}`, JSON.stringify(historyRecord));
  };

  recordHistorySelect = () => {
    const { value } = this.state;
    const { storageType } = this.props;
    if (storageType.indexOf(';') !== -1) {
      storageType.split(';').forEach(_storageType => {
        this.storageSetItem(_storageType, value.filter(n => n.extra === _storageType));
      });
    } else {
      this.storageSetItem(storageType, value);
    }
  };

  render() {
    const { data, sort, noSearchContent, showHistoryRecord, loading } = this.state;
    const { style, isSubmit, onSelect, onDeselect, newUrl, placeholder, intl, ...rest } = this.props;
    if (isSubmit) {
      this.recordHistorySelect();
    }
    let _data = null;
    if (this.props.data && this.props.data.length) {
      _data = this.props.data;
    } else {
      _data = data;
    }

    return (
      <div className={styles.recordHistorySelect}>
        <Select
          allowClear
          labelInValue
          onFocus={() => {
            this.getUserInfo();
          }}
          onBlur={() => {
            this.setState({ data: [] });
          }}
          notFoundContent={
            loading ? (
              <Spin size="small" />
            ) : noSearchContent ? (
              <div style={{ color: '#9B9B9B', borderRadius: '0 0 2px 2px', display: 'flex', alignItems: 'center' }}>
                <Tooltip text={changeChineseToLocale('未找到对应适用范围', intl)} width={150} />，
                {newUrl ? <Link to={newUrl}>，{changeChineseToLocale('现在创建', intl)}</Link> : null}
              </div>
            ) : null
          }
          placeholder={changeChineseToLocale(placeholder || '请选择', intl)}
          onSearch={this.props.handleSearch || this.handleSearch}
          onSelect={(value, options) => {
            if (options.props.extra) {
              value.extra = options.props.extra;
            }
            if (onSelect) {
              onSelect(value);
            }
            this.state.value.push(value);
            this.setState({ value: this.state.value });
          }}
          onDeselect={value => {
            if (onDeselect) {
              onDeselect(value);
            }
            this.setState({ value: this.state.value.filter(n => n.key !== value.key) });
          }}
          style={{ width: 120, ...style }}
          filterOption={false}
          {...rest}
        >
          {_data && _data.filter(n => n).length && showHistoryRecord ? (
            <Option key={'reverse'} value={'reverse'} disabled>
              {
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>最近使用</div>
                  <div
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      this.setState({ data: data.reverse(), sort: sort === '正序' ? '倒序' : '正序' });
                    }}
                  >
                    <Icon type="swap" style={{ color: primary, transform: 'rotate(270deg)' }} />
                    <span style={{ color: primary, marginLeft: 5 }}>{sort}</span>
                  </div>
                </div>
              }
            </Option>
          ) : null}
          {_data
            .filter(n => n)
            .map(n => {
              const key = (n && n.key) || '';
              const label = (n && n.label) || '';
              const extra = (n && n.extra) || '';
              return (
                <Option key={key} value={key} extra={extra}>
                  {label}
                </Option>
              );
            })}
        </Select>
      </div>
    );
  }
}

export default injectIntl(RecordHistorySelect);
