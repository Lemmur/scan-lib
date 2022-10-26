import { TABLE_NAMES } from "../const";
import { DATA_TYPE } from "jsstore";

export const NodesTable = {
    name: TABLE_NAMES.NODES,
    columns: {
        id: {
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            dataType: DATA_TYPE.String
        },
        parentId: {
            dataType: DATA_TYPE.Number,
        },
        type: {
            dataType: DATA_TYPE.String
        },
        content: {
            dataType: DATA_TYPE.String
        },
        context: {
            dataType: DATA_TYPE.Object
        },
        externalId: {
            dataType: DATA_TYPE.Number
        },
        nextId: {
            dataType: DATA_TYPE.Number
        },
        prevId: {
            dataType: DATA_TYPE.Number
        },
    }
};
