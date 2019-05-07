import React, {Component, ReactPropTypes} from 'react';
import './index.css';

import * as api from '../../common/api';
import {
    XYPlot,
    XAxis,
    YAxis,
    VerticalGridLines,
    HorizontalGridLines,
    VerticalBarSeries, makeWidthFlexible, HorizontalBarSeries, makeHeightFlexible, HorizontalRectSeries,
} from 'react-vis';
import {ChartMode} from "../../common/constants";
import {Button, ButtonGroup} from "reactstrap";

export default class Chart extends Component {
    constructor(props) {
        super(props)
        this.state = {
            initialized: false,
            histogramData: null,
            scheduleData: null,
            chartMode: ChartMode.CI
        }
    }

    componentDidMount() {
        api.getHistogramData()
            .then(res => res.json())
            .then(histogramData => {
                api.getScheduleChartData()
                    .then(res => res.json())
                    .then(scheduleData => {
                        this.setState({
                            initialized: true,
                            histogramData,
                            scheduleData
                        })
                    })
            })
    }

    onChartModeBtnClick(chartMode) {
        this.setState({chartMode})
    }

    renderScheduleHistogram() {
        const FlexibleWidthXYPlot = makeWidthFlexible(XYPlot);
        const {CI, CRI, SSI, SI} = this.state.scheduleData
        let data = null

        switch (this.state.chartMode) {
            case ChartMode.CI:
                data = CI
                break
            case ChartMode.CRI:
                data = CRI
                break
            case ChartMode.SI:
                data = SI
                break
            case ChartMode.SSI:
                data = SSI
                break
        }

        // x값 기준으로 정렬한다.
        data.sort((a,b) => (a.x > b.x) ? 1 : ((a.x < b.x) ? -1 : 0 ))

        return (
            <div className="schedule-chart-container">
                <h1 className="chart-title"></h1>
                <div className="chart-mode-btn-container">
                    <ButtonGroup size="lg">
                        <Button color="secondary"
                                size="lg"
                                onClick={(e) => this.onChartModeBtnClick(ChartMode.CI)}
                                active={this.state.chartMode === ChartMode.CI}>CI</Button>
                        <Button color="secondary"
                                size="lg"
                                onClick={(e) => this.onChartModeBtnClick(ChartMode.CRI)}
                                active={this.state.chartMode === ChartMode.CRI}>CRI</Button>
                        <Button color="secondary"
                                size="lg"
                                onClick={(e) => this.onChartModeBtnClick(ChartMode.SI)}
                                active={this.state.chartMode === ChartMode.SI}>SI</Button>
                        <Button color="secondary"
                                size="lg"
                                onClick={(e) => this.onChartModeBtnClick(ChartMode.SSI)}
                                active={this.state.chartMode === ChartMode.SSI}>SSI</Button>
                    </ButtonGroup>
                </div>
                <div className="schedule-chart">
                    <FlexibleWidthXYPlot
                        height={1000}
                        margin={{left: 300, right: 50}}
                        yType="ordinal"
                        color="grey"
                        className="chart-histogram">
                        <HorizontalGridLines/>
                        <VerticalGridLines/>
                        <HorizontalBarSeries data={data}/>
                        <YAxis/>
                        <XAxis  tickValues={[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]}/>
                    </FlexibleWidthXYPlot>
                </div>

            </div>
        )
    }

    renderDurationHistogram() {
        const FlexibleWidthXYPlot = makeWidthFlexible(XYPlot);
        const {durationMean, durationDevi, durationMax, durationMin, data} = this.state.histogramData
        return (
            <div className="histogram-container">
                <h4 className="histogram-title">Duration Histogram</h4>
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
                    height={300}
                    color="grey"
                    margin={{left: 50}}>
                    <VerticalGridLines/>
                    <HorizontalGridLines/>
                    <XAxis tickLabelAngle={-45}/>
                    <YAxis/>
                    <VerticalBarSeries data={data}/>
                </FlexibleWidthXYPlot>
            </div>
        )
    }

    render() {
        return (
            this.state.initialized &&
            <div className="container-fluid">
                <div className="row">
                    <div className="col-sm-12">
                        <table className="project-summary-table">
                            <thead>
                            <tr>
                                <th>Project Name</th>
                                <th>Simulation</th>
                                <th>Work</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td><b>Temp Project</b></td>
                                <td>TODO</td>
                                <td>TODO</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-4">
                        {this.renderDurationHistogram()}
                    </div>
                    <div className="col-sm-8">
                        {this.renderScheduleHistogram()}
                    </div>
                </div>
            </div>
        )
    }
}