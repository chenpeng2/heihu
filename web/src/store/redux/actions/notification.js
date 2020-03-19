export const setNotificationMenuState = notificationMenuState => {
  return {
    type: 'setNotificationMenuState',
    notificationMenuState,
  };
};

export const toggleNotificationMenu = () => ({
  type: 'toggleNotificationMenu',
});
