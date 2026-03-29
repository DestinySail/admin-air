import type { RuleType } from 'async-validator'
import type { FormItemRule } from 'element-plus'
import { translate } from './translate'

export function validatorMobile(rule: any, mobile: string | number, callback: Function) {
    if (!mobile) {
        return callback()
    }
    if (!/^(1[3-9])\d{9}$/.test(mobile.toString())) {
        return callback(new Error(translate('validate.Please enter the correct mobile number')))
    }
    return callback()
}

export function validatorIdNumber(rule: any, idNumber: string | number, callback: Function) {
    if (!idNumber) {
        return callback()
    }
    if (!/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(idNumber.toString())) {
        return callback(new Error(translate('validate.Please enter the correct ID number')))
    }
    return callback()
}

export function validatorAccount(rule: any, val: string, callback: Function) {
    if (!val) {
        return callback()
    }
    if (!/^[a-zA-Z][a-zA-Z0-9_]{2,15}$/.test(val)) {
        return callback(new Error(translate('validate.Please enter the correct account')))
    }
    return callback()
}

export function regularPassword(val: string) {
    return /^(?!.*[&<>"'\n\r]).{6,32}$/.test(val)
}

export function validatorPassword(rule: any, val: string, callback: Function) {
    if (!val) {
        return callback()
    }
    if (!regularPassword(val)) {
        return callback(new Error(translate('validate.Please enter the correct password')))
    }
    return callback()
}

export function regularVarName(val: string) {
    return /^([^\x00-\xff]|[a-zA-Z_$])([^\x00-\xff]|[a-zA-Z0-9_$])*$/.test(val)
}

export function validatorVarName(rule: any, val: string, callback: Function) {
    if (!val) {
        return callback()
    }
    if (!regularVarName(val)) {
        return callback(new Error(translate('validate.Please enter the correct name')))
    }
    return callback()
}

export function validatorEditorRequired(rule: any, val: string, callback: Function) {
    if (!val || val == '<p><br></p>') {
        return callback(new Error(translate('validate.Content cannot be empty')))
    }
    return callback()
}

export const validatorType = {
    required: translate('validate.required'),
    mobile: translate('utils.mobile'),
    idNumber: translate('utils.Id number'),
    account: translate('utils.account'),
    password: translate('utils.password'),
    varName: translate('utils.variable name'),
    editorRequired: translate('validate.editor required'),
    url: 'URL',
    email: translate('utils.email'),
    date: translate('utils.date'),
    number: translate('validate.number'),
    integer: translate('validate.integer'),
    float: translate('validate.float'),
}

export interface buildValidatorParams {
    name:
        | 'required'
        | 'mobile'
        | 'idNumber'
        | 'account'
        | 'password'
        | 'varName'
        | 'editorRequired'
        | 'number'
        | 'integer'
        | 'float'
        | 'date'
        | 'url'
        | 'email'
    message?: string
    title?: string
    trigger?: 'change' | 'blur'
}

export function buildValidatorData({ name, message, title, trigger = 'blur' }: buildValidatorParams): FormItemRule {
    if (name == 'required') {
        return {
            required: true,
            message: message ? message : translate('Please input field', { field: title }),
            trigger: trigger,
        }
    }

    const validatorTypeList = ['number', 'integer', 'float', 'date', 'url', 'email']
    if (validatorTypeList.includes(name)) {
        return {
            type: name as RuleType,
            message: message ? message : translate('Please enter the correct field', { field: title }),
            trigger: trigger,
        }
    }

    const validatorCustomFun: anyObj = {
        mobile: validatorMobile,
        idNumber: validatorIdNumber,
        account: validatorAccount,
        password: validatorPassword,
        varName: validatorVarName,
        editorRequired: validatorEditorRequired,
    }
    if (validatorCustomFun[name]) {
        return {
            required: name == 'editorRequired' ? true : false,
            validator: validatorCustomFun[name],
            trigger: trigger,
            message: message,
        }
    }
    return {}
}
