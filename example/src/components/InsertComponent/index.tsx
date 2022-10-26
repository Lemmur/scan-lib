import * as React from 'react';
import { useScanTree, NODE_TYPES } from "scan-lib";
import { useState } from "react";

const InsertComponent = ({ onOpenSecondTree }) => {
    const { insertNode, getLastChild, getFirstChild, sortTree, getNodeById } = useScanTree(1);
    const [ insertId, setInsertId ] = useState(null);

    const addPage = async () => {
        const firstChild = await getFirstChild(insertId || 0);
        return insertNode({
            parentId: insertId || 0,
            type: NODE_TYPES.PAGE,
            content: null,
            externalId: 123,
            // prevId: lastChild ? lastChild.id : 0,
            // nextId: 0
            prevId: 0,
            nextId: firstChild ? firstChild.id : 0
        });
    };

    return <div
        style={ {
            display: "flex",
            flexDirection: "column"
        } }
    >
        <div>
            <button
                onClick={ () => onOpenSecondTree() }
            >
                Open Second Tree
            </button>
        </div>

        <div>
            <p>Insert</p>
            <input type={ 'text' } onChange={ (e) => setInsertId(+e.target.value) }/>
            <button onClick={ async () => {
                await addPage();
            } }>Insert Page
            </button>
            <button onClick={ async () => {
                const lastChild = await getLastChild(insertId || 0);
                const firstChild = await getFirstChild(insertId || 0);
                await insertNode({
                    parentId: insertId || 0,
                    type: NODE_TYPES.DOCUMENT,
                    content: null,
                    externalId: 123,
                    // prevId: lastChild ? lastChild.id : 0,
                    // nextId: 0
                    prevId: 0,
                    nextId: firstChild ? firstChild.id : 0
                });
            } }>Insert Doc
            </button>
            <button onClick={ async () => {
                const lastChild = await getLastChild(insertId || 0);
                const firstChild = await getFirstChild(insertId || 0);
                await insertNode({
                    parentId: insertId || 0,
                    type: NODE_TYPES.TASK,
                    content: null,
                    externalId: 123,
                    // prevId: lastChild ? lastChild.id : 0,
                    // nextId: 0
                    prevId: 0,
                    nextId: firstChild ? firstChild.id : 0
                });
            } }>Insert Task
            </button>
        </div>
        <div>
            <p>Sort Tree</p>
            <button onClick={ () => {
                getNodeById(1).then((rootNode) => {
                    console.time('sort_timer');
                    sortTree(rootNode).then(() => {
                        console.timeEnd('sort_timer');
                    });
                });
            } }>Reorder
            </button>
        </div>
    </div>;
};

export default InsertComponent;
