import React, {Component} from 'react'
import './index.css';
import {Button, FormGroup, Label, Input, Col} from 'reactstrap'
import * as api from '../../common/api';

import {ModalType} from "../../common/constants";
import NavBar from '../../components/NavBar'
import Table from "../../components/Table";
import CustomModal from "../../components/CustomModal";

import {textFilter} from "react-bootstrap-table2-filter";
import {convertData4BootstrapTable, pop} from "../../common/utils";

export default class PlannedScheduleManagement extends Component {
    constructor(props) {
        super(props)
        this.state = {
            initialized: false,
            showResources: false,
            showModal: false,

            resources: [],
            plannedSchedules: [],
            dataInfos: [],
            allocations: [],
            mode: null,

            selected: {
                selectedSchedules: [],
                selectedDatas: []
            },

            plannedActivityFile: null,
            activityResourceFile: null,
        }

        this.toggleModal = this.toggleModal.bind(this)
    }

    componentDidMount() {
        Promise.all([
                api.getResources(),
                api.getPlannedSchedules(),
                api.getDurationInfos(),
                api.getProductivityInfos(),
                api.getAllocations()
            ]
        ).then(responses => Promise.all(responses.map(r => r.json()))
        ).then(res => {
            this.setState({
                initialized: true,
                resources: res[0],
                // resource는 convert4Bootstrap에서 없어진다.
                // resource 어트리뷰트의 이름을 resourceId로 바꿔준다.
                plannedSchedules: res[1].map(ps => ({
                    ...ps,
                    resourceId: ps.resource
                })).map(({resource, ...attrs}) => attrs),
                dataInfos: [...res[2], ...res[3]],
                allocations: res[4]
            })
        })
    }

    // 모달을 열고 타입을 넣어준다
    showModal(modalType) {
        this.setState({
            showModal: true,
        })
    }

    // 모달을 열고 닫는다
    toggleModal() {
        this.setState(prevState => ({
                showModal: !prevState.showModal
            })
        )
    }

    toggleResources() {
        this.setState(prevState => ({
                showResources: !prevState.showResources
            })
        )
    }

    onScheduleRowSelect(row, isSelected, rowIndex, e) {
        isSelected ?
            this.setState({
                selected: {
                    ...this.state.selected,
                    selectedSchedules: [...this.state.selected.selectedSchedules, row['activity_id']]
                }
            })
            :
            this.setState({
                selected: {
                    ...this.state.selected,
                    selectedSchedules: this.state.selected.selectedSchedules.filter(s => s !== row['activity_id'])
                }
            })
    }

    onDataRowSelect(row, isSelected, rowIndex, e) {
        isSelected ?
            this.setState({
                selected: {
                    ...this.state.selected,
                    selectedDatas: [...this.state.selected.selectedDatas, row['data_id']]
                }
            })
            :
            this.setState({
                selected: {
                    ...this.state.selected,
                    selectedDatas: this.state.selected.selectedDatas.filter(d => d !== row['data_id'])
                }
            })
    }

    // File input에 변화가 있으면 state를 바꿔준다
    onFileInputChange(e) {
        this.setState({[e.target.name]: e.target.files[0]})
    }

    // Input에 변화가 있으면 state를 바꿔준다.
    onInputChange(e) {
        this.setState({[e.target.name]: e.target.value})
    }

    // state정보를 이용하여 PlannedSchedule을 생성한다.
    onFileSubmit(event) {
        let {plannedActivityFile, activityResourceFile} = this.state
        if (!(plannedActivityFile && activityResourceFile)) {
            alert('파일이 2개 모두 존재해야 합니다.')
            return
        }

        api.importPlannedScheduleCSV(plannedActivityFile, activityResourceFile)
            .then(res => res.json())
            .then(plannedSchedules => {
                Object.keys(plannedSchedules).map((key, index) => {
                    plannedSchedules[key] = JSON.parse(plannedSchedules[key])
                })
                let success = pop(plannedSchedules, 'success')

                // 에러 상황을 한번 보여준다.
                alert('결과를 확인해주세요. \n' + JSON.stringify(plannedSchedules))

                this.setState(prevState => ({
                        plannedSchedules: [...prevState.plannedSchedules, ...success],
                    })
                )
            })
    }

    // Link버튼을 눌렀으면 alert창을 띄워주고 createData를 형성하여 api에 던져준다
    createAllocation(e) {
        let {selectedSchedules, selectedDatas} = this.state.selected

        // data 개수에 대한 예외처리
        if (selectedDatas.length !== 1) {
            alert('반드시 1개의 data만 선택되어야 합니다.')
            return
        }
        // as built 개수에 대한 예외처리
        if (selectedSchedules.length === 0) {
            alert('적어도 1개의 as built schedule이 선택되어야 합니다.')
            return
        }

        if (!this.state.mode) {
            alert('mode를 입력하십시오.')
            return
        }

        // TODO: isProductivity를 던질필요가 없다.
        api.createAllocations(selectedSchedules, selectedDatas[0], null, this.state.mode)
            .then(res => res.json())
            .then(allocations => {
                api.getPlannedSchedules()
                    .then(res => res.json())
                    .then(plannedSchedules => {
                        // 초기화를 위한 object
                        let selected = {
                            selectedSchedules: [],
                            selectedDatas: []
                        }
                        // Allocation을 생성한 후 update된 plannedActivity를 불러와서 뿌려준다
                        this.setState(prevState => ({
                            selected,
                            plannedSchedules,
                            allocations: [...prevState.allocations, ...allocations]
                        }))
                    })
            })
            .catch(e => alert(e))

    }

