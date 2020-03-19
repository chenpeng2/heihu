import React, { Component } from 'react';
import _ from 'lodash';
import moment from 'utils/time';
import {
  FilterSortSearchBar,
  Spin,
  Button,
  Searchselect,
  withForm,
} from 'src/components';
import { white, borderGrey, fontSub, primary, error, warning, border } from 'src/styles/color/index';
import { setLocation } from 'utils/url';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';
import { getQuery } from 'src/routes/getRouteParams';
import { getEquipOverviewStatus } from 'services/equipmentMaintenance/base';
import { replaceSign } from 'src/constants';
import { getFormatParams } from './base';
import EquipCharts from './equipCharts';
import styles from './styles.scss';

const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;

type Props = {
  form: any,
  intl: any,
  data: [],
  match: {},
};

class EquipOverview extends Component {
  props: Props;
  state = {
    data: null,
    statusData: null,
    search: {},
  }

  componentWillMount() {
    const { match, form } = this.props;
    const { setFieldsValue } = form;
    const query = getQuery(match);
    setFieldsValue(query);
    this.getEquipOverviewStatus({});
  }

  getEquipOverviewStatus = params => {
    this.setState({ headerLoading: true });
    getEquipOverviewStatus(params)
      .then(res => {
        const { data: statusData } = res.data;
        this.setState({ statusData, headerLoading: false });
      });
  }

  renderButton = () => {
    const { form } = this.props;
    const { getFieldsValue } = form;
    return (
      <div>
        <Button
          style={{ width: 86 }}
          icon={'search'}
          onClick={() => {
            const value = getFieldsValue();
            const params = getFormatParams(value);
            setLocation(this.props, p => {
              if (!p.time) {
                p.time = [moment().subtract(7, 'd'), moment().subtract(1, 'd')];
              }
              return ({ ...p, ...value });
            });
            this.setState({ search: value, isSearch: true }, () => {
              this.setState({ isSearch: false });
            });
            this.getEquipOverviewStatus(params);
          }}
        >
          查询
        </Button>
      </div>
    );
  }

  renderStatusCard = params => {
    const { form, intl } = this.props;
    const { amount, text, color } = params;
    const { getFieldsValue } = form;
    const value = getFieldsValue() || {};
    return (
      <div
        onClick={() => {
          if (text === '总设备数' && amount > 0) {
            this.context.router.history.push(`/equipmentMaintenance/device?value=${JSON.stringify(value)}`);
          }
        }}
        className={styles.statusCard}
        style={text === '总设备数' && amount > 0 ? { cursor: 'pointer' } : {}}
      >
        <div style={{ color, fontSize: 24, marginTop: 12 }}>{amount}</div>
        <div style={{ color: fontSub, marginTop: 12 }}>{changeChineseToLocale(text, intl)}</div>
      </div>
    );
  }

  renderHeader = () => {
    const { statusData } = this.state;
    let params = {};
    if (!statusData) {
      return this.renderStatusCard({ amount: 0, text: replaceSign, color: primary });
    }
    return Object.keys(statusData).map(prop => {
      switch (prop) {
        case 'deviceTotalCount':
          params = {
            amount: statusData[prop],
            text: '总设备数',
            color: primary,
          };
          break;
        case 'deviceDownCount':
          params = {
            amount: statusData[prop],
            text: '当前停机',
            color: error,
          };
          break;
        case 'taskUnFinishedRepairCount':
          params = {
            amount: statusData[prop],
            text: '已报修',
            color: error,
          };
          break;
        case 'taskUnFinishedMaintainCount':
          params = {
            amount: statusData[prop],
            text: '待完成保养',
            color: warning,
          };
          break;
        case 'taskUnFinishedCheckCount':
          params = {
            amount: statusData[prop],
            text: '待完成点检',
            color: warning,
          };
          break;
        default:
          params = {
            amount: 0,
            text: '未知状态',
            color: error,
          };
      }
      return this.renderStatusCard(params);
    });
  }

  render() {
    const { form, match, intl } = this.props;
    const { headerLoading, search, isSearch } = this.state;
    const { getFieldDecorator } = form;
    const query = getQuery(match);
    return (
      <div className={styles.equipOverview}>
        <FilterSortSearchBar
          style={{ backgroundColor: white, width: '100%', borderBottom: `1px solid ${borderGrey}` }}
          searchDisabled
        >
          <ItemList>
            <Item label="设备类型">
              {getFieldDecorator('searchDeviceCategory', {
                initialValue: query.searchDeviceCategory,
              })(
                <Searchselect type="deviceCategory" params={{ searchResourceCategory: 'equipmentProd' }} />,
              )}
            </Item>
            <Item label="设备">
              {getFieldDecorator('searchDevice', {
                initialValue: query.searchDevice,
              })(
                <Searchselect type="prodEquip" />,
              )}
            </Item>
            <Item label="车间">
              {getFieldDecorator('searchWorkshop', {
                initialValue: query.searchWorkshop,
              })(
                <Searchselect type="workshop" />,
              )}
            </Item>
          </ItemList>
          {this.renderButton()}
        </FilterSortSearchBar>
        <div style={{ padding: '0 20px' }}>
          <Spin spinning={headerLoading}>
            <div style={{ margin: '20px 0' }}>{changeChineseToLocale('当前状态', intl)}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {this.renderHeader()}
            </div>
          </Spin>
          <EquipCharts match={match} search={search} isSearch={isSearch} />
        </div>
      </div>
    );
  }
}

EquipOverview.contextTypes = {
  router: {},
};

export default withForm({}, injectIntl(EquipOverview));
