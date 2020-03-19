import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Button, Link } from 'src/components';
import { border } from 'src/styles/color';
import Filter from 'src/containers/productivityStandard/list/filter';
import Table from 'src/containers/productivityStandard/list/table';
import LinkToCreateProductivityStandardPage from 'src/containers/productivityStandard/base/linkToCreateProductivityStandardPage';
import { getProductivityStandardList } from 'src/services/knowledgeBase/productivityStandard';
import { setLocation } from 'utils/url';
import { getLocation, getQuery } from 'src/routes/getRouteParams';
import ImportProductivityStandard from './ImportProductivityStandard';

// 获取表当数据的函数
const fetchProductivityStandard = async params => {
  const res = await getProductivityStandardList(params);
  const { data } = res || {};

  return data;
};

type Props = {
  match: {},
};

class ProductivityStandardList extends Component {
  props: Props;
  state = {
    productivityStandardData: null,
    totalAmount: 0,
    loading: false,
    openImportModal: false,
  };

  componentDidMount() {
    this.fetchAndSetProductivityStandard();
  }

  renderFilter = () => {
    return <Filter fetchData={this.fetchAndSetProductivityStandard} />;
  };

  renderCreateProductivityStandardListButton = () => {
    const render = () => {
      return <Button icon={'plus-circle-o'}>创建标准产能</Button>;
    };

    const style = { margin: 20 };

    return <LinkToCreateProductivityStandardPage style={style} render={render} />;
  };

  renderLine = () => {
    const style = { borderTop: `1px solid ${border}` };
    return <div style={style} />;
  };

  renderProductivityStandardTable = () => {
    const { loading, totalAmount, productivityStandardData } = this.state;

    return (
      <Table
        loading={loading}
        totalAmount={totalAmount}
        fetchData={this.fetchAndSetProductivityStandard}
        tableData={productivityStandardData}
      />
    );
  };

  renderImport = () => {
    const { openImportModal } = this.state;
    return (
      <span className="child-gap">
        <Button
          icon="download"
          ghost
          onClick={() => {
            this.setState({ openImportModal: true });
          }}
        >
          导入标准产能
        </Button>
        <Link icon="eye-o" to="/knowledgeManagement/productivityStandards/import-list">
          查看导入日志
        </Link>
        <ImportProductivityStandard
          visible={openImportModal}
          toggleVisible={() => {
            this.setState({ openImportModal: !openImportModal });
          }}
        />
      </span>
    );
  };

  fetchAndSetProductivityStandard = async params => {
    const { match } = this.props;

    // 设置loading
    this.setState({ loading: true });

    // 将url中的值获取到, 设置为参数
    const query = getQuery(match);
    // size的默认值为10
    const _params = { ...query, ...params, size: 10 };
    // 将自己的query设置到url中
    const location = getLocation(match);
    location.query = { ...location.query, ...params };
    setLocation(this.props, () => location.query);
    fetchProductivityStandard(_params)
      .then(res => {
        const { data, count } = res || {};
        this.setState({
          productivityStandardData: data,
          totalAmount: count,
        });
      })
      .finally(() => {
        // 设置loading
        this.setState({ loading: false });
      });
  };

  render() {
    return (
      <div>
        {this.renderFilter()}
        {this.renderLine()}
        {this.renderCreateProductivityStandardListButton()}
        {this.renderImport()}
        {this.renderProductivityStandardTable()}
      </div>
    );
  }
}

export default withRouter(ProductivityStandardList);
