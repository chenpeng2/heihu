export function changeRoute(pathName) {
    // action
    return {
      type: "CHANGE-ROUTE",
      payload: pathName,
    }
}