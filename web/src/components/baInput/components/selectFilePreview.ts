import { buildSuffixSvgUrl } from '/@/api/common'

export const previewRenderFormatter = (row: TableRow, column: TableColumn, cellValue: string) => {
    const imageSuffixes = ['gif', 'jpg', 'jpeg', 'bmp', 'png', 'webp']
    if (imageSuffixes.includes(cellValue)) {
        return row.full_url
    }
    return buildSuffixSvgUrl(cellValue)
}
