import React, {Component, ReactPropTypes} from 'react'
import SearchBar from '../../components/SearchBar'
import WorkPackageFilter from '../../components/WorkPacakgeFilter'
import {Button} from 'reactstrap';
import * as api from '../../common/api'
import Table from "../../components/Table";

export default class ConstructionManagement extends Component {
    constructor(props) {
        super(props)
        this.state = {
            projects: [],
            activities: [],
            workPackages: [],
            durationInfos: [],
            productivityInfos: []

        }
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
        ).then(value => {
                this.setState({
                    projects: value[0],
                    activities: value[1],
                    workPackages: value[2],
                    durationInfos: value[3],
                    productivityInfos: value[4]
                })
            }
        )
    }

    render() {
        return (
            <div>
                <div className="row">
                    <div id="activity-container" className="col-sm-5">
                        <div className="manual-btn-container">
                            <Button outline color="secondary">프로젝트 추가</Button>
                            <Button outline color="secondary">액티비티 추가</Button>
                        </div>
                        <SearchBar/>
                        <WorkPackageFilter/>
                        {/* Activity List */}
                        <Table/>
                        {/* Project List */}
                        <Table/>
                    </div>
                    <div id="other-btn-container" className="col-sm-2">
                        <Button outline color="secondary">액티비티 일괄 추가</Button>
                        <Button outline color="secondary">리소스 일괄 추가</Button>
                        <Button outline color="primary">연결하기</Button>
                    </div>
                    <div id="information-container" className="col-sm-5">
                        <div className="manual-btn-container">
                            <Button outline color="secondary">Duration 정보 추가</Button>
                            <Button outline color="secondary">Productivity 정보 추가</Button>
                        </div>
                        <SearchBar/>
                        <WorkPackageFilter/>
                        {/* Duration List */}
                        <Table/>
                        {/* Productivity List */}
                        <Table/>
                    </div>
                </div>

            </div>
        )
    }
}