import React, {Component} from 'react'
import BootstrapTable from 'react-bootstrap-table-next'
import filterFactory, {textFilter} from 'react-bootstrap-table2-filter'
import {capitalizeFirstLetter} from "../../common/utils";

export default class Table extends Component {

    renderPaginationButtons() {
        let {page, total, pageChangeHandler} = this.props.paginationData
        const lastPage = Math.ceil(total / 30)
        const firstPage = 1

        return (
            <nav>
                <div>Total {total} rows.</div>
                <ul className="pagination justify-content-center">
                    <li className={`page-item ${page == 1 ? 'disabled' : ''}`}>
                        <a className="page-link" onClick={() => pageChangeHandler(firstPage)}>First</a>
                    </li>
                    <li className={`page-item ${page == 1 ? 'disabled' : ''}`}>
                        <a className="page-link" onClick={() => pageChangeHandler(page - 1)}>Previous</a>
                    </li>
                    <li className="page-item active"><a className="page-link ">{page} / {lastPage}</a></li>
                    <li className={`page-item ${page == lastPage ? 'disabled' : ''}`}>
                        <a className="page-link" onClick={() => pageChangeHandler(page + 1)}>Next</a>
                    </li>
                    <li className={`page-item ${page == lastPage ? 'disabled' : ''}`}>
                        <a className="page-link" onClick={() => pageChangeHandler(lastPage)}>Last</a>
                    </li>
                </ul>
            </nav>
        )
    }

    render() {
        const initialized = this.props.data.length !== 0
        const enablePagination = !!this.props.paginationData

        // 이름들을 다음과 같이 치환한다
        const mapping = {
            activity_id: 'Activity ID',
            project: 'Project',
            name: 'Name',
            description: 'Description',
            duration: 'Duration',
            productivity: 'Productivity',
            labor_cnt: '# of Labor',
            resource: 'Resource',
            quantity: 'Quantity',
            data: 'Data',
            level: 'Level',
            data_id: 'Data ID',
            data_cnt: '# of Data',
            use_duration: 'Use Duration',
            workpackage1: 'Phase',
            workpackage2: 'Area',
            workpackage3: 'Facility',
            workpackage4: 'Discipline'
        }

        let keys, columns, keyField
        if (initialized) {
            keys = Object.keys(this.props.data[0])
            columns = keys.map(key => {
                let column = {
                    dataField: key,
                    text: key in mapping ? mapping[key] : capitalizeFirstLetter(key),
                    filter: this.props.filter
                }
                return column
            })

            // Column Reordering
            let latter_cols = ["labor_cnt", "resource", "quantity", "data", "maximum", "minimum", "use_duration"]
            columns = [
                ...columns.filter(column => !latter_cols.includes(column.dataField)),
                ...columns.filter(column => latter_cols.includes(column.dataField))
            ]


            keyField = keys.filter(key => {
                return key.includes('id') || key.includes('ID')
            })[0]

        }
        const selectRowProp = {
            mode: 'checkbox',
            sort: true,
            clickToSelect: true,
            bgColor: 'grey',
            selected: this.props.selected,
            onSelect: this.props.rowSelectHandler
        }


        return (
            initialized ?
                <div>
                    <BootstrapTable striped hover condensed bordered={false}
                                    bodyStyle={{overflow: 'overlay'}}
                                    keyField={keyField}
                                    columns={columns}
                                    classes="table table-responsive"
                                    selectRow={this.props.selectable ? selectRowProp : undefined}
                                    filter={filterFactory()}
                                    caption={this.props.caption ? this.props.caption : undefined}
                                    data={this.props.data}/>
                    {enablePagination ? this.renderPaginationButtons() : null}
                </div>
                : null
        );
    }
}