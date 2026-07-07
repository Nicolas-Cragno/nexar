import { NavLink } from "react-router-dom";
import "./css/Lowbar.css";
import Logo from "../../assets/logos/LOGO_PRINCIPAL.png";
import { MdEvent as EventLogo } from "react-icons/md";
import { GrResources as ResourcesLogo } from "react-icons/gr";

export default function Lowbar() {
  return (
    <div className={`lowbar`}>
      <nav className="lowbar-nav">
        <NavLink to="/movimientos" className="nav-item">
          <EventLogo size={50} className="nav-logo" />
        </NavLink>
        <NavLink to="/" className="nav-item">
          <img src={Logo} alt="" className="nav-logo" />
        </NavLink>
        <NavLink to="/recursos" className="nav-item">
          <ResourcesLogo size={50} className="nav-logo" />
        </NavLink>
      </nav>
    </div>
  );
}
