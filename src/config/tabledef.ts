export const tableConfigs = {
    sys_ip: {
        colsImp: ['ip'] as const,
        uidcid: 'uid' as const,
        apiver: 'apitest',
        apisys: 'testmenu'
    },
    sqlitetest: {
        colsImp: ['field1', 'field2'] as const,
        uidcid: 'cid' as const,
        apiver: 'apitest',
        apisys: 'testmenu'
    },
    Test78: {
        colsImp: ['field1', 'field2'] as const,
        uidcid: 'cid' as const,
        apiver: 'apitest',
        apisys: 'testmenu'
    },
    testtb: {
        colsImp: ['kind', 'item', 'data'] as const,
        uidcid: 'cid' as const,
        apiver: 'apitest',
        apisys: 'testmenu'
    },
} as const;