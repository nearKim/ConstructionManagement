import React, {Component} from 'react';
import {Navbar, NavbarBrand, Nav, NavLink, NavItem} from 'reactstrap'

export default class NavBar extends Component {
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
                    </Nav>
                </Navbar>
            </div>
        )
    }
}