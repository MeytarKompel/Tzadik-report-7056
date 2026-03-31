import { NavLink, Outlet, useNavigate } from "react-router-dom";
import authService from "../../../Services/AuthService";
import UserModel from "../../../Models/UserModel";
import "./Layout.css";

function Layout(): JSX.Element {
    const navigate = useNavigate();
    const user: UserModel | null = authService.getUser();

    function handleLogout(): void {
        authService.logout();
        navigate("/");
    }

    return (
        <div className="layout">
            <header className="layout-header">
                <div className="layout-top">
                    <h2>מערכת ניהול מלאי</h2>

                    <div className="user-section">
                        <span>
                            שלום, {user?.fullName}
                        </span>

                        <button type="button" onClick={handleLogout}>
                            התנתק
                        </button>
                    </div>
                </div>

                <nav className="layout-nav">
                    <NavLink
                        to="/report"
                        className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                    >
                        דיווח
                    </NavLink>

                    {(user?.role === "mashkash" || user?.role === "admin") && (
                        <NavLink
                            to="/mashkash-dashboard"
                            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                        >
                            ניהול יחידה
                        </NavLink>
                    )}

                    {user?.role === "admin" && (
                        <NavLink
                            to="/admin-dashboard"
                            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                        >
                            ניהול מערכת
                        </NavLink>
                    )}
                </nav>
            </header>

            <main className="layout-content">
                <Outlet />
            </main>
        </div>
    );
}

export default Layout;