// This file is required in order for ModuleFederationPlugin
// to work properly when app is run under standalone mode.

import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'

ReactDOM.render(<App />, document.getElementById('react-root'))
