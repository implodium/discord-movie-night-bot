import 'reflect-metadata'
import { Container } from "inversify";

const _Container = new Container({
    defaultScope: 'Singleton',
    autoBindInjectable: true
})

export default _Container as Container
