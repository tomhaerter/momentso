import { computed } from "vue"

const useToken = () => {
    return computed({
        set: (value) => {
            if (!value) return
            localStorage.setItem('token', value)
        },
        get: () => {
            return localStorage.getItem('token')
        }
    })
}

export default useToken