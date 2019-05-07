import React, {Component} from 'react';
import {Navbar, NavbarBrand, Nav, NavLink, NavItem} from 'reactstrap'
import Button from "reactstrap/es/Button";
import * as api from "../../common/api"

export default class NavBar extends Component {
    // DB를 밀어버린다
    truncateDatabase() {
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
                        <Button color="danger"
                                onClick={() => this.truncateDatabase()}>Flush DB</Button>
                    </Nav>
                </Navbar>
            </div>
        )
    }
}