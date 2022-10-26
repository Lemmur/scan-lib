import { useEffect, useState } from "react";
import treeService from "../services/TreeService";
import { META_DATA_TOPIC, TABLE_NAMES, TNode } from "../const";

const emit = (type: string, data?: any): void => {
    const event = new CustomEvent(type, data && { detail: data });
    document.dispatchEvent(event);
};

export function useScanTree(rootId: TNode['id']) {
    const STORE = TABLE_NAMES.NODES;

    const [ tree, setTree ] = useState<TNode | null>(null);
    const [ treeLoading, setTreeLoading ] = useState<boolean>(true);
    const [ selected, setSelectedNodes ] = useState<TNode['id'][]>([]);
    const [ checked, setCheckedNodes ] = useState<TNode['id'][]>([]);
    const [ expanded, setExpandedNodes ] = useState<TNode['id'][]>([ rootId ]);

    const setSelected = (keys: TNode['id'][]): void => {
        treeService.setSelected(keys);
        emit(META_DATA_TOPIC);
    };

    const setChecked = (keys: TNode['id'][]): void => {
        treeService.setChecked(keys);
        emit(META_DATA_TOPIC);
    };

    const setExpanded = (keys: TNode['id'][]): void => {
        treeService.setExpanded(keys);
        emit(META_DATA_TOPIC);
    };

    const loadTreeFromDb = async (rootNode: TNode) => {
        try {
            const tree = await treeService.getTree(rootNode);
            setTree(tree);
        } catch (ex) {
            alert(ex.message);
            console.error(ex);
        }
    };

    const getNodeById = async (id: TNode['id']): Promise<TNode> => {
        const [ node ] = await treeService.getNodeById(id);
        return node;
    };

    const storeCallback = () => {
        setTreeLoading(true);
        getNodeById(rootId).then(rootNode => {
            treeService.getTree(rootNode).then((data) => {
                setTree(data);
                setTreeLoading(false);
            });
        });
    };

    const metaCallback = () => {
        setSelectedNodes(treeService.getSelected());
        setCheckedNodes(treeService.getChecked());
        setExpandedNodes(treeService.getExpanded());
    };

    useEffect(() => {
        // Инициализация дерева при загрузке хука
        getNodeById(rootId).then((rootNode) => {
            loadTreeFromDb(rootNode).then(() => {
                document.addEventListener(STORE, storeCallback);
                setTreeLoading(false);
            });
        });

        // Инициализация мета данных при загрузке хука
        setSelectedNodes(treeService.getSelected());
        setCheckedNodes(treeService.getChecked());
        setExpandedNodes(treeService.getExpanded());
        document.addEventListener(META_DATA_TOPIC, metaCallback);

        return () => {
            document.removeEventListener(STORE, storeCallback);
            document.removeEventListener(META_DATA_TOPIC, metaCallback);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const insertNode = async (node: TNode): Promise<void> => {
        try {
            await treeService.addNode(node);
            emit(STORE);
        } catch (e) {
            throw Error(e);
        }
    };

    const getOrderedChildrenById = async (parentId: TNode['parentId']): Promise<TNode[]> => {
        return treeService.getOrderedChildrenById(parentId);
    };

    const deleteNode = (id: TNode['id']): void => {
        treeService.removeNodes([ id ]).then(() => {
            emit(STORE)
        });
    };

    const updateNode = (id: TNode['id'], data: TNode): void => {
        treeService.updateNodeById(id, data).then(() => {
            emit(STORE)
        });
    };

    const getLastChild = async (parentId: TNode['parentId']): Promise<TNode> => {
        return treeService.getLastChild(parentId);
    };

    const getFirstChild = async (parentId: TNode['parentId']): Promise<TNode> => {
        return treeService.getFirstChild(parentId);
    };

    const moveNodes = (ids: TNode['id'][], newParentId: TNode['id'], prevId: TNode['id'], nextId: TNode['id']): void => {
        treeService.moveNodes(ids, newParentId, prevId, nextId).then(() => emit(STORE));
    };

    const sortTree = async (rootNode: TNode): Promise<void> => {
        try {
            await treeService.sortTree(rootNode);
            emit(STORE);
        } catch (e) {
            throw Error(e);
        }
    };

    return {
        tree,
        treeLoading,
        selected,
        checked,
        expanded,
        deleteNode,
        updateNode,
        insertNode,
        getLastChild,
        getFirstChild,
        setSelected,
        setChecked,
        setExpanded,
        getNodeById,
        getOrderedChildrenById,
        moveNodes,
        sortTree
    };
}
