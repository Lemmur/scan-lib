import { BaseService } from "./BaseService";
import { ALLOWED_DIRECTIONS, NODE_TYPES, TABLE_NAMES, TNode } from "../const";

export class TreeService extends BaseService {
    private readonly tableName: string;

    public selected: TNode['id'][];
    public checked: TNode['id'][];
    public expanded: TNode['id'][];

    constructor() {
        super();
        this.tableName = TABLE_NAMES.NODES;
        this.selected = [];
        this.expanded = [];
        this.checked = [];
    }

    /**
     * Получение следующего братского элемента в двусвязном списке
     * @param currentChild - Текущий элемент
     * @param children - Все дочерние элементы
     */
    private nextChild(currentChild: TNode, children: TNode[]) {
        return children.find(node => node.prevId === currentChild.id);
    }

    /**
     * Приватный метод добавления элемента
     * @param nodes - Элементы для добавления
     */
    private async insertNodes(nodes: TNode[]): Promise<TNode[]> {
        try {
            return await this.connection.insert<TNode>({
                into: this.tableName,
                values: nodes,
                return: true
            }) as TNode[];
        } catch (e) {
            throw Error(e);
        }
    }

    /**
     * Задает выделенные элементы
     * @param keys
     */
    public setSelected(keys: TNode['id'][]): void {
        this.selected = keys;
    }

    /**
     * Возвращает выделенные элементы
     */
    public getSelected(): TNode['id'][] {
        return this.selected;
    }

    /**
     * Задает выбранные элементы
     * @param keys
     */
    public setChecked(keys: TNode['id'][]): void {
        this.checked = keys;
    }

    /**
     * Возвращает выбранные элементы
     */
    public getChecked(): TNode['id'][] {
        return this.checked;
    }

    /**
     * Задает раскрытые элементы
     * @param keys
     */
    public setExpanded(keys: TNode['id'][]): void {
        this.expanded = keys;
    }

    /**
     * Возвращает раскрытые элементы
     */
    public getExpanded(): TNode['id'][] {
        return this.expanded;
    }

    /**
     * Рекурсивный метод получения дерева из IndexedDB
     * @returns Promise<TNode> - Дерево с упорядоченным двусвязным списком дочерних элементов
     * @param currentNode - Корневой элемент
     */
    public async getTree(currentNode: TNode): Promise<TNode> {
        if (currentNode) {
            if (currentNode.type === NODE_TYPES.PAGE) {
                return currentNode;
            }

            try {
                const children = await this.getOrderedChildrenById(currentNode.id);
                if (children.length > 0) {
                    return {
                        ...currentNode,
                        children: await Promise.all(children.map((child) => this.getTree(child)))
                    };
                } else {
                    return currentNode;
                }
            } catch (e) {
                throw Error(e);
            }
        } else {
            throw Error('Ошибка вызова функции');
        }
    }

    /**
     * Сортировка дерева в заданной последовательности [tasks, documents, pages]
     * @param currentNode - Текущий корневой элемент
     */
    public async sortTree(currentNode: TNode): Promise<TNode> {
        if (currentNode) {
            if (currentNode.type === NODE_TYPES.PAGE) {
                return currentNode;
            }

            try {
                const children = await this.getOrderedChildrenById(currentNode.id);
                if (children.length > 0) {
                    const tasks = children.filter(child => child.type === NODE_TYPES.TASK);
                    const docs = children.filter(child => child.type === NODE_TYPES.DOCUMENT);
                    const pages = children.filter(child => child.type === NODE_TYPES.PAGE);
                    const orderedChildren = [ ...tasks, ...docs, ...pages ]; // Последовательность отображения

                    const updatingNodes = orderedChildren.map((child, idx) => {
                        if (orderedChildren.length === 1) {
                            return { ...child, prevId: 0, nextId: 0 };
                        }

                        if (idx === 0) {
                            return {
                                ...child,
                                prevId: 0,
                                nextId: orderedChildren[idx + 1].id
                            };
                        } else if (idx === orderedChildren.length - 1) {
                            return {
                                ...child,
                                prevId: orderedChildren[idx - 1].id,
                                nextId: 0
                            };
                        } else {
                            return {
                                ...child,
                                prevId: orderedChildren[idx - 1].id,
                                nextId: orderedChildren[idx + 1].id
                            };
                        }
                    });

                    await this.removeNodes(updatingNodes.map(node => node.id));
                    await this.insertNodes(updatingNodes);

                    return {
                        ...currentNode,
                        children: await Promise.all(orderedChildren.map((child) => this.sortTree(child)))
                    };
                } else {
                    return currentNode;
                }
            } catch (e) {
                throw Error(e);
            }
        }
    }

