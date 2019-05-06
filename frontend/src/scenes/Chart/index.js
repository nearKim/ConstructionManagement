import React, {Component, ReactPropTypes} from 'react';

import * as api from '../../common/api';
import {
    XYPlot,
    XAxis,
    YAxis,
    VerticalGridLines,
    HorizontalGridLines,
    VerticalBarSeries,
} from 'react-vis';

export default class Chart extends Component {
    constructor(props) {
        super(props)
        this.state = {
            initialized: false,
            histogramData: null,

        }
    }

    componentDidMount() {
        api.getHistogramData()
            .then(res => res.json())
            .then(histogramData => {
                this.setState({
                    initialized: true,
                    histogramData
                })
            })
    }

    render() {
        return (
            this.state.initialized &&
            <XYPlot xType="ordinal" width={300} height={300} xDistance={100}>
                <VerticalGridLines/>
                <HorizontalGridLines/>
                <XAxis/>
                <YAxis/>
                <VerticalBarSeries data={this.state.histogramData.data}/>
            </XYPlot>
        )
    }
}