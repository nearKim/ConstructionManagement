import React from 'react'
import ReactDOM from 'react-dom'
import ConstructionManagement from './scenes/ConstructionManagement'


const root = document.getElementById('root')

if (root) {
    ReactDOM.render(
        <ConstructionManagement />,
        root
    )
}