    /**
     * Получение упорядоченных потомков по родительскому элементу
     * @param parentId - Родительский элемент
     */
    public async getOrderedChildrenById(parentId: TNode['parentId']): Promise<TNode[]> {
        try {
            const children = await this.getChildrenById(parentId);

            let child = children.find(node => node.prevId === 0);
            if (child) {
                const orderedChildren: TNode[] = [];
                orderedChildren.push(child);
                while (child.nextId !== 0) {
                    child = this.nextChild(child, children);
                    orderedChildren.push(child);
                }
                return orderedChildren;
            } else {
                return [];
            }
        } catch (e) {
            throw Error(e);
        }
    }

    /**
     * Получение неупорядоченного массива всех потомков по родительскому элементу
     * @param parentId - Родительский элемент
     */
    public async getChildrenById(parentId: TNode['parentId']): Promise<TNode[]> {
        try {
            return await this.connection.select<TNode>({
                from: this.tableName,
                where: {
                    parentId: parentId
                }
            });
        } catch (e) {
            throw Error(e);
        }
    }

    /**
     * Получение элемента по ID
     * @param id - ID элемента
     */
    public async getNodeById(id: TNode['id']): Promise<TNode[]> {
        try {
            return this.connection.select<TNode>({
                from: this.tableName,
                where: {
                    id: id
                }
            });
        } catch (e) {
            throw Error(e);
        }
    }

    /**
     * Метод перемещения элементов по дереву
     * Элементы должны быть от одного родителя и одного типа!
     * @param ids - Массив идентификаторов элементов
     * @param newParentId - Идентификатор нового родителя
     * @param prevId - Идентификатор предыдущего элемента для вставки
     * @param nextId - Идентификатор следующего элемента для вставки
     */
    public async moveNodes(ids: TNode['id'][], newParentId: TNode['id'], prevId: TNode['id'], nextId: TNode['id']): Promise<void> {
        if (ids.includes(prevId) || ids.includes(nextId))
            throw Error('Перемещение внутри выделенных элементов запрещено');

        if (newParentId === 0) throw Error('Перемещение в ROOT запрещено');

        // Фильтуем выделенные элементы по упорядоченому массиву дочерних элементов для сохранения правильной последовательности
        const [ movingNode ] = await this.getNodeById(ids[0]);
        const movingNodesParentId = movingNode.parentId;
        const movingNodesType = movingNode.type;

        const [ forParentNode ] = await this.getNodeById(newParentId);

        if (!ALLOWED_DIRECTIONS[movingNodesType].includes(forParentNode.type))
            throw Error(`Элемент типа '${ movingNodesType }' невозможно разместить в '${ forParentNode.type }'`);

        const allSiblings = await this.getOrderedChildrenById(movingNodesParentId);
        const movingNodes = allSiblings.filter(node => ids.includes(node.id));

        if (movingNodes.filter(node => node.type !== movingNodesType).length > 0)
            throw Error(`Элементы не отдного типа'`);

        //Формируем наборы последовательно выделенных элементов, чтобы элементы между ними перелинковать между собой
        const nodeSets = [ [ movingNodes[0] ] ];
        let setNumber = 0;
        for (let index = 0; index < movingNodes.length - 1; index++) {
            if (movingNodes[index].nextId === movingNodes[index + 1].id) {
                nodeSets[setNumber].push(movingNodes[index + 1]);
            } else {
                setNumber++;
                nodeSets.push([]);
                nodeSets[setNumber].push(movingNodes[index + 1])
            }
        }

        await Promise.all(nodeSets.map(async nodeSet => {
            const prevNodeId = nodeSet[0].prevId;
            const nextNodeId = nodeSet[nodeSet.length - 1].nextId;

            !!prevNodeId && await this.updateNodeById(prevNodeId, { nextId: nextNodeId });
            !!nextNodeId && await this.updateNodeById(nextNodeId, { prevId: prevNodeId });
        }));

        // Линкуем между собой все выделенные элементы в правильной последовательности
        [ ...movingNodes ].forEach((node, idx) => {
            movingNodes[idx] = {
                ...movingNodes[idx],
                parentId: newParentId,
                prevId: idx === 0 ? prevId : movingNodes[idx - 1].id,
                nextId: idx === movingNodes.length - 1 ? nextId : movingNodes[idx + 1].id
            };
        });

        await this.removeNodes(movingNodes.map(node => node.id));
        await this.insertNodes(movingNodes);

        // Вставляем выделенные элементы в правильное место, линкуя последующий и предыдущий элемент в месте вставки
        !!nextId && this.updateNodeById(nextId, { prevId: movingNodes[ids.length - 1].id });
        !!prevId && this.updateNodeById(prevId, { nextId: movingNodes[0].id });
    }

