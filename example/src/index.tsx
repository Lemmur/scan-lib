import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { initJsStore } from 'scan-lib';

import App from './App';

ReactDOM.render(<App/>, document.getElementById("root"));
initJsStore().then(() => console.log('Tree store initialized'));
