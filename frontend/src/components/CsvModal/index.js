import React, {Component} from 'react'
import {Button, Label, Input, Modal, Form, FormGroup, ModalHeader, ModalBody, ModalFooter} from 'reactstrap'
import * as api from '../../common/api'
import {CsvModalType} from '../../common/constants'


export default class CsvModal extends Component {
    constructor(props) {
        super(props)
        this.state = {
            csvFile: null,
        }
    }

    onFileChange(e) {
        this.setState({csvFile: e.target.files[0]})
    }


    // API를 통해 파일을 업로드하고 모달을 닫는다.
    onCsvSubmit() {
        if (!this.state.csvFile) alert('파일이 없습니다.')

        if (this.props.csvModalType === CsvModalType.ACTIVITY) {
            api.importActivityCSV(this.state.csvFile)
                .then(res => res.json())
                .then(res => console.log(res))
        } else if (this.props.csvModalType === CsvModalType.RESOURCE) {
            api.importResourceCSV(this.state.csvFile)
                .then(res => res.json())
                .then(res => console.log(res))
        }

    }

    render() {
        let {showCsvModal, modalTitle} = this.props

        return (
            <div>
                <Modal isOpen={showCsvModal}
                       toggle={this.props.toggleModalHandler}
                       unmountOnClose={true}>
                    <ModalHeader toggle={this.props.toggleModalHandler}>{modalTitle}</ModalHeader>
                    <ModalBody>
                        <FormGroup>
                            <Label for="csvInput">CSV 파일</Label>
                            <Input type="file" name="csvInput" onChange={(e) => this.onFileChange(e)}/>
                        </FormGroup>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={() => this.onCsvSubmit()}>업로드</Button>
                        <Button color="secondary" onClick={this.props.toggleModalHandler}>취소</Button>
                    </ModalFooter>
                </Modal>
            </div>
        )
    }
}