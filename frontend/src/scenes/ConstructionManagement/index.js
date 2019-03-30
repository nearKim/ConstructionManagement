import React, {Component, ReactPropTypes} from 'react'
import SearchBar from '../../components/SearchBar'
import WorkPackageFilter from '../../components/WorkPacakgeFilter'
import {Button} from 'reactstrap';
import * as api from '../../common/api'
import Table from "../../components/Table";
import CustomModal from "../../components/CustomModal";
import {ModalType} from "../../common/constants";
import {convertData4BootstrapTable} from "../../common/utils";

export default class ConstructionManagement extends Component {
    constructor(props) {
        super(props)
        this.state = {
            initialized: false,
            showModal: false,
            modalType: '',
            projects: [],
            activities: [],
            workPackages: [],
            durationInfos: [],
            productivityInfos: []
        }

        this.toggleModal = this.toggleModal.bind(this)
        this.createProject = this.createProject.bind(this)
    }

    componentDidMount() {
        // 모든 데이터를 초기화한다
        Promise.all(
            [
                api.getProjects(),
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
                    activities: res[1],
                    workPackages: res[2],
                    durationInfos: res[3],
                    productivityInfos: res[4]
                })
            }
        )
    }

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
                        <div id="activity-container" className="col-sm-5">
                            <div className="manual-btn-container">
                                <Button outline color="secondary"
                                        onClick={() => this.showModal(ModalType.PROJECT)}>프로젝트 추가
                                </Button>
                            </div>
                            <SearchBar/>
                            <WorkPackageFilter/>
                            {/* Project List */}
                            <Table data={convertData4BootstrapTable(this.state.projects)}/>
                            {/* Activity List */}
                            <Table data={convertData4BootstrapTable(this.state.activities)}/>
                        </div>
                        <div id="other-btn-container" className="col-sm-2">
                            <Button outline
                                    color="secondary"
                                    onClick={() => this.showModal(ModalType.ACTIVITY)}>액티비티 일괄 추가
                            </Button>
                            <Button outline
                                    color="secondary"
                                    onClick={() => this.showModal(ModalType.RESOURCE)}>리소스 일괄 추가
                            </Button>
                            <Button outline color="primary">연결하기</Button>
                        </div>
                        <div id="information-container" className="col-sm-5">
                            <SearchBar/>
                            <WorkPackageFilter/>
                            {/* Duration List */}
                            <Table data={this.state.durationInfos}/>
                            {/* Productivity List */}
                            <Table data={this.state.productivityInfos}/>
                        </div>
                    </div>
                    {/* Modals */}
                    <CustomModal modalType={this.state.modalType}
                                 showModal={this.state.showModal}
                                 modalTitle={modalTitle}
                                 createProjectHandler={this.createProject}
                                 toggleModalHandler={this.toggleModal}
                    />
                </div>
                : null
        )
    }
}