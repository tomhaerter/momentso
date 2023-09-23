import { computed } from "vue"

const useToken = () => {
    return computed({
        set: (value) => {
            localStorage.setItem('token', value)
        },
        get: () => {
            return localStorage.getItem('token')
        }
    })
}

export default useToken