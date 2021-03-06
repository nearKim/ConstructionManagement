import {InformationType} from '../constants'
import {fetch} from '../../common/utils'

//FIXME: 환경변수로 포함
let API_V1_ENDPOINT = 'http://localhost:8000/api/v1'

/**
 * 프로젝트 API
 */
export function getProjects() {
    return fetch(`${API_V1_ENDPOINT}/projects/`)
}

export function getProject(projectId) {
    return fetch(`${API_V1_ENDPOINT}/projects/${projectId}/`)
}

export function createProject(projectName, projectDescription) {
    let data = JSON.stringify({
        name: projectName,
        description: projectDescription
    })
    return fetch(`${API_V1_ENDPOINT}/projects/`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: data
    })
}

export function editProject(projectName, projectDescription) {
    let data = JSON.stringify({
        name: projectName,
        description: projectDescription
    })
    return fetch(`${API_V1_ENDPOINT}/projects/`, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: data
    })
}

export function deleteProject(projectId) {
    return fetch(`${API_V1_ENDPOINT}/projects/${projectId}/`, {
        method: 'DELETE'
    })
}

/**
 * 액티비티 API
 */
export function getActivities(page=1) {
    let query = `?page=${page}`

    return fetch(`${API_V1_ENDPOINT}/activities${query}`)
}

export function getActivity(activityId) {
    return fetch(`${API_V1_ENDPOINT}/activities/${activityId}/`)
}

export function getActivityWorkPackages(activityId) {
    return fetch(`${API_V1_ENDPOINT}/activities/${activityId}/work_packages/`)

}

export function createActivity(createData) {
    return fetch(`${API_V1_ENDPOINT}/activities/`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: createData
    })
}

export function editActivity(activityId, editData) {
    return fetch(`${API_V1_ENDPOINT}/activities/${activityId}/`, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: editData
    })
}

export function deleteActivities() {
    return fetch(`${API_V1_ENDPOINT}/activities/delete/`, {
        method: 'DELETE'
    })
}

export function deleteActivity(activityId) {
    return fetch(`${API_V1_ENDPOINT}/activities/${activityId}/`, {
        method: 'DELETE'
    })
}

export function makeActivityData(activityId, dataId = '', type, link = '', name = '', description = '') {
    let query = `?type=${type}&link=${link}`
    return fetch(`${API_V1_ENDPOINT}/activities/${activityId}/information/${dataId}` + query, {
        method: 'POST',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({name, description})
    })
}

export function linkActivitiesWithDuration(dataId, activityIds, name, description) {
    let linkData = {
        activities: activityIds,
        name,
        description
    }
    return fetch(`${API_V1_ENDPOINT}/duration-infos/${dataId}/activities/`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(linkData)
    })
}

export function linkActivitiesWithProductivity(dataId, activityIds, name, description) {
    let linkData = {
        activities: activityIds,
        name,
        description
    }
    return fetch(`${API_V1_ENDPOINT}/productivity-infos/${dataId}/activities/`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(linkData)
    })
}


export function importActivityCSV(csvFile) {
    let formData = new FormData()
    formData.append('file', csvFile)

    return fetch(`${API_V1_ENDPOINT}/activities/csv_import/`, {
        method: 'POST',
        body: formData
    })
}

/**
 * Resource API
 */

export function getResources(workPackages) {
    let queryRoot = '?work_package='
    let query = workPackages ? queryRoot + workPackages.join(queryRoot) : ''
    return fetch(`${API_V1_ENDPOINT}/resources${query}`)
}

export function getResource(resourceId) {
    return fetch(`${API_V1_ENDPOINT}/resources/${resourceId}/`)
}

export function createResource(createData) {
    return fetch(`${API_V1_ENDPOINT}/resources/`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: createData
    })
}

export function editResource(resourceId, editData) {
    return fetch(`${API_V1_ENDPOINT}/resources/${resourceId}/`, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: editData
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

    return fetch(`${API_V1_ENDPOINT}/resources/csv_import/`, {
        method: 'POST',
        body: formData
    })
}

/**
 * WorkPackage API
 */

export function getWorkPackages() {
    return fetch(`${API_V1_ENDPOINT}/work-packages/`)
}

export function getWorkPackage(workPackageId) {
    return fetch(`${API_V1_ENDPOINT}/work-packages/${workPackageId}/`)
}

export function createWorkPackage(packageName, parentPackage) {
    let createData = JSON.stringify({
        package_name: packageName,
        parent_package: parentPackage
    })

    return fetch(`${API_V1_ENDPOINT}/work-packages/`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: createData
    })
}

