import {injectable} from "inversify";

@injectable()
export default class ConfigController {

    sayHello() {
        console.log("Hello World")
    }

}
