import React, {Component, ReactPropTypes} from 'react'
import SearchBar from '../../components/SearchBar'
import WorkPackageFilter from '../../components/WorkPacakgeFilter'
import {Button} from 'reactstrap';
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
            showModal: false,
            modalType: '',
            projects: [],
            activities: [],
            resources: [],
            workPackages: [],
            durationInfos: [],
            productivityInfos: [],
            selectedActivities: [],
            selectedInfos: []
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

    // Activity가 생성된 경우 데이터를 state에 넣어주고 모달을 닫는다
    setActivityData(activities) {
        Object.keys(activities).map((key, index) => {
            activities[key] = JSON.parse(activities[key])
        })
        let success = pop(activities, 'success')

        // 에러 상황을 한번 보여준다.
        alert('결과를 확인해주세요. \n' + JSON.stringify(activities))
        this.setState(prevState => ({
                activities: [...prevState.activities, ...success],
                showModal: false
            })
        )
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
        let deleteFlag = this.state.selectedActivities
            .map(a => a['activity_id'])
            .includes(row['activity_id'])
        // 만일 현재 row가 state에 존재하면 지워주고 아니면 넣어준다
        deleteFlag ?
            this.setState(prevState => ({
                selectedActivities: prevState.selectedActivities.filter(a => a['activity_id'] !== row['activity_id'])
            })) :
            this.setState(prevState => ({
                selectedActivities: [...prevState.selectedActivities, row]
            }))
    }

    // 선택된 Information row 정보를 state에 저장한다
    onInformationRowSelect(row, isSelected, rowIndex, e) {
        let deleteFlag = this.state.selectedInfos
            .map(i => i['data_id'])
            .includes(row['data_id'])
        // 만일 현재 row가 state에 존재하면 지워주고 아니면 넣어준다
        deleteFlag ?
            this.setState(prevState => ({
                selectedActivities: prevState.selectedInfos.filter(i => i['data_id'] !== row['data_id'])

            })) :
            this.setState(prevState => ({
                selectedInfos: [...prevState.selectedInfos, row]
            }))
    }

    // 1개의 선택된 activity를 사용하여 Duration 혹은 Productivity Information을 생성한다
    createInfo(type) {
        // 단일 information 생성인 경우 activity는 무조건 1개다
        if (this.state.selectedActivities.length !== 1) {
            alert('Activity는 반드시 1개가 선택되어야 합니다.')
            return
        }

        let activity = this.state.selectedActivities[0]
        api.makeActivityData(activity['activity_id'], undefined, type, false, activity['description'])
            .then(res => {
                // 잘 생성된 경우 activity selection을 초기화하고 durationInfo를 업데이트 한다.
                if (res.status === 200) {
                    return res.json()
                } else {
                    // 뭔가 문제가 있으면 그냥 결과를 보여주고 refresh 한다
                    alert(res.status)
                    location.reload()
                }
            })
            .then(res => {
                api.getActivities()
                    .then(res => res.json())
                    .then(activities => this.setState(prevState => ({
                            selectedActivities: [],
                            activities: activities,
                            durationInfos: type === InformationType.DURATION ? [...prevState.durationInfos, res] : prevState.durationInfos,
                            productivityInfos: type === InformationType.PRODUCTIVITY ? [...prevState.productivityInfos, res] : prevState.productivityInfos
                        }))
                    )
            })
    }

    // 1개 이상의 activity를 기존의 information과 링크시킨다
    linkInfo() {
        // 갯수 예외처리
        if (this.state.selectedInfos.length !== 1) {
            alert('Information은 반드시 1개가 선택되어야 합니다.')
            return
        }
        if (this.state.selectedActivities.length === 0) {
            alert('적어도 1개의 Activity를 지정하세요.')
            return
        }

        let dataInfo = this.state.selectedInfos[0]
        let activityIds = this.state.selectedActivities.map(a => a['activity_id'])

        // link 시키고 activity는 빼주고 info는 업데이트 해준다
        dataInfo.use_duration ?
            api.linkActivitiesWithDuration(dataInfo['data_id'], activityIds)
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
                            selectedActivities: [],
                            selectedInfos: [],
                            durationInfos: responses[0],
                            activities: responses[1]
                        }))
                    })
                )
            :
            api.linkActivitiesWithProductivity(dataInfo['data_id'], activityIds)
                .then(res => {
                    if (res.stats === 200) {
                        return res.json()
                    } else {
                        alert(res.status)
                        // location.reload()
                    }
                })
                .then(res => Promise.all([api.getProductivityInfo(), api.getActivities()])
                    .then(res => Promise.all(res.map(r => r.json())))
                    .then(responses => {
                        this.setState(prevState => ({
                            selectedActivities: [],
                            selectedInfos: [],
                            productivityInfos: responses[0],
                            activities: responses[1]
                        }))
                    })
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
                        <div className="col-sm-4">
                            <Button outline color="secondary"
                                    onClick={() => this.showModal(ModalType.PROJECT)}>Add project</Button>
                            {/* Project List */}
                            <Table selectable={false}
                                   data={convertData4BootstrapTable(this.state.projects)}/>
                        </div>
                        <div className="col-sm-8">
                            <Button outline
                                    color="secondary"
                                    onClick={() => this.showModal(ModalType.RESOURCE)}>Import resources
                            </Button>
                            {/* Resource List */}
                            <Table selectable={false}
                                   data={convertData4BootstrapTable(this.state.resources)}/>
                        </div>
                    </div>
                    <div className="row">
                        <div id="activity-container" className="col-sm-12">
                            <Button outline
                                    color="secondary"
                                    onClick={() => this.showModal(ModalType.ACTIVITY)}>Import activities
                            </Button>
                            <SearchBar/>
                            <WorkPackageFilter/>
                            {/* Activity List */}
                            <Table selectable={true}
                                   rowSelectHandler={(row, isSelected, rowIndex, e) => this.onActivityRowSelect(row, isSelected, rowIndex, e)}
                                   data={convertData4BootstrapTable(this.state.activities)}/>
                        </div>
                        <div className="row">
                            <div id="other-btn-container" className="col-sm-12">
                                <Button outline color="primary" onClick={() => this.linkInfo()}>Link activity</Button>
                                <Button outline color="primary"
                                        onClick={() => this.createInfo(InformationType.DURATION)}>Use duration</Button>
                                <Button outline color="primary"
                                        onClick={() => this.createInfo(InformationType.PRODUCTIVITY)}>Use
                                    productivity</Button>
                            </div>
                        </div>
                        <div className="row">
                            <div id="information-container" className="col-sm-12">
                                <SearchBar/>
                                <WorkPackageFilter/>
                                {/* Duration List */}
                                <Table selectable={true}
                                       rowSelectHandler={(row, isSelected, rowIndex, e) => this.onInformationRowSelect(row, isSelected, rowIndex, e)}
                                       data={convertData4BootstrapTable(this.state.durationInfos)}/>
                                {/* Productivity List */}
                                <Table selectable={true}
                                       rowSelectHandler={(row, isSelected, rowIndex, e) => this.onInformationRowSelect(row, isSelected, rowIndex, e)}
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