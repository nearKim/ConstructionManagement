import React, {Component} from 'react'
import BootstrapTable from 'react-bootstrap-table-next'
import filterFactory, {textFilter} from 'react-bootstrap-table2-filter'

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

        let keys, columns, keyField
        if (initialized) {
            keys = Object.keys(this.props.data[0])
            columns = keys.map(key => ({dataField: key, text: key, filter: this.props.filter}))
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