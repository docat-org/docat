import Repository from './Repository'

const resource = '/'
export default {
    get() {
        return Repository.get(`${resource}`)
    },
    getProject(project) {
        return Repository.get(`${resource}/${project}`)
    }
}