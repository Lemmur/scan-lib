# scan-lib

> Scanning Library

[![NPM](https://img.shields.io/npm/v/scan-lib.svg)](https://www.npmjs.com/package/scan-lib) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save scan-lib
```

## Usage

```tsx
import * as React from 'react'

import { useMyHook } from 'scan-lib'

const Example = () => {
  const { tree, treeLoading, setSelected, selected, setExpanded, expanded, setChecked, checked, getOrderedChildrenById, moveNodes } = useScanTree(ROOT);
  
  return !treeLoading ? (
    <div>
      { JSON.stringify(tree) }
    </div>
  ) : (<>Loading...</>);
}
```

## License

MIT © [Lemmur](https://github.com/Lemmur)

