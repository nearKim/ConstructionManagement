import React, {Component, ReactPropTypes} from 'react';
import './index.css';
import {Button, ButtonGroup, Col, Form, FormGroup, Input} from 'reactstrap';
import filterFactory, {textFilter} from 'react-bootstrap-table2-filter';
import * as api from '../../common/api';
import Table from "../../components/Table";
import NavBar from "../../components/NavBar";
import CustomModal from "../../components/CustomModal";
import {InformationType, ModalType} from "../../common/constants";
import {convertData4BootstrapTable, pop} from "../../common/utils";
import Label from "reactstrap/es/Label";
import InputGroup from "reactstrap/es/InputGroup";

export default class ConstructionManagement extends Component {
    constructor(props) {
        super(props)
        this.state = {
            initialized: false,
            showProjects: false,
            showResources: false,
            showModal: false,
            modalType: '',
            projects: [],
            activities: [],
            paginationData: {
                total: null,
                page: null,
            },
            resources: [],
            workPackages: [],
            durationInfos: [],
            productivityInfos: [],
            selected: {
                selectedActivities: [],
                selectedDurationInfos: [],
                selectedProductivityInfos: [],
            },
            showDanglingActivities: false,

            dataName: '',
            dataDesc: '',
        }

        this.toggleModal = this.toggleModal.bind(this)
    }

    componentDidMount() {
        // 모든 데이터를 초기화한다
        Promise.all(
            [
                api.getActivities(),
                api.getWorkPackages(),
                api.getDurationInfos(),
                api.getProductivityInfos()
            ]
        ).then(responses => Promise.all(responses.map(r => r.json()))
        ).then(res => {
                this.setState({
                    initialized: true,
                    activities: res[0].results,
                    paginationData: {total: res[0].count, page: 1},
                    workPackages: res[1],
                    durationInfos: res[2],
                    productivityInfos: res[3]
                })
            }
        )
    }

    onInputChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    onCheckBoxClick() {
        this.setState(prevState => ({showDanglingActivities: !prevState.showDanglingActivities}))
    }

    /* Modal Methods */

    // 모달을 열고 타입을 넣어준다
    showModal(modalType) {
        this.setState({
            showModal: true,
            modalType: modalType
        })
    }

    // 모달을 열고 닫는다
    toggleModal() {
        this.setState(prevState => ({
                showModal: !prevState.showModal
            })
        )
    }


    // Activity가 생성된 경우 결과를 보여주고 새로고침한다.
    // FIXME: csv_import가 던지는 attribute와 get activity가 던지는 attribute가 다르다.
    setActivityData(activities) {
        Object.keys(activities).map((key, index) => {
            activities[key] = JSON.parse(activities[key])
        })
        let success = pop(activities, 'success')

        // 에러 상황을 한번 보여준다.
        alert('결과를 확인해주세요. \n' + JSON.stringify(activities))
        location.reload()
    }

    // Resource가 생성된 경우 데이터를 state에 넣어주고 모달을 닫는다
    setResourceData(resources) {
        Object.keys(resources).map((key, index) => {
            resources[key] = JSON.parse(resources[key])
        })
        let success = pop(resources, 'success')

        // 에러 상황을 한번 보여준다.
        alert('결과를 확인해주세요. \n' + JSON.stringify(resources))

        this.setState(prevState => ({
                resources: [...prevState.resources, ...success],
                showModal: false
            })
        )
    }

    /* Table Methods */

    // Activity 테이블의 페이지가 바뀌면 새로 데이터를 받아온다
    onActivityPageChange(page) {
        this.setState({initialize: false})
        api.getActivities(page)
            .then(res => res.json())
            .then(activities => {
                this.setState(prevState => ({
                    initialized: true,
                    paginationData: {
                        ...prevState.paginationData,
                        page
                    },
                    activities: activities.results
                }))
            })
    }


    // 선택된 activity row정보를 state에 저장한다
    onActivityRowSelect(row, isSelected, rowIndex, e) {
        // 만일 현재 row가 state에 존재하면 지워주고 아니면 넣어준다
        isSelected ?
            this.setState({
                selected: {
                    ...this.state.selected,
                    selectedActivities: [...this.state.selected.selectedActivities, row['activity_id']]
                }
            })
            :
            this.setState({
                selected: {
                    ...this.state.selected,
                    selectedActivities: this.state.selected.selectedActivities.filter(a => a !== row['activity_id'])
                }
            })
    }

    // 선택된 Information row 정보를 state에 저장한다
    onDurationInformationRowSelect(row, isSelected, rowIndex, e) {
        // 만일 현재 row가 state에 존재하면 지워주고 아니면 넣어준다
        isSelected ?
            this.setState({
                selected: {
                    ...this.state.selected,
                    selectedDurationInfos: [...this.state.selected.selectedDurationInfos, row['data_id']]
                }
            })
            :
            this.setState({
                selected: {
                    ...this.state.selected,
                    selectedDurationInfos: this.state.selected.selectedDurationInfos.filter(i => i !== row['data_id'])
                }
            })
    }

