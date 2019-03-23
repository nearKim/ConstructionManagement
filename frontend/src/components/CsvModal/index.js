import React, {Component} from 'react'
import {Button, Label, Input, Modal, Form, FormGroup, ModalHeader, ModalBody, ModalFooter} from 'reactstrap'
import * as api from '../../common/api'
import {ModalType} from '../../common/constants'


export default class CsvModal extends Component {
    constructor(props) {
        super(props)
        this.state = {
            csvFile: null,
        }

        this.onFileChange = this.onFileChange.bind(this);
        this.onCsvSubmit = this.onCsvSubmit.bind(this);
    }

    onFileChange(e) {
        let value = e.target.value;
        this.setState({csvFile: e.target.files[0]})
    }


    // API를 통해 파일을 업로드하고 모달을 닫는다.
    onCsvSubmit() {
        if (!this.state.csvFile) alert('파일이 없습니다.')

        if (this.props.modalType === ModalType.ACTIVITY) {
            api.importActivityCSV(this.state.csvFile)
                .then(res => res.json())
                .then(res => console.log(res))
        } else if (this.props.modalType === ModalType.RESOURCE) {
            api.importResourceCSV(this.state.csvFile)
                .then(res => res.json())
                .then(res => console.log(res))
        }

    }

    render() {
        return (
            <div>
                <Modal isOpen={this.props.showModal}
                       toggle={() => this.props.toggleModalHandler()}
                       unmountOnClose={true}>
                    <ModalHeader toggle={() => this.props.toggleModalHandler()}>{this.props.modalTitle}</ModalHeader>
                    <ModalBody>
                        <FormGroup>
                            <Label for="csvInput">CSV 파일</Label>
                            <Input type="file" name="csvInput" onChange={this.onFileChange}/>
                        </FormGroup>
                        <Button color="primary" onClick={() => this.onCsvSubmit()}>업로드</Button>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={() => this.props.toggleModalHandler()}>취소</Button>
                    </ModalFooter>
                </Modal>
            </div>
        )
    }
}