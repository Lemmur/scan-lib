import * as React from 'react';
import { useScanTree, NODE_TYPES, TNode } from './../../lib';
import Tree, { TreeNode } from "rc-tree/lib";
import { useEffect, useState } from "react";

const ROOT = 1;

const TreeComponent = () => {
    const { tree, treeLoading, setSelected, selected, setExpanded, expanded, setChecked, checked, getOrderedChildrenById, moveNodes } = useScanTree(ROOT);
    const [ ctrlPressed, setCtrlPressed ] = useState<boolean>(false);
    const [ shiftPressed, setShiftPressed ] = useState<boolean>(false);

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.ctrlKey || e.metaKey) setCtrlPressed(true);
        if (e.shiftKey) setShiftPressed(true);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
        if (!e.ctrlKey && !e.metaKey) setCtrlPressed(false);
        if (!e.shiftKey) setShiftPressed(false);
    };

    useEffect(() => {
        setExpanded([ ROOT ]);

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
        }
    }, []);

    const onDrop = (info) => {
        const { dropToGap, node, dragNode } = info;

        let parentId, prevId, nextId;
        let dragNodeIds = [ dragNode.id ];

        if (selected.includes(dragNode.id)) {
            dragNodeIds = selected;
        }

        if (dropToGap) {
            parentId = node.parentId;
            prevId = node.id;
            nextId = node.nextId;
        } else {
            parentId = node.id;
            prevId = 0;
            nextId = node.children?.length ? node.children[0].id : 0;
        }

        moveNodes(dragNodeIds, parentId, prevId, nextId);
    };

    const onSelect = async (selectedKeysStrings, info) => {
        const { selectedNodes } = info;
        const selectedKeys = selectedKeysStrings.map(key => +key);
        const parentChanged = selectedNodes.slice(-1)[0].parentId !== selectedNodes.slice(-2)[0].parentId;

        const difference = (setA: Set<number>, setB: Set<number>): Set<number> => {
            const _difference = new Set(setA);
            for (const elem of setB) {
                _difference.delete(elem);
            }
            return _difference;
        };

        if (ctrlPressed) {
            if (!parentChanged) {
                setSelected([ ...selectedKeys ]);
            } else {
                setSelected(selectedKeys.slice(-1));
            }
        } else if (shiftPressed) {
            if (!parentChanged) {
                const firstNode = selected.length > 2 ? selectedNodes[0] : selectedNodes.slice(-2)[0];
                const lastNode = selectedNodes.slice(-1)[0];

                const children = await getOrderedChildrenById(firstNode.parentId);
                const firstIndex = children.findIndex(node => node.id === firstNode.id);
                const lastIndex = children.findIndex(node => node.id === lastNode.id);

                const result = children.slice(Math.min(firstIndex, lastIndex), Math.max(firstIndex, lastIndex) + 1);
                setSelected(result.map(node => node.id));
            } else {
                setSelected(selectedKeys.slice(-1));
            }

        } else {
            const selectedSet = new Set<number>(selected);
            const selectedKeysSet = new Set<number>(selectedKeys);

            const diffA = Array.from(difference(selectedSet, selectedKeysSet));
            const diffB = Array.from(difference(selectedKeysSet, selectedSet));

            setSelected(diffA.length ? diffA : diffB);

        }
    };

    const onExpand = (keys) => {
        setExpanded(keys.map(key => +key));
    };

    const onCheck = (checkedKeys) => {
        setChecked(checkedKeys.map(key => +key));
    };

    const getName = (node: TNode, orderNumber: number): string => {
        if (node.name) return node.name;
        switch (node.type) {
            case NODE_TYPES.TASK:
                return `Задача ${ orderNumber }`;
            case NODE_TYPES.DOCUMENT:
                return `Документ ${ orderNumber }`;
            case NODE_TYPES.PAGE:
                return `Страница ${ orderNumber }`;
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case NODE_TYPES.PAGE:
                return (<img width={ 18 }
                             src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAAhElEQVRIie2VQQrAIAwEt6WP81k99p36EHtRaCXGNUUQ6ULwYJJJDBhgRTkAAUBs2GkFeCL5J0gOZnwigGs0oBtiAXRBrAARslWCa3elj6RX3KGVySbRoLsRQGs4gHmi1sC1Wc3RgVphS1N08M9grCRASCe7dJ6fYwAhh76tls2n2MV0A8dkUinXJSVtAAAAAElFTkSuQmCC"/>);
            case NODE_TYPES.DOCUMENT:
                return (<img width={ 18 }
                             src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABmJLR0QA/wD/AP+gvaeTAAACZklEQVRoge3Zz29MURQH8E8bWsKfgJWtRGvBH2BBEBv+AQthIUIido0uWEgjQWIhKbFqhW1tqIXa2xJNWbIwREi0Wizem8zt5M3rvN9JzTc5yX3vzH3n+5177rln3jDAAAP0g+2YxCJW8TejLeM2husmTkT+dQayaTatARGTJRBvVMRiEPwKtmac37iIMOdHcsxvfCXCoEXnTydcVy6iTAFDuNd174GKRZQpgAZElC2AmkVUIYAaRVQlgJpEFBWwURkeVnF1KiogPAivakBEUQHXup6Rxe4UId5GUQFFmsHlIsTbKCoAtmEC72Vvx1Mx1Efw7vpdB/qO2cgPjDKRJmAPXnbdy7sZs1qI+ZhLZszXSHgje9GLZFp+LcvX/1eBFYwmOdIENLF5M3PIu4mP45eoJL7Dxa4Ao7iFr2jF43A1d+IRfuIDzuXkkYq0Wpx0ut4M/I8T/LOB/1mC/2RGDqUIuI5TotVYwz4ciH0tjMXWiu+N4VA8/oS9OItvOJJHwJbMstbjN57iKM7gsM7xP4M38XgW52Py7bR9Imr0FnE/L4EqDrK05S7SjmRGPyl0A6dFKfRHlELjOik0Hls7hfbjYDz+rJNC3+VMoaICQrsb+GcT/DOBfy7Bf6JOAcd0yuhbXLC+jI5gCl9im7K+jO7AQ/zAkmgVsnLAJjjI0qrQis63VuvmS8BKL0daFVqogEhevMozabeoC2y6E32OXb1I/he/yNaCcR3tdRhjreenYvQj4GMwvqRaESO4HFwvlfHQIu91itpEGQLK/JMviy2IXseUgiLvdbLYahxjokzyAwywmfEPQk0OV+vM1m4AAAAASUVORK5CYII="/>);
            case NODE_TYPES.TASK:
                return (<img width={ 18 }
                             src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABmJLR0QA/wD/AP+gvaeTAAABU0lEQVRoge2ZwWrCQBCGPwuG9nFbaI+ih/ZQ0IOvVJ+iSukz1EIUUuLBXVi2u3VTZpNuMx8Mxs3wz4zR/+CAoigp3AALYAc0QJspGlNjbmqKNb/J2HQsNsC1xACLAZq3MZMYYOcI3gNTCdEIU+DBqfcqIep+5ysJwQtUTr3mUvIkQbDtmC9Bcs2rzI1kZ9QDPAE1352jBh693KU5fw5ofAbyRXGbs0yAPXH723saR3N+9M6txkdCzSC/fQItsAYOgXsHc8+l8l4ta85PwM9Ppi8X6qqhLlQMox6gi43+pFGEjcZssRgbjaE2Ouof8Z9g1AOojaI2qjY6PDrA0KiNRsK3UTto7Z0XY6Mrzp/0yjsvxka7ojZaDCkDfDnXff29HqodJGWAd+f6lrxDVMCd8/5NQnROv2slN0RWTEMt+V4QWvJhhGbAlvxr1q2pJda8ovxnTgNQXCLBKAkMAAAAAElFTkSuQmCC"/>);
        }
    };

    const renderTreeNodes = (treeNode: TNode = tree, pNumber = 1) => {
        let tNum = 0;
        let dNum = 0;
        let pNum = 0;
        return <TreeNode
            title={ getName(treeNode, pNumber) + ` (id:${ treeNode.id }/${ treeNode.type })` }
            key={ treeNode.id }
            { ...treeNode as object}
            icon={ getIcon(treeNode.type) }
        >
            { treeNode.children?.map((child, index) => {
                if (child.type === NODE_TYPES.TASK) {
                    tNum++;
                    return renderTreeNodes(child, tNum);
                }

                if (child.type === NODE_TYPES.DOCUMENT) {
                    dNum++;
                    return renderTreeNodes(child, dNum);
                }

                if (child.type === NODE_TYPES.PAGE) {
                    pNum++;
                    return renderTreeNodes(child, pNum);
                }

            }) }
        </TreeNode>;
    };

    return <>
        { !treeLoading && !!tree ? <Tree
            style={{width: 768}}
                defaultExpandAll={ false }
                expandedKeys={ expanded.map(id => id.toString()) }
                checkedKeys={ checked.map(id => id.toString()) }
                multiple={ true }
                draggable
                selectable
                checkable
                onDrop={ onDrop }
                onSelect={ onSelect }
                onCheck={ onCheck }
                onExpand={ onExpand }
                selectedKeys={ selected.map(id => id.toString()) }
                showLine={ true }
                height={800}
                itemHeight={16}
                virtual={true}
            >
                { renderTreeNodes() }
            </Tree> :
            <p>Loading...</p>
        }
    </>;
}


export default TreeComponent;
