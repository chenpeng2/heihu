export const setCurrentDepartment = (depart) => ({
  type: 'SET_CURRENT_DEPART',
  id: depart.id,
  name: depart.name
})

export const setWarehouse = (warehouse) => ({
  type: 'SET_WAREHOUSE',
  warehouse
})

export const pageAfterInCallback = (bool) => ({
  type: 'PAGE_AFTER_IN',
  bool
})

export const setDoneJob = (donejob) => ({
  type: 'SET_DOWN_JOB',
  donejob
})
export const setSorting = (sorting) => ({
  type: 'SET_SORTING',
  sorting
})