import { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import authService from "../../Services/AuthService";

interface ProtectedRouteProps {
    children: ReactElement;
    allowedRoles?: string[];
}

function ProtectedRoute(props: ProtectedRouteProps): JSX.Element {
    const user = authService.getUser();

    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (props.allowedRoles && !props.allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return props.children;
}

export default ProtectedRoute;