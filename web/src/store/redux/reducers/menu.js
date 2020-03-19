// app的菜单栏menu的reducer
export const reducer = (
  oldMenuState = { visible: true },
  { type, menuState } = {
    menuState: {
      visible: true,
    },
  },
) => {
  switch (type) {
    case 'setMenuState':
      return menuState;
    case 'toggleMenu':
      return {
        ...oldMenuState,
        visible: !oldMenuState.visible,
      };
    default:
      return oldMenuState;
  }
};

export default 'dummy';