    onProductivityInformationRowSelect(row, isSelected, rowIndex, e) {
        // 만일 현재 row가 state에 존재하면 지워주고 아니면 넣어준다
        isSelected ?
            this.setState({
                selected: {
                    ...this.state.selected,
                    selectedProductivityInfos: [...this.state.selected.selectedProductivityInfos, row['data_id']]
                }
            })
            :
            this.setState({
                selected: {
                    ...this.state.selected,
                    selectedProductivityInfos: this.state.selected.selectedProductivityInfos.filter(i => i !== row['data_id'])
                }
            })
    }

    // 1개의 선택된 activity를 사용하여 Duration 혹은 Productivity Information을 생성한다
    createInfo(type) {
        const {activities, selected, dataName, dataDesc} = this.state
        // 단일 information 생성인 경우 activity는 무조건 1개다
        if (this.state.selected.selectedActivities.length !== 1) {
            alert('Activity는 반드시 1개가 선택되어야 합니다.')
            return
        }
        // 현재 선택된 Activity를 불러온다
        let activity = activities.find(a => a['activity_id'] === selected.selectedActivities[0])

        if (activity.data) {
            alert('선택한 Activity로 만들어진 Information이 존재합니다. 다른 Activity를 선택하세요')
            return
        }

        if (!dataName) {
            alert('Data Name을 작성해주세요')
            return
        }

        api.makeActivityData(activity['activity_id'], undefined, type, false, dataName, dataDesc)
            .then(res => {
                // 잘 생성된 경우 activity selection을 초기화하고 durationInfo를 업데이트 한다.
                if (res.status === 200) {
                    return res.json()
                } else {
                    // 뭔가 문제가 있으면 그냥 결과를 보여주고 refresh 한다
                    alert(res.status)
                    // location.reload()
                }
            })
            .then(res => {
                api.getActivities()
                    .then(res => res.json())
                    .then(activities => this.setState(prevState => ({
                            selected: {
                                ...this.state.selected,
                                selectedActivities: []
                            },
                            activities: activities.results,
                            durationInfos: type === InformationType.DURATION ? [...prevState.durationInfos, res] : prevState.durationInfos,
                            productivityInfos: type === InformationType.PRODUCTIVITY ? [...prevState.productivityInfos, res] : prevState.productivityInfos,
                            dataName: '',
                            dataDesc: ''
                        }))
                    )
            })
    }

    // 1개 이상의 activity를 기존의 information과 링크시킨다
    // TODO: Link하려는 Work package들이 다르면 에러를 발생시킨다
    linkInfo() {
        let {selectedActivities, selectedDurationInfos, selectedProductivityInfos} = this.state.selected
        let {productivityInfos, durationInfos, dataName, dataDesc} = this.state
        // 갯수 예외처리
        if (selectedDurationInfos.length !== 1 && selectedProductivityInfos.length !== 1) {
            alert('Information은 반드시 1개가 선택되어야 합니다.')
            return
        }
        if (selectedActivities.length === 0) {
            alert('적어도 1개의 Activity를 지정하세요.')
            return
        }

        let dataId = selectedDurationInfos[0] || selectedProductivityInfos[0]
        let dataInfo = productivityInfos.concat(durationInfos).find(i => i['data_id'] == dataId)
        let activityIds = selectedActivities

        // link 시키고 activity는 빼주고 info는 업데이트 해준다
        dataInfo.use_duration ?
            api.linkActivitiesWithDuration(dataId, activityIds, dataName, dataDesc)
                .then(res => {
                    if (res.status === 200) {
                        return res.json()
                    } else {
                        alert(res.status)
                        // location.reload()
                    }
                })
                .then(res => Promise.all([api.getDurationInfos(), api.getActivities()])
                    .then(res => Promise.all(res.map(r => r.json())))
                    .then(responses => {
                        this.setState(prevState => ({
                            selected: {
                                selectedActivities: [],
                                selectedProductivityInfos: [],
                                selectedDurationInfos: []
                            },
                            durationInfos: responses[0],
                            activities: responses[1].results,
                            dataName: '',
                            dataDesc: ''
                        }))
                    })
                )
            :
            api.linkActivitiesWithProductivity(dataId, activityIds, dataName, dataDesc)
                .then(res => {
                    if (res.status === 200) {
                        return res.json()
                    } else {
                        alert(res.status)
                        // location.reload()
                    }
                })
                .then(res => Promise.all([api.getProductivityInfos(), api.getActivities()])
                    .then(res => Promise.all(res.map(r => r.json())))
                    .then(responses => {
                        this.setState(prevState => ({
                            selected: {
                                selectedActivities: [],
                                selectedProductivityInfos: [],
                                selectedDurationInfos: []
                            },
                            productivityInfos: responses[0],
                            activities: responses[1].results,
                            dataName: '',
                            dataDesc: ''
                        }))
                    })
                )
    }

