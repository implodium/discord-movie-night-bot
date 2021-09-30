export default class Option<T> {

    name: string

    description: string

    isRequired: boolean

    defaultValue?: T

    constructor(name: string, description: string, isRequired: boolean, defaultValue?: T) {
        this.name = name
        this.description = description
        this.isRequired = isRequired
        this.defaultValue = defaultValue
    }

}
