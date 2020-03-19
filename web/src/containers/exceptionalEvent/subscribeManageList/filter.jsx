import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import { FormattedMessage, openModal, Button, withForm } from 'src/components';
import SearchSelect from 'src/components/select/searchSelect';
import { externalSearch, formatUser } from 'src/containers/exceptionalEvent/subscribeManageList/util';
import { middleGrey } from 'src/styles/color';
import { getQuery } from 'src/routes/getRouteParams';

import Create from './create';

type Props = {
  style: {},
  form: {},
  fetchData: () => {},
  match: {},
};

class Filter extends Component {
  props: Props;
  state = {};

  componentDidMount() {
    const { match, form } = this.props;

    const query = getQuery(match);
    const { userId, userType, userName } = query || {};

    let _userType;
    if (userType === 0) {
      _userType = 'user';
    }
    if (userType === 1) {
      _userType = 'userGroup';
    }

    if (userId && _userType) {
      form.setFieldsValue({
        usersAndWorkGroupId: { key: `${userId}-${_userType}`, label: userName },
      });
    }
  }

  render() {
    const { form, fetchData } = this.props;
    const { getFieldDecorator, getFieldsValue, resetFields } = form;

    return (
      <div style={{ margin: '20px 0px' }}>
        <Button
          icon={'plus-circle-o'}
          onClick={() => {
            openModal({
              title: '创建配置',
              children: <Create fetchData={fetchData} />,
              footer: null,
              width: 680,
            });
          }}
        >
          创建配置
        </Button>
        <div style={{ display: 'inline-block', float: 'right', verticalAlign: 'middle' }}>
          {getFieldDecorator('usersAndWorkGroupId')(
            <SearchSelect
              extraSearch={externalSearch}
              style={{ width: 200 }}
              placeholder={'请选择用户／用户组'}
            />,
          )}
          <Button
            icon="search"
            style={{ marginLeft: 10, verticalAlign: 'top' }}
            onClick={() => {
              const value = getFieldsValue();
              const { usersAndWorkGroupId } = value || {};

              if (fetchData && typeof fetchData === 'function') {
                const { userId, userType, userName } = formatUser(usersAndWorkGroupId) || {};
                fetchData({ userId, userType, userName });
              }
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

              if (fetchData && typeof fetchData === 'function') fetchData({ userId: null, userType: null, userName: null });
            }}
            defaultMessage={'重置'}
          />
        </div>
      </div>
    );
  }
}

export default withForm({}, withRouter(Filter));
