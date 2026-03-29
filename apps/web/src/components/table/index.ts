import { TableColumnCtx } from 'element-plus'
import { isUndefined } from 'lodash-es'
import { translate } from '/@/utils/translate'

export const getCellValue = (row: TableRow, field: TableColumn, column: TableColumnCtx<TableRow>, index: number) => {
    if (!field.prop) return ''

    const prop = field.prop
    let cellValue: any = row[prop]

    if (prop.indexOf('.') > -1) {
        const fieldNameArr = prop.split('.')
        cellValue = row[fieldNameArr[0]]
        for (let index = 1; index < fieldNameArr.length; index++) {
            cellValue = cellValue ? (cellValue[fieldNameArr[index]] ?? '') : ''
        }
    }

    if ([undefined, null, ''].includes(cellValue) && field.default !== undefined) {
        cellValue = field.default
    }

    if (field.renderFormatter && typeof field.renderFormatter == 'function') {
        cellValue = field.renderFormatter(row, field, cellValue, column, index)
        console.warn('baTable.table.column.renderFormatter 即将废弃，请直接使用兼容 el-table 的 baTable.table.column.formatter 代替')
    }
    if (field.formatter && typeof field.formatter == 'function') {
        cellValue = field.formatter(row, column, cellValue, index)
    }

    return cellValue
}

export const defaultOptButtons = (optButType: DefaultOptButType[] = ['weigh-sort', 'edit', 'delete']): OptButton[] => {
    const optButtonsPre: Map<string, OptButton> = new Map([
        [
            'weigh-sort',
            {
                render: 'moveButton',
                name: 'weigh-sort',
                title: 'Drag sort',
                text: '',
                type: 'info',
                icon: 'fa fa-arrows',
                class: 'table-row-weigh-sort',
                disabledTip: false,
            },
        ],
        [
            'edit',
            {
                render: 'tipButton',
                name: 'edit',
                title: 'Edit',
                text: '',
                type: 'primary',
                icon: 'fa fa-pencil',
                class: 'table-row-edit',
                disabledTip: false,
            },
        ],
        [
            'delete',
            {
                render: 'confirmButton',
                name: 'delete',
                title: 'Delete',
                text: '',
                type: 'danger',
                icon: 'fa fa-trash',
                class: 'table-row-delete',
                popconfirm: {
                    confirmButtonText: translate('Delete'),
                    cancelButtonText: translate('Cancel'),
                    confirmButtonType: 'danger',
                    title: translate('Are you sure to delete the selected record?'),
                },
                disabledTip: false,
            },
        ],
    ])

    const optButtons: OptButton[] = []
    for (const key in optButType) {
        if (optButtonsPre.has(optButType[key])) {
            optButtons.push(optButtonsPre.get(optButType[key])!)
        }
    }
    return optButtons
}

export const findIndexRow = (data: TableRow[], findIdx: number, keyIndex: number | TableRow = -1): number | TableRow => {
    for (const key in data) {
        if (typeof keyIndex == 'number') {
            keyIndex++
        }

        if (keyIndex == findIdx) {
            return data[key]
        }

        if (data[key].children) {
            keyIndex = findIndexRow(data[key].children!, findIdx, keyIndex)
            if (typeof keyIndex != 'number') {
                return keyIndex
            }
        }
    }

    return keyIndex
}

export const invokeTableContextDataFun = <T>(
    fun: TableContextDataFun<T> | undefined,
    context: TableContextData,
    defaultValue: any = {}
): Partial<T> => {
    if (isUndefined(fun)) {
        return defaultValue
    } else if (typeof fun === 'function') {
        return fun(context)
    }
    return fun
}

type DefaultOptButType = 'weigh-sort' | 'edit' | 'delete'
