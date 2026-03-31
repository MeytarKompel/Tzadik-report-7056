import { Navigate, Route, Routes } from "react-router-dom";
import Home from "../../HomeArea/Home/Home";
import PageNotFound from "../PageNotFound/PageNotFound";
import "./Routing.css";
import LoginPage from "../../LoginPage/LoginPage";
import AdminDashboardPage from "../../AdminDashboardPage/AdminDashboardPage";
import MashkashDashboardPage from "../../MashkashDashboardPage/MashkashDashboardPage";
import ReportPage from "../../ReportPage/ReportPage";

function Routing(): JSX.Element {
    return (
        <div className="Routing">
            <Routes>
                <Route path="/home" element={<Home />} />
                <Route path="/" element={<Navigate to="/home" />} />
                <Route path="*" element={<PageNotFound />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
                <Route path="/mashkash-dashboard" element={<MashkashDashboardPage />} />
                <Route path="/report" element={<ReportPage />} />
            </Routes>
        </div>
    );
}

export default Routing;
