import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';

import { FormattedMessage, Select, openModal, Button, withForm } from 'src/components';
import { middleGrey } from 'src/styles/color';
import { getTypeList } from 'src/services/knowledgeBase/exceptionalEvent';
import { getQuery } from 'src/routes/getRouteParams';

import Create from './create';

const Option = Select.Option;

type Props = {
  style: {},
  form: {},
  fetchData: () => {},
  match: {},
};

class Filter extends Component {
  props: Props;
  state = {
    typeList: null,
  };

  componentDidMount() {
    const { match, form } = this.props;

    getTypeList({ size: 1000 })
      .then(res => {
        const data = _.get(res, 'data.data');

        // 添加一个全部选项
        data.unshift({ id: null, name: '全部' });
        this.setState({
          typeList: data,
        });
      })
      .then(() => {
        const query = getQuery(match);
        form.setFieldsValue({
          eventCategoryId: query ? query.eventCategoryId : null,
        });
      });
  }

  render() {
    const { typeList } = this.state;
    const { form, fetchData } = this.props;
    const { getFieldDecorator, getFieldsValue, resetFields } = form;

    return (
      <div style={{ margin: '20px 0px' }}>
        <Button
          icon={'plus-circle-o'}
          onClick={() => {
            openModal({
              title: '创建异常主题',
              children: <Create fetchData={fetchData} />,
              footer: null,
              width: 680,
            });
          }}
        >
          创建异常主题
        </Button>
        <div style={{ display: 'inline-block', float: 'right', verticalAlign: 'middle' }}>
          {getFieldDecorator('eventCategoryId')(
            <Select style={{ width: 200 }} placeholder={'请选择事件类型'}>
              {Array.isArray(typeList)
                ? typeList.map(({ id, name }) => {
                    return (
                      <Option value={id} key={id}>
                        {name}
                      </Option>
                    );
                  })
                : null}
            </Select>,
          )}
          <Button
            icon="search"
            style={{ marginLeft: 10, verticalAlign: 'top' }}
            onClick={() => {
              const value = getFieldsValue();
              const { eventCategoryId } = value || {};

              if (fetchData && typeof fetchData === 'function') fetchData({ eventCategoryId });
            }}
          >
            查询
          </Button>
          <FormattedMessage
            style={{
              color: middleGrey,
              cursor: 'pointer',
              margin: '0 5px',
              lineHeight: '28px',
              display: 'inline-block',
            }}
            onClick={() => {
              resetFields();

              if (fetchData && typeof fetchData === 'function') fetchData({ eventCategoryId: null });
            }}
            defaultMessage={'重置'}
          />
        </div>
      </div>
    );
  }
}

export default withForm({}, withRouter(Filter));
