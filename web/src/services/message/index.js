import request from '../../utils/request';

const defaultSize = 5;
const baseUrl = 'send_message/v1';

export async function queryUnreadMessage(params) {
  return request.get(`${baseUrl}/unread_messages`, { params });
}

export async function queryMessageByCategory(params) {
  return request.get(`${baseUrl}/categories`, { params });
}

export async function queryMessageList({ page, size, ...rest }) {
  return request.get(`${baseUrl}/received_messages`, {
    params: { page: page || 1, size: size || defaultSize, ...rest },
  });
}

// export async function readAllCategoryMessages(params) {
//   const { module, categoryCode } = params;
//   return request.put(`${baseUrl}/read_messages/all?module=${module}&categoryCode=${categoryCode}`);
// }

export async function readAllMessages(params) {
  if (!params) {
    return request.put(`${baseUrl}/read_messages/all`);
  }
  const { module, categoryCode } = params;
  if (module && categoryCode) {
    return request.put(`${baseUrl}/read_messages/all?module=${module}&categoryCode=${categoryCode}`);
  }
  if (module) {
    return request.put(`${baseUrl}/read_messages/all?module=${module}`);
  }
}

export async function revertAllMessages({ taskId, ...rest }) {
  return request.put(`${baseUrl}/tasks/${taskId}/reversed`, { ...rest });
}

export async function readMessages(params) {
  return request.post(`${baseUrl}/read_messages`, params);
}

export async function updateMessageCategorySetting(data) {
  return request.patch(`${baseUrl}/categories`, data);
}

export default 'dummy';
