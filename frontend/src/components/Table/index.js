import React, {Component} from 'react'
import BootstrapTable from 'react-bootstrap-table-next';

export default class Table extends Component {

    render() {
        const initialized = this.props.data.length !== 0
        let keys, columns, keyField
        if (initialized) {
            keys = Object.keys(this.props.data[0])
            columns = keys.map(key => ({dataField: key, text: key}))
            keyField = keys.filter(key => {
                return key.includes('id') || key.includes('ID')
            })[0]

        }
        const selectRowProp = {
            mode: 'checkbox',
            sort: true,
            clickToSelect: true,
            bgColor: 'grey',
            onSelect: this.props.rowSelectHandler
        }

        return (
            initialized ?
                <BootstrapTable keyField={keyField}
                                columns={columns}
                                classes="table-responsive"
                                selectRow={this.props.selectable ? selectRowProp : undefined}
                                data={this.props.data}/>
                : null
        );
    }
}