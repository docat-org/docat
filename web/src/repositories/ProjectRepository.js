import Repository from '@/repositories/Repository'

const resource = '/'
export default {

    /**
     * Returns all projects
     */
    get() {
        return Repository.get(`${resource}`)
    },

    /**
     * Returns the information of a given project
     * @param {string} projectName Name of the project
     */
    getProject(projectName) {
        return Repository.get(`${resource}/${projectName}`)
    },

    /**
     * Returns the logo URL of a given project
     * @param {string} projectName Name of the project
     */
    getProjectLogoURL(projectName) {
        return `${Repository.defaults.baseURL}${resource}/${projectName}/logo.jpg`
    }
}