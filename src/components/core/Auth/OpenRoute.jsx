// This will prevent authenticated users from accessing this route
// All authenticated user will directly redirected to my-profile dashboard
import { useSelector } from "react-redux"
import { Navigate } from "react-router-dom"

function OpenRoute({ children }) {
    const { token } = useSelector((state) => state.auth)

    if (token === null) {
        return children
    } else {
        return <Navigate to="/dashboard/my-profile" />
    }
}

export default OpenRoute