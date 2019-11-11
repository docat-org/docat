import axios from 'axios'

const port = process.env.VUE_APP_BACKEND_PORT || location.port
const host = process.env.VUE_APP_BACKEND_HOST || location.hostname
export default axios.create({
	baseURL: `${location.protocol}//${host}:${port}`
})
