import React, {Component} from 'react'
import BootstrapTable from 'react-bootstrap-table-next';

export default class Table extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <BootstrapTable keyField='id' columns={null} data={this.props.data}/>
        );
    }
}