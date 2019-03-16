import { InformationType } from '../constants'

/**
 * 프로젝트 API
 */
export function getProjects() {
    return fetch(`${API_V1_ENDPOINT}/projects/`)
}

export function getProject(projectId) {
    return fetch(`${API_V1_ENDPOINT}/projects/${projectId}`)
}

export function createProject(projectName, projectDescription) {
    let data = JSON.stringify({
        name: projectName,
        description: projectDescription
    })
    return fetch(`${API_V1_ENDPOINT}/projects`, {
        method: 'POST',
        data: data
    })
}

export function editProject(projectName, projectDescription) {
    let data = JSON.stringify({
        name: projectName,
        description: projectDescription
    })
    return fetch(`${API_V1_ENDPOINT}/projects`, {
        method: 'PUT',
        data: data
    })
}

export function deleteProject(projectId) {
    return fetch(`${API_V1_ENDPOINT}/projects/${projectId}`, {
        method: 'DELETE'
    })
}

/**
 * 액티비티 API
 */
export function getActivities(workPackages) {
    let queryRoot = '?work_package='
    let query = workPackages ? queryRoot + workPackages.join(queryRoot) : null

    return fetch(`${API_V1_ENDPOINT}/activities${query}`)
}

export function getActivity(activityId) {
    return fetch(`${API_V1_ENDPOINT}/activities/${activityId}`)
}

export function getActivityWorkPackages(activityId) {
    return fetch(`${API_V1_ENDPOINT}/activities/${activityId}/work_packages`)

}

export function createActivity(createData) {
    return fetch(`${API_V1_ENDPOINT}/activities`, {
        method: 'POST',
        data: createData
    })
}

export function editActivity(activityId, editData) {
    return fetch(`${API_V1_ENDPOINT}/activities/${activityId}`, {
        method: 'PUT',
        data: editData
    })
}

export function deleteActivity(activityId) {
    return fetch(`${API_V1_ENDPOINT}/activities/${activityId}`, {
        method: 'DELETE'
    })
}

export function makeActivityData(activityId, dataId = null, type, link = null, description = '') {
    let query = `?type=${type}&link=${link}`
    return fetch(`${API_V1_ENDPOINT}/activities/${activityId}/information/${dataId}` + query, {
        method: 'POST',
        data: {
            description: description
        }
    })
}

export function importActivityCSV(csvFile) {
    let formData = new FormData()
    formData.append('file', csvFile)

    return fetch(`${API_V1_ENDPOINT}/activities/csv-import`, {
        method: 'POST',
        data: formData
    })
}

/**
 * Resource API
 */

export function getResources(workPackages) {
    let queryRoot = '?work_package='
    let query = workPackages ? queryRoot + workPackages.join(queryRoot) : null
    return fetch(`${API_V1_ENDPOINT}/resources${query}`)
}

export function getResource(resourceId) {
    return fetch(`${API_V1_ENDPOINT}/resources/${resourceId}`)
}

export function createResource(createData) {
    return fetch(`${API_V1_ENDPOINT}/resources`, {
        method: 'POST',
        data: createData
    })
}

export function editResource(resourceId, editData) {
    return fetch(`${API_V1_ENDPOINT}/resources/${resourceId}`, {
        method: 'PUT',
        data: editData
    })
}

export function deleteResource(resourceId) {
    return fetch(`${API_V1_ENDPOINT}/resources/${resourceId}`, {
        method: 'DELETE'
    })
}

export function importResourceCSV(csvFile) {
    let formData = new FormData()
    formData.append('file', csvFile)

    return fetch(`${API_V1_ENDPOINT}/activities/csv-import`, {
        method: 'POST',
        data: formData
    })
}

/**
 * WorkPackage API
 */

export function getWorkPackages() {
    return fetch(`${API_V1_ENDPOINT}/work-packages`)
}

export function getWorkPackage(workPackageId) {
    return fetch(`${API_V1_ENDPOINT}/work-packages/${workPackageId}`)
}

export function createWorkPackage(packageName, parentPackage) {
    let createData = JSON.stringify({
        package_name: packageName,
        parent_package: parentPackage
    })

    return fetch(`${API_V1_ENDPOINT}/work-packages`, {
        method: 'POST',
        data: createData
    })
}

export function editWorkPackage(workPackageId, packageName, parentPackage) {
    let editData = JSON.stringify({
        package_name: packageName,
        parent_package: parentPackage
    })

    return fetch(`${API_V1_ENDPOINT}/work-packages/${workPackageId}`, {
        method: 'PUT',
        data: editData
    })
}

export function deleteWorkPackage(workPackageId) {
    return fetch(`${API_V1_ENDPOINT}/work-packages/${workPackageId}`, {
        method: 'DELETE',
    })
}

/**
 * DataInfo API
 */

export function getDurationInfos(workPackages) {
    let queryRoot = '?work_package='
    let query = workPackages ? queryRoot + workPackages.join(queryRoot) : null

    return fetch(`${API_V1_ENDPOINT}/duration-infos${query}`)
}

export function getDurationInfo(dataId) {
    return fetch(`${API_V1_ENDPOINT}/duration-infos/${dataId}`)
}

export function getDurationInfoActivities(dataId) {
    return fetch(`${API_V1_ENDPOINT}/duration-infos/${dataId}/activities`)
}

export function createDurationInfo(createData) {
    return fetch(`${API_V1_ENDPOINT}/duration-infos`, {
        method: 'POST',
        data: createData
    })
}

export function editDurationInfo(dataId, editData) {
    return fetch(`${API_V1_ENDPOINT}/duration-infos/${dataId}`, {
        method: 'PUT',
        data: editData
    })
}

export function deleteDurationInfo(dataId) {
    return fetch(`${API_V1_ENDPOINT}/duration-infos/${dataId}`, {
        method: 'DELETE'
    })
}

/**
 * ProductivityInfo API
 */

export function getProductivityInfos(workPackages) {
    let queryRoot = '?work_package='
    let query = workPackages ? queryRoot + workPackages.join(queryRoot) : null

    return fetch(`${API_V1_ENDPOINT}/productivity-infos${query}`)
}

export function getProductivityInfo(dataId) {
    return fetch(`${API_V1_ENDPOINT}/productivity-infos/${dataId}`)
}

export function getProductivityInfoActivities(dataId) {
    return fetch(`${API_V1_ENDPOINT}/productivity-infos/${dataId}/activities`)
}

export function createProductivityInfo(createData) {
    return fetch(`${API_V1_ENDPOINT}/productivity-infos`, {
        method: 'POST',
        data: createData
    })
}

export function editProductivityInfo(dataId, editData) {
    return fetch(`${API_V1_ENDPOINT}/productivity-infos/${dataId}`, {
        method: 'PUT',
        data: editData
    })
}

export function deleteProductivityInfo(dataId) {
    return fetch(`${API_V1_ENDPOINT}/productivity-infos/${dataId}`, {
        method: 'DELETE'
    })
}