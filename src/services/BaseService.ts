import {
    idbCon
} from "./IDBService";

export class BaseService {

    get connection() {
        return idbCon;
    }
}
