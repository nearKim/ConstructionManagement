import React, {Component} from 'react'
import BootstrapTable from 'react-bootstrap-table-next';

export default class Table extends Component {
    constructor(props) {
        super(props)

        // Data가 안들어오면 렌더링하지 않는다
        this.initialized = props.data.length !== 0

        if (this.initialized) {
            // Bootstrap table을 위한 데이터들을 가공하여 넣어준다.
            this.keys = Object.keys(props.data[0])
            this.columns = this.keys.map(key => ({dataField: key, text: key}))
            this.keyField = this.keys.filter(key => {
                return key.includes('id')
            })[0]
        }

    }

    render() {
        const selectRowProp = {
            mode: 'checkbox',
            sort: true,
            clickToSelect: true,
            bgColor: 'grey',
            onSelect: this.props.rowSelectHandler
        }

        return (
            this.initialized ?
                <BootstrapTable keyField={this.keyField}
                                columns={this.columns}
                                selectRow={this.props.selectable? selectRowProp : undefined}
                                data={this.props.data}/>
                : null
        );
    }
}