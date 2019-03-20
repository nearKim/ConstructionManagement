import React, {Component} from 'react'
import BootstrapTable from 'react-bootstrap-table-next';
import {convertData4BootstrapTable} from '../../common/utils'

export default class Table extends Component {
    constructor(props) {
        super(props)

        this.initialized = props.data.length !== 0 ? true : false

        if (this.initialized) {
            this.data = convertData4BootstrapTable(props.data)

            // data는 무조건 넘어오므로 이로부터 key들을 초기화시킨다
            this.keys = Object.keys(this.data[0])

            // Idfield는 무조건 key에 id가 들어갈 것이다.
            this.idField = Object.keys(this.data[0]).filter(key => {
                return key.includes('id')
            })[0]
        }

    }

    // 주어진 data로부터 ReactBootstrapTable이 렌더링할 컬럼 정보를 뽑아낸다
    filterColumns(data) {
        let columns = []
        this.keys.map(key => {
            columns.push({
                dataField: key,
                text: key
            })
        })
        return columns
    }

    render() {
        return (
            this.initialized ?
                <BootstrapTable keyField={this.idField}
                                columns={this.filterColumns(this.data)}
                                data={this.data}/>
                : null
        );
    }
}