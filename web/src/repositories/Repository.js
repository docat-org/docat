import axios from 'axios'

const port = '8000';
export default axios.create({
	baseURL: `${location.protocol}//${location.hostname}:${port}`
})