    confirmAllocation(e) {
        if (!confirm('정말 배정을 확정하시겠습니까?')) return
        // TODO
    }


    renderResources() {
        return (
            <div className="row">
                <div id="resource-container" className="col-sm-8 text-center">
                    <Button outline block
                            color="primary"
                            onClick={() => this.showModal()}>Import resources</Button>
                    {/* Resource List */}
                    <Table selectable={false}
                           data={convertData4BootstrapTable(this.state.resources)}/>
                </div>
                <div id="csv-import-container" className="col-sm-4 text-center">
                    <FormGroup row>
                        <Label for="schedule-input" sm={2}>Planned Schedules</Label>
                        <Col sm={10}>
                            <Input id="schedule-input"
                                   type="file"
                                   name="plannedActivityFile"
                                   onChange={(e) => this.onFileInputChange(e)}
                            />
                        </Col>
                        <Label for="resource-input" sm={2}>Activity-resource</Label>
                        <Col sm={10}>
                            <Input id="resource-input"
                                   type="file"
                                   name="activityResourceFile"
                                   onChange={(e) => this.onFileInputChange(e)}
                            />
                        </Col>
                        <Button className="btn-block" onClick={(e) => this.onFileSubmit(e)}>Submit</Button>
                    </FormGroup>
                </div>
            </div>
        )
    }

    render() {
        let {selectedSchedules, selectedDatas} = this.state.selected
        return (
            <div className="container-fluid">
                <NavBar/>
                <div className="row">
                    <div className="col-sm-12">
                        <Button outline
                                id="toggle-resource-btn"
                                className="btn-block"
                                color="secondary"
                                onClick={() => this.toggleResources()}>Toggle Resources and File Inputs</Button>
                    </div>
                </div>
                {this.state.showResources && this.renderResources()}
                <div id="link-status-container" className="row text-center">
                    <div id="link-planned-schedules-container" className="col-sm-4">
                        <h3>Selected As-built schedules</h3>
                        {selectedSchedules.map((schedule, i) => {
                            return (<b key={i}>{schedule}, </b>)
                        })}
                    </div>
                    <div id="mode-container" className="col-sm-4">
                        <h3>Mode</h3>
                        <Input id="mode-input"
                               type="number"
                               name="mode"
                               placeholder="Input Mode here"
                               onChange={(e) => this.onInputChange(e)}
                        />

                    </div>
                    <div id="link-data-container" className="col-sm-4">
                        <h3>Selected Data</h3>
                        {selectedDatas.map((data, i) => {
                            return (<h4 key={i}>{data} </h4>)
                        })}
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12">
                        <Button id="link-activity-btn"
                                color="primary"
                                className="btn-block"
                                onClick={(e) => this.createAllocation(e)}>Link Activity</Button>
                    </div>
                </div>

                <div className="row text-center">
                    <div className="col-sm-6">
                        <span className="table-title">Planned Schedules</span>
                        <Table selectable={true}
                               filter={textFilter({placeholder: ' '})}
                               selected={selectedSchedules}
                               rowSelectHandler={(row, isSelected, rowIndex, e) => this.onScheduleRowSelect(row, isSelected, rowIndex, e)}
                               data={convertData4BootstrapTable(this.state.plannedSchedules)}
                        />
                    </div>
                    <div className="col-sm-6">
                        <div className="data-information-table-container">
                            <span className="table-title">Data Information</span>
                            <Table selectable={true}
                                   filter={textFilter({placeholder: ' '})}
                                   selected={selectedDatas}
                                   rowSelectHandler={(row, isSelected, rowIndex, e) => this.onDataRowSelect(row, isSelected, rowIndex, e)}
                                   data={convertData4BootstrapTable(this.state.dataInfos)}
                            />
                        </div>

                        {/* Confirm Btn */}
                        <Button id="confirm-allocation-btn"
                                color="danger"
                                className="btn-block"
                                onClick={(e) => this.confirmAllocation(e)}>Confirm Allocation</Button>

                        <div className="data-information-table-container">
                            <span className="table-title">Allocations</span>
                            <Table selectable={false}
                                   filter={textFilter({placeholder: ' '})}
                                   selected={this.state.allocations}
                                   data={convertData4BootstrapTable(this.state.allocations)}
                            />
                        </div>
                    </div>
                </div>
                {/* Modals */}
                <CustomModal modalType={ModalType.RESOURCE}
                             showModal={this.state.showModal}
                             modalTitle="Import Resources"
                             setStateHandler={res => this.setResourceData(res)}
                             toggleModalHandler={this.toggleModal}
                />
            </div>
        );
    }
}