import React from 'react'
import ReactDOM from 'react-dom'
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import ConstructionManagement from './scenes/ConstructionManagement'


const root = document.getElementById('root')

if (root) {
    ReactDOM.render(
        <ConstructionManagement />,
        root
    )
}