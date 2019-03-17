import React, { Component, ReactPropTypes } from 'react'
import * as api from '../../common/api'

export default class ConstructionManagement extends Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        Promise.all([api.getActivities(), api.getWorkPackages(), api.getDurationInfos(), api.getProductivityInfos()]).then(
            value => {
                console.log(value)
            }
        )
    }
    render() {
        return(
            <div>test!</div>
        )
    }
}