export function editWorkPackage(workPackageId, packageName, parentPackage) {
    let editData = JSON.stringify({
        package_name: packageName,
        parent_package: parentPackage
    })

    return fetch(`${API_V1_ENDPOINT}/work-packages/${workPackageId}/`, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: editData
    })
}

export function deleteWorkPackage(workPackageId) {
    return fetch(`${API_V1_ENDPOINT}/work-packages/${workPackageId}/`, {
        method: 'DELETE',
    })
}

/**
 * DataInfo API
 */

export function getDurationInfos(workPackages) {
    let queryRoot = '?work_package='
    let query = workPackages ? queryRoot + workPackages.join(queryRoot) : ''

    return fetch(`${API_V1_ENDPOINT}/duration-infos${query}`)
}

export function getDurationInfo(dataId) {
    return fetch(`${API_V1_ENDPOINT}/duration-infos/${dataId}/`)
}

export function getDurationInfoActivities(dataId) {
    return fetch(`${API_V1_ENDPOINT}/duration-infos/${dataId}/activities/`)
}

export function createDurationInfo(createData) {
    return fetch(`${API_V1_ENDPOINT}/duration-infos/`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: createData
    })
}

export function editDurationInfo(dataId, editData) {
    return fetch(`${API_V1_ENDPOINT}/duration-infos/${dataId}/`, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: editData
    })
}

export function deleteDurationInfo(dataId) {
    return fetch(`${API_V1_ENDPOINT}/duration-infos/${dataId}/`, {
        method: 'DELETE'
    })
}

/**
 * ProductivityInfo API
 */

export function getProductivityInfos(workPackages) {
    let queryRoot = '?work_package='
    let query = workPackages ? queryRoot + workPackages.join(queryRoot) : ''

    return fetch(`${API_V1_ENDPOINT}/productivity-infos/${query}`)
}

export function getProductivityInfo(dataId) {
    return fetch(`${API_V1_ENDPOINT}/productivity-infos/${dataId}/`)
}

export function getProductivityInfoActivities(dataId) {
    return fetch(`${API_V1_ENDPOINT}/productivity-infos/${dataId}/activities/`)
}

export function createProductivityInfo(createData) {
    return fetch(`${API_V1_ENDPOINT}/productivity-infos/`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: createData
    })
}

export function editProductivityInfo(dataId, editData) {
    return fetch(`${API_V1_ENDPOINT}/productivity-infos/${dataId}/`, {
        method: 'PUT',
        body: editData
    })
}

export function deleteProductivityInfo(dataId) {
    return fetch(`${API_V1_ENDPOINT}/productivity-infos/${dataId}/`, {
        method: 'DELETE'
    })
}

/**
 *  PlannedSchedule API
 */

export function getPlannedSchedules() {
    return fetch(`${API_V1_ENDPOINT}/planned-schedules/`)
}

export function importPlannedScheduleCSV(activityCsvFile, activityResourceCsvFile, dependencyFile, resourceFile) {
    let formData = new FormData()
    formData.append('planned_activity', activityCsvFile)
    formData.append('activity_resource', activityResourceCsvFile)
    formData.append('dependency', dependencyFile)
    formData.append('resource', resourceFile)

    return fetch(`${API_V1_ENDPOINT}/planned-schedules/csv-import/`, {
        method: 'POST',
        body: formData
    })
}

export function deletePlannedSchedules() {
    return fetch(`${API_V1_ENDPOINT}/planned-schedules/delete/`, {
        method: 'DELETE',
    })
}

/**
 * Allocation API
 */

export function getAllocations() {
    return fetch(`${API_V1_ENDPOINT}/allocations/`)
}

export function createAllocations(activities, dataId, isProductivity, mode) {
    let createData = {
        activity: activities,
        data: dataId,
        is_productivity: isProductivity,
        mode: mode
    }

    return fetch(`${API_V1_ENDPOINT}/allocations/`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(createData)
    })
}

export function deleteAllocations() {
    return fetch(`${API_V1_ENDPOINT}/allocations/delete/`, {
        method: 'DELETE'
    })
}

export function finishAllocations() {
    return fetch(`${API_V1_ENDPOINT}/allocations/finish/`)
}


/**
 * Statistics API
 */

export function getHistogramData() {
    return fetch(`${API_V1_ENDPOINT}/histogram/`)
}

export function getScheduleChartData() {
    return fetch(`${API_V1_ENDPOINT}/schedule-chart/`)
}

/**
 * TRUNCATE DATABASE!!!
 */
export function truncateDatabase() {
    return fetch(`/eliminate/`, {
        method: 'DELETE'
    })
}