    renderMainBtnContainer() {
        return (
            <div className="row ">
                <div className="col-sm-8 text-center">
                    <ButtonGroup size="lg">
                        <Button outline
                                color="success"
                                onClick={() => this.linkInfo()}>Link activity
                        </Button>
                        <Button outline
                                color="primary"
                                onClick={() => this.createInfo(InformationType.DURATION)}>Use duration
                        </Button>
                        <Button outline
                                color="primary"
                                onClick={() => this.createInfo(InformationType.PRODUCTIVITY)}>Use productivity
                        </Button>
                    </ButtonGroup>
                </div>
                <div className="col-sm-4 text-center">
                    <Label for="dataName">Data Name: </Label>
                    <Input id="dataName"
                           name="dataName"
                           value={this.state.dataName}
                           onChange={e => this.onInputChange(e)}/>
                    <Label for="dataDesc">Data Description: </Label>
                    <Input id="dataDesc"
                           name="dataDesc"
                           value={this.state.dataDesc}
                           onChange={e => this.onInputChange(e)}/>
                </div>
            </div>
        )
    }

    render() {
        let modalTitle
        switch (this.state.modalType) {
            case ModalType.PROJECT:
                modalTitle = 'Create Project'
                break
            case ModalType.RESOURCE:
                modalTitle = 'Resource CSV import'
                break
            case ModalType.ACTIVITY:
                modalTitle = 'Activity CSV import'
                break
        }

        // 체크박스 여부에 따라 data가 없는 activity만 보여준다.
        let activities = this.state.showDanglingActivities ? this.state.activities.filter(a => !a.data) : this.state.activities
        return (
            this.state.initialized ?
                <div>
                    <NavBar/>
                    <div className="row">
                        <div id="activity-container" className="col-sm-12">
                            {/* Activity List */}
                            <Button outline
                                    color="secondary"
                                    onClick={() => this.showModal(ModalType.ACTIVITY)}>Import activities
                            </Button>
                            <Col sm={{size: 12}}>
                                <FormGroup check>
                                    <Label check>
                                        <Input type="checkbox"
                                               id="dangling"
                                               defaultChecked={this.state.showDanglingActivities}
                                               onChange={() => this.onCheckBoxClick()}/>{' '}
                                        Show only dangling activities
                                    </Label>
                                </FormGroup>
                            </Col>
                            <br/>
                            <Table selectable={true}
                                   filter={textFilter({placeholder: ' '})}
                                   selected={this.state.selected.selectedActivities}
                                   rowSelectHandler={(row, isSelected, rowIndex, e) => this.onActivityRowSelect(row, isSelected, rowIndex, e)}
                                   paginationData={{
                                       pageChangeHandler: (page) => this.onActivityPageChange(page),
                                       ...this.state.paginationData
                                   }}
                                   data={convertData4BootstrapTable(activities)}/>
                        </div>
                        {this.renderMainBtnContainer()}
                        <div className="row">
                            <div id="information-container" className="col-sm-12">
                                {/* Duration List */}
                                <Table selectable={true}
                                       filter={textFilter({placeholder: ' '})}
                                       selected={this.state.selected.selectedDurationInfos}
                                       rowSelectHandler={(row, isSelected, rowIndex, e) => this.onDurationInformationRowSelect(row, isSelected, rowIndex, e)}
                                       caption="Duration Data"
                                       data={convertData4BootstrapTable(this.state.durationInfos)}/>
                                {/* Productivity List */}
                                <Table selectable={true}
                                       filter={textFilter({placeholder: ' '})}
                                       selected={this.state.selected.selectedProductivityInfos}
                                       rowSelectHandler={(row, isSelected, rowIndex, e) => this.onProductivityInformationRowSelect(row, isSelected, rowIndex, e)}
                                       caption="Productivity Data"
                                       data={convertData4BootstrapTable(this.state.productivityInfos)}/>
                            </div>
                        </div>
                    </div>
                    {/* Modals */}
                    <CustomModal modalType={this.state.modalType}
                                 showModal={this.state.showModal}
                                 modalTitle={modalTitle}
                                 setStateHandler={(res) => this.setActivityData(res)}
                                 toggleModalHandler={this.toggleModal}
                    />
                </div>
                : <div className="d-flex justify-content-center">
                    <div className="spinner-border" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                </div>
        )
    }
}