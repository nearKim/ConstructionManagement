export function fetch(input, init = {}) {
    return window.fetch(input, Object.assign({
        credentials: 'same-origin'
    }, init))
}

/**
 * Input data의 work_package들을 분류하여 BootstrapTable이 이해할 수 있는 형태로 변환한다
 * {parent_package_name: child_package_name } 형식으로 반환해야 한다
 * @param data: api로 부터 받아온 데이터들
 */
export function convertData4BootstrapTable(dataArr) {
    dataArr.map(data => {
        // created와 updated는 빼줍시다
        delete data.created
        delete data.modified

        // WorPackage가 있는 경우 대,소분류 나눠서 각각 넣어준다
        if (data['work_package']) {
            let workPackages = data.work_package
            delete data.work_package

            // 먼저 Parent Package들을 뽑아낸다
            let parentPackages = workPackages.filter(wp => {
                return wp.parent_package == null
            })

            // Child Package들을 대상으로 로직을 적용한다.
            workPackages.filter(wp => {
                    return wp.parent_package != null
                }
            ).map(cp => {
                    // Child Package의 parent package를 찾는다. 1개의 Parent는 1개의 Child를 가지는 것이 보장된다.
                    let pp = parentPackages.find(pp => {
                        return pp.id === cp.parent_package
                    })

                    // data에 parent:child 형식으로 넣어준다.
                    data[pp.package_name] = cp.package_name
                }
            )
        }

        // Activity인 경우 resource를 name으로 바꿔넣어준다
        if (data['resource']) {
            data['resource'] = data['resource']['name']
        }
    })

    return dataArr
}

