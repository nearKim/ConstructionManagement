import React, {Component, ReactPropTypes} from 'react'
import './index.css'
import {Button, ButtonGroup} from 'reactstrap';
import filterFactory, {textFilter} from 'react-bootstrap-table2-filter'
import * as api from '../../common/api'
import Table from "../../components/Table";
import CustomModal from "../../components/CustomModal";
import {InformationType, ModalType} from "../../common/constants";
import {convertData4BootstrapTable, pop} from "../../common/utils";

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
            resources: [],
            workPackages: [],
            durationInfos: [],
            productivityInfos: [],
            selected: {
                selectedActivities: [],
                selectedDurationInfos: [],
                selectedProductivityInfos: [],
            },
        }

        this.toggleModal = this.toggleModal.bind(this)
        this.createProject = this.createProject.bind(this)
    }

    componentDidMount() {
        // 모든 데이터를 초기화한다
        Promise.all(
            [
                api.getProjects(),
                api.getResources(),
                api.getActivities(),
                api.getWorkPackages(),
                api.getDurationInfos(),
                api.getProductivityInfos()
            ]
        ).then(responses => Promise.all(responses.map(r => r.json()))
        ).then(res => {
                this.setState({
                    initialized: true,
                    projects: res[0],
                    resources: res[1],
                    activities: res[2],
                    workPackages: res[3],
                    durationInfos: res[4],
                    productivityInfos: res[5]
                })
            }
        )
    }

    toggleProjects() {
        this.setState(prevState => ({showProjects: !prevState.showProjects}))
    }

    toggleResources() {
        this.setState(prevState => ({showResources: !prevState.showResources}))
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

    // API를 통해 프로젝트를 생성하고 모달을 닫는다
    createProject(projectName, projectDescription) {
        api.createProject(projectName, projectDescription)
            .then(res => res.json())
            .then(project => {
                this.setState({
                    projects: [...this.state.projects, project],
                    showModal: false
                })
            })
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
        const {activities, selected} = this.state
        // 단일 information 생성인 경우 activity는 무조건 1개다
        if (this.state.selected.selectedActivities.length !== 1) {
            alert('Activity는 반드시 1개가 선택되어야 합니다.')
            return
        }
        // 현재 선택된 Activity를 불러온다
        let activity = activities.find(a => a['activity_id'] === selected.selectedActivities[0])

        if (activity.data) {
            alert('선택한 Activity로 만들어진 Information이 존재합니다. 다른 Activity를 선택하세요')
            return;
        }

        api.makeActivityData(activity['activity_id'], undefined, type, false, activity['description'])
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
                            activities: activities,
                            durationInfos: type === InformationType.DURATION ? [...prevState.durationInfos, res] : prevState.durationInfos,
                            productivityInfos: type === InformationType.PRODUCTIVITY ? [...prevState.productivityInfos, res] : prevState.productivityInfos
                        }))
                    )
            })
    }

    // 1개 이상의 activity를 기존의 information과 링크시킨다
    // TODO: Link하려는 Work package들이 다르면 에러를 발생시킨다
    linkInfo() {
        let {selectedActivities, selectedDurationInfos, selectedProductivityInfos} = this.state.selected
        let {productivityInfos, durationInfos} = this.state
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
            api.linkActivitiesWithDuration(dataId, activityIds)
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
                            activities: responses[1]
                        }))
                    })
                )
            :
            api.linkActivitiesWithProductivity(dataId, activityIds)
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
                            activities: responses[1]
                        }))
                    })
                )
    }

    renderProjects() {
        return (
            <div id="project-container" className="col-sm-6 text-center">
                <Button outline block
                        color="primary"
                        onClick={() => this.showModal(ModalType.PROJECT)}>Add project</Button>
                {/* Project List */}
                <Table selectable={false}
                       data={convertData4BootstrapTable(this.state.projects)}/>
            </div>
        )
    }

    renderResources() {
        return (
            <div id="resource-container" className="col-sm-6 text-center">
                <Button outline block
                        color="primary"
                        onClick={() => this.showModal(ModalType.RESOURCE)}>Import resources
                </Button>
                {/* Resource List */}
                <Table selectable={false}
                       data={convertData4BootstrapTable(this.state.resources)}/>
            </div>
        )
    }

    renderMainBtnContainer() {
        return (
            <div className="row">
                <div className="col-sm-12 text-center">
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
        return (
            this.state.initialized ?
                <div>
                    <div className="row">
                        <div className="col-sm-12 text-center">
                            <Button outline
                                    color="secondary"
                                    onClick={() => this.toggleProjects()}>Toggle projects</Button>
                            <Button outline
                                    color="secondary"
                                    onClick={() => this.toggleResources()}>Toggle Resources</Button>
                        </div>
                    </div>
                    <div className="row">
                        {this.state.showProjects && this.renderProjects()}
                        {this.state.showResources && this.renderResources()}
                    </div>
                    <div className="row">
                        <div id="activity-container" className="col-sm-12">
                            <Button outline
                                    color="secondary"
                                    onClick={() => this.showModal(ModalType.ACTIVITY)}>Import activities
                            </Button>
                            {/* Activity List */}
                            <Table selectable={true}
                                   filter={textFilter({placeholder: ' '})}
                                   selected={this.state.selected.selectedActivities}
                                   rowSelectHandler={(row, isSelected, rowIndex, e) => this.onActivityRowSelect(row, isSelected, rowIndex, e)}
                                   data={convertData4BootstrapTable(this.state.activities)}/>
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
                                 createProjectHandler={this.createProject}
                                 setStateHandler={this.state.modalType === ModalType.ACTIVITY ?
                                     (res) => this.setActivityData(res) :
                                     (res) => this.setResourceData(res)}
                                 toggleModalHandler={this.toggleModal}
                    />
                </div>
                : null
        )
    }
}