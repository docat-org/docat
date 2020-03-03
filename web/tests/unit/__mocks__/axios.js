/* eslint-disable no-undef */
const mockAxios = jest.genMockFromModule('axios')

// this is the key to fix the axios.create() undefined error!
mockAxios.create = jest.fn(() => mockAxios)
mockAxios.defaults.baseURL = 'https://do.cat'

export default mockAxios