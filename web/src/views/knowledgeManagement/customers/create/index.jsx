// import React, { Component } from 'react';
// import { Form } from 'antd';
// import { withRouter } from 'react-router-dom';
// import { getQuery } from 'src/routes/getRouteParams';
// import { graphql } from 'react-relay';
// import { Input, FormItem, withForm, Attachment } from 'components';
// import { checkStringLength } from 'components/form';
// import { createQueryRenderer } from 'store/relay/relayApi';
// import { addCustomerMutation } from 'store/relay/mutation';
// // test

// type Props = {
//   viewer: {
//     organization: {},
//   },
//   relay: {},
//   match: {},
//   form: {
//     getFieldDecorator: () => {},
//   },
//   location: {
//     params: {
//       relay: any,
//     },
//   },
// };

// class CreateCustomer extends Component {
//   props: Props;
//   state = {};

//   submit(value) {
//     const { viewer: { organization }, match } = this.props;
//     const query = getQuery(match);
//     value.files = value.files ? value.files.map(file => ({ fileId: file.id })) : [];
//     return addCustomerMutation(organization && organization.id, {
//       variables: { input: value, first: query.first || 10, from: query.from || 0 },
//     })();
//   }

//   render() {
//     const { form } = this.props;
//     const { getFieldDecorator } = form;
//     return (
//       <Form layout="vertical">
//         <FormItem label={'名称'}>
//           {getFieldDecorator('name', {
//             rules: [
//               { required: true, message: '请输入客户名称' },
//               { min: 0, max: 12, message: '客户名称长度不能超过12个字' },
//             ],
//           })(<Input />)}
//         </FormItem>
//         <FormItem label={'备注'}>
//           {getFieldDecorator('note', {
//             rules: [{ validator: checkStringLength() }],
//           })(<Input.TextArea />)}
//         </FormItem>
//         <FormItem label={'附件'}>
//           {getFieldDecorator('files', {
//             valuePropName: 'myFileList',
//           })(<Attachment />)}
//         </FormItem>
//       </Form>
//     );
//   }
// }

// const CreateCustomerForm = withForm({ showFooter: true }, CreateCustomer);

// const query = graphql`
//   query create_customer_Query {
//     viewer {
//       id
//       organization {
//         id
//       }
//     }
//   }
// `;

// export const CreateCustomerFormWithQueryRenderer = withRouter(createQueryRenderer(CreateCustomerForm, query));

// export default 'dummy';
