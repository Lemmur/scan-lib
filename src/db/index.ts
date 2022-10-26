import { DB_NAME } from "../const/const";
import { NodesTable } from "./NodesTable";

export const getDatabase = () => {
    return {
        name: DB_NAME,
        tables: [
            NodesTable,
        ]
    };
};
