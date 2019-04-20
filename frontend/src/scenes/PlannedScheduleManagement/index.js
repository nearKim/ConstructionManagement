import React, {Component} from 'react'
import NavBar from '../../components/NavBar'
import {Button} from "reactstrap";
import * as api from '../../common/api';
import {ModalType} from "../../common/constants";
import Table from "../../components/Table";
import {convertData4BootstrapTable} from "../../common/utils";
import CustomModal from "../../components/CustomModal";

export default class PlannedScheduleManagement extends Component {
    constructor(props) {
        super(props)
        this.state = {
            initialized: false,
            showResources: false,
            showModal: false,

            resources: [],
            plannedSchedules: [],
            dataInfos: []
        }

        this.toggleModal = this.toggleModal.bind(this)
    }

    componentDidMount() {
        Promise.all([
                api.getResources(),
                api.getPlannedSchedules(),
                api.getDurationInfos(),
                api.getProductivityInfos()
            ]
        ).then(responses => Promise.all(responses.map(r => r.json()))
        ).then(res => {
            this.setState({
                initialized: true,
                resources: res[0],
                plannedSchedules: res[1],
                dataInfos: [...res[2], ...res[3]]
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

    renderResources() {
        return (
            <div id="resource-container" className="col-sm-6 text-center">
                <Button outline block
                        color="primary"
                        onClick={() => this.showModal()}>Import resources</Button>
                {/* Resource List */}
                <Table selectable={false}
                       data={convertData4BootstrapTable(this.state.resources)}/>
            </div>
        )
    }

    render() {
        return (
            <div>
                <NavBar/>
                <div className="row">
                    <div className="col-sm-12">
                        <Button outline color="secondary" onClick={() => this.toggleResources()}>Toggle
                            Resources</Button>
                    </div>
                </div>
                <div className="row">
                    {this.state.showResources && this.renderResources()}
                </div>
                <div className="row">
                    <div className="col-sm-6">

                    </div>
                    <div className="col-sm-6">

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