import React, {Component} from 'react';
import {Navbar, NavbarBrand, Nav, NavLink, NavItem} from 'reactstrap'
import Button from "reactstrap/es/Button";
import * as api from "../../common/api"
import ButtonGroup from "reactstrap/es/ButtonGroup";

export default class NavBar extends Component {
    constructor(props) {
        super(props)
        this.state = {initialized: true}
    }

    // Activity를 밀어버린다
    deleteActivities() {
        this.setState({initialized:false})
        if (confirm('정말 모든 Activity들을 삭제하시겠습니까?')) {
            api.deleteActivities().then(res => {
                if (res.ok) {
                    alert('성공적으로 삭제되었습니다.')
                    location.reload()
                } else alert('에러가 발생하였습니다.')
            })
        }
    }

    // PlannedSchedule을 밀어버린다
    deletePlannedSchedules() {
        this.setState({initialized:false})
        if (confirm('정말 모든 Planned Schedule들을 싸그리 없애벌이시겠읍니까?')) {
            api.deletePlannedSchedules().then(res => {
                if (res.ok) {
                    alert('굳')
                    location.reload()
                } else alert('ㅠㅠ')
            })
        }
    }

    // Allocation을 밀어버린다
    deleteAllocations() {
        this.setState({initialized:false})
        if (confirm('정말로 Allocation들을 모두 삭제하시겠습니까?')) {
            api.deleteAllocations().then(res => {
                if (res.ok) {
                    alert('성공적으로 삭제되었습니다.')
                    location.reload()
                } else alert('에러가 발생하였습니다.')
            })
        }
    }

    // DB를 밀어버린다
    truncateDatabase() {
        this.setState({initialized:false})
        if (confirm('정말로 DB를 밀어버리시겠습니까?')) {
            api.truncateDatabase().then(res => {
                if (res.ok) {
                    alert('DB가 초기화되었습니다.')
                    location.reload()
                } else {
                    alert('에러가 발생하였습니다.')
                }
            })
        }
    }

    render() {
        return (
            this.state.initialized ?
                <div>
                    <Navbar color="light" light expand="md">
                        <NavbarBrand href="/" className="mr-auto">Construction Management</NavbarBrand>
                        <Nav>
                            <NavItem>
                                <NavLink href="/chart/">Visualization</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink href="/planned-schedule/">Planned Schedule management</NavLink>
                            </NavItem>
                            <ButtonGroup>
                                <Button color="warning"
                                        onClick={() => this.deleteActivities()}>Truncate Activities</Button>
                                <Button color="warning"
                                        onClick={() => this.deletePlannedSchedules()}>Truncate Planned
                                    Schedules</Button>
                                <Button color="warning"
                                        onClick={() => this.deleteAllocations()}>Truncate Allocations</Button>
                                <Button color="danger"
                                        onClick={() => this.truncateDatabase()}>Flush DB</Button>
                            </ButtonGroup>
                        </Nav>
                    </Navbar>
                </div>
                :
                <div className="d-flex justify-content-center">
                    <div className="spinner-border" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                </div>
        )
    }
}