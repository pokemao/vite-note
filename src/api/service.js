import axios from 'axios'
// vite会把解析.env.*之后获得的环境变量放入import.meta.env对象中，给我们的项目源代码使用
const {VITE_BASE_URL} = import.meta.env

const service = axios.create({
    baseURL: VITE_BASE_URL
})

export default service
