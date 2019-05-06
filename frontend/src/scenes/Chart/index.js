import React, {Component, ReactPropTypes} from 'react';
import './index.css';

import * as api from '../../common/api';
import {
    XYPlot,
    XAxis,
    YAxis,
    VerticalGridLines,
    HorizontalGridLines,
    VerticalBarSeries, makeWidthFlexible,
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

    renderHistogram() {
        const FlexibleWidthXYPlot = makeWidthFlexible(XYPlot);
        const {durationMean, durationDevi, durationMax, durationMin, data} = this.state.histogramData
        return (
            <div className="histogram-container">
                <h1 className="histogram-title">Duration Histogram</h1>
                <table className="histogram-summary-table">
                    <thead>
                    <tr>
                        <th>Duration Mean</th>
                        <th>Duration Deviation</th>
                        <th>Duration Max</th>
                        <th>Duration Min</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>{durationMean}</td>
                        <td>{durationDevi}</td>
                        <td>{durationMax}</td>
                        <td>{durationMin}</td>
                    </tr>
                    </tbody>
                </table>
                <FlexibleWidthXYPlot
                    className="chart-histogram"
                    xType="ordinal"
                    // width={1000}
                    height={300}
                    // xDistance={150}
                    margin={{left: 50}}
                >
                    <VerticalGridLines/>
                    <HorizontalGridLines/>
                    <XAxis/>
                    <YAxis/>
                    <VerticalBarSeries data={data}/>
                </FlexibleWidthXYPlot>
            </div>
        )
    }

    render() {
        return (
            this.state.initialized &&
            this.renderHistogram()
        )
    }
}