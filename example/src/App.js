import React from 'react'

import { useMyHook } from 'scan-lib'

const App = () => {
  const example = useMyHook()
  return (
    <div>
      {example}
    </div>
  )
}
export default App
