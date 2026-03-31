import { NavLink } from "react-router-dom";
import "./Home.css";

function Home(): JSX.Element {
    return (
        <div className="Home">
            <NavLink to="/login">Go to Login page</NavLink>
        </div>
    );
}

export default Home;
