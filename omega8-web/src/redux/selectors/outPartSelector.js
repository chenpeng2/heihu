const gettableSettings = store => {
    let data = store.outPartData.tablesettingData
    return data
}

const getWarehouseList = store => {
    const data = store.outPartData.wareHouseList
    return data
}

export {
    gettableSettings,
    getWarehouseList
}