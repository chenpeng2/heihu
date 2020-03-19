// app的菜单栏menu的reducer
export const reducer = (
  oldNotificationMenuStation = { visible: false },
  { type, notificationMenuState } = {
    notificationMenuState: {
      visible: false,
    },
  },
) => {
  switch (type) {
    case 'setNotificationMenuState':
      return notificationMenuState;
    case 'toggleNotificationMenu':
      return {
        ...oldNotificationMenuStation,
        visible: !oldNotificationMenuStation.visible,
      };
    default:
      return oldNotificationMenuStation;
  }
};

export default 'dummy';
