import React, {Component} from 'react'
import {Button, Label, Input, Modal, Form, FormGroup, ModalHeader, ModalBody, ModalFooter} from 'reactstrap'
import * as api from '../../common/api'
import {ModalType} from '../../common/constants'

export default class CustomModal extends Component {
    constructor(props) {
        super(props)

        this.onCsvSubmit = this.onCsvSubmit.bind(this)
        this.onFileChange = this.onFileChange.bind(this)
        this.onInputChange = this.onInputChange.bind(this)
        this.renderCsvModalForm = this.renderCsvModalForm.bind(this)
        this.renderProjectModalForm = this.renderProjectModalForm.bind(this)

        this.state = {
            csvFile: null,
            projectName: '',
            projectDescription: '',
        }
    }

    onFileChange(e) {
        this.setState({csvFile: e.target.files[0]})
    }

    onInputChange(e) {
        this.setState({[e.target.name]: e.target.value})
    }

    // API를 통해 파일을 업로드하고 모달을 닫는다.
    onCsvSubmit() {
        if (!this.state.csvFile) alert('파일이 없습니다.')

        // TODO: res를 state로 넣기
        if (this.props.modalType === ModalType.ACTIVITY) {
            api.importActivityCSV(this.state.csvFile)
                .then(res => res.json())
                .then(res => this.props.setStateHandler(JSON.parse(res['success'])))
        } else if (this.props.modalType === ModalType.RESOURCE) {
            api.importResourceCSV(this.state.csvFile)
                .then(res => res.json())
                .then(res => this.props.setStateHandler(JSON.parse(res['success'])))
        }

    }

    renderCsvModalForm() {
        return (
            <div>
                <ModalBody>
                    <FormGroup>
                        <Label for="csvInput">CSV 파일</Label>
                        <Input type="file" name="csvFile" onChange={this.onFileChange}/>
                    </FormGroup>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={this.onCsvSubmit}>업로드</Button>
                    <Button color="secondary" onClick={this.props.toggleModalHandler}>취소</Button>
                </ModalFooter>
            </div>
        )
    }

    renderProjectModalForm() {
        let {projectName, projectDescription} = this.state
        return (
            <div>
                <ModalBody>
                    <Form>
                        <Label for="projectName">프로젝트명</Label>
                        <Input type="text"
                               id="projectName"
                               name="projectName"
                               onChange={this.onInputChange}/>
                        <Label for="projectDescription">프로젝트 설명</Label>
                        <Input type="textarea"
                               id="projectDescription"
                               name="projectDescription"
                               onChange={this.onInputChange}/>
                    </Form>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary"
                            onClick={(e) => this.props.createProjectHandler(projectName, projectDescription)}>업로드</Button>
                    <Button color="secondary" onClick={this.props.toggleModalHandler}>취소</Button>
                </ModalFooter>
            </div>
        )
    }

    render() {
        const {showModal, modalTitle, modalType} = this.props
        let renderCsvModal = modalType === ModalType.PROJECT ? false : true

        return (
            <div>
                <Modal isOpen={showModal}
                       toggle={this.props.toggleModalHandler}
                       unmountOnClose={true}>
                    <ModalHeader toggle={this.props.toggleModalHandler}>{modalTitle}</ModalHeader>
                    {renderCsvModal ? this.renderCsvModalForm() : this.renderProjectModalForm()}
                </Modal>
            </div>
        )
    }
}