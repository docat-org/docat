import axios from 'axios'

const port = process.env.VUE_APP_BACKEND_PORT || location.port
export default axios.create({
	baseURL: `${location.protocol}//${location.hostname}:${port}`
})
