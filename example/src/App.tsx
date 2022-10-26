import * as React from 'react';
import InsertComponent from 'components/InsertComponent';
import TreeComponent from "components/Tree";

import "rc-tree/assets/index.css";
import { useState } from "react";
import TreeNewComponent from "components/TreeNew";

const App = () => {
    const [ opened, setOpened ] = useState(false);

    return (
        <div style={ {
            display: "flex"
        } }>
            <InsertComponent onOpenSecondTree={ () => setOpened(!opened) }/>
            <TreeComponent/>
            { opened && <TreeNewComponent/> }
        </div>
    );
};

export default App;