    /**
     * Добавление элемента в дерево
     * @param node - Новый элемент
     */
    public async addNode(node: TNode): Promise<number> {
        const [ forParentNode ] = await this.getNodeById(node.parentId);
        const { type: newNodeType } = node;

        if (forParentNode) {
            if (!ALLOWED_DIRECTIONS[newNodeType].includes(forParentNode.type))
                throw Error(`Элемент типа '${ newNodeType }' невозможно разместить в '${ forParentNode.type }'`);
        }

        try {
            const [ currentNode ] = await this.insertNodes([ node ]);

            if (!!node.prevId) {
                const [ prevNode ] = await this.getNodeById(node.prevId);
                const [ nextNode ] = await this.getNodeById(prevNode.nextId);
                await this.updateNodeById(prevNode.id, { ...prevNode, nextId: currentNode.id });
                if (nextNode) await this.updateNodeById(nextNode.id, { ...nextNode, prevId: currentNode.id });
                return this.updateNodeById(currentNode.id, { ...currentNode, nextId: nextNode?.id || 0 });
            }

            if (!!node.nextId) {
                const [ nextNode ] = await this.getNodeById(node.nextId);
                const [ prevNode ] = await this.getNodeById(nextNode.prevId);

                await this.updateNodeById(nextNode.id, { ...nextNode, prevId: currentNode.id });
                if (prevNode) await this.updateNodeById(prevNode.id, { ...prevNode, nextId: currentNode.id });
                return this.updateNodeById(currentNode.id, { ...currentNode, prevId: prevNode?.id || 0 });
            }
        } catch (e) {
            throw Error(e);
        }
    }

    /**
     * Получение первого потомка
     * @param parentId - Идентификатор родительского элемента
     */
    public async getFirstChild(parentId: TNode['parentId']): Promise<TNode> {
        try {
            const [ child ] = await this.connection.select<TNode>({
                from: this.tableName,
                where: {
                    parentId: parentId,
                    prevId: 0
                }
            });
            return child;
        } catch (e) {
            throw Error(e);
        }
    }

    /**
     * Получение последнего потомка
     * @param parentId - Идентификатор родительского элемента
     */
    public async getLastChild(parentId: TNode['parentId']): Promise<TNode> {
        try {
            const [ child ] = await this.connection.select<TNode>({
                from: this.tableName,
                where: {
                    parentId: parentId,
                    nextId: 0
                }
            });
            return child;
        } catch (e) {
            throw Error(e);
        }
    }

    /**
     * Удаление элементов
     * @param ids - Массив идентификаторов элементов
     */
    public async removeNodes(ids: TNode['id'][]): Promise<number> {
        try {
            return this.connection.remove({
                from: this.tableName,
                where: {
                    id: {
                        in: ids
                    }
                }
            });
        } catch (e) {
            throw Error(e);
        }
    }

    /**
     * Обновление элемента
     * @param id - ID элемента
     * @param updateData - Данные для обновления
     */
    public async updateNodeById(id: TNode['id'], updateData: TNode): Promise<number> {
        try {
            return this.connection.update({
                in: this.tableName,
                set: updateData,
                where: {
                    id: id
                }
            });
        } catch (e) {
            throw Error(e);
        }
    }
}

const treeService = new TreeService();
export default treeService;
