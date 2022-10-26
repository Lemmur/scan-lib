export const DB_NAME = 'OCDSScanLibDB';

export const TABLE_NAMES = {
    NODES: 'Nodes'
};

export const NODE_TYPES = {
    TASK: 'task',
    DOCUMENT: 'document',
    PAGE: 'page'
};

export const META_DATA_TOPIC = 'NodesMeta';

/**
 * Разрешенные направления присоединения нод [что]: [...куда]
 */
export const ALLOWED_DIRECTIONS = {
    [NODE_TYPES.TASK]: [ NODE_TYPES.TASK ],
    [NODE_TYPES.DOCUMENT]: [ NODE_TYPES.TASK ],
    [NODE_TYPES.PAGE]: [ NODE_TYPES.TASK, NODE_TYPES.DOCUMENT ]
};

export interface TNode {
    id?: number;
    name?: string;
    parentId?: number;
    type?: string;
    content?: string;
    context?: object;
    externalId?: number;
    children?: TNode[];
    prevId?: number;
    nextId?: number;
}
