import React from 'react'
import ReactDOM from 'react-dom'
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import PlannedScheduleManagement from './scenes/PlannedScheduleManagement'


const root = document.getElementById('root')

if (root) {
    ReactDOM.render(
        <PlannedScheduleManagement />,
        root
    )
}