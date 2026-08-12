import { NavLink } from "react-router-dom";
import "./css/Lowbar.css";
import Logo from "../../assets/logos/LOGO_PRINCIPAL.png";
import { MdEvent as EventLogo } from "react-icons/md";
import { GrResources as ResourcesLogo } from "react-icons/gr";
import { MdAccountBalanceWallet as AccountsLogo } from "react-icons/md";

export default function Lowbar() {
  return (
    <div className={`lowbar`}>
      <nav className="lowbar-nav">
        <NavLink to="/operaciones" className="nav-item">
          <EventLogo className="nav-logo" />
          <span className="nav-text">Operaciones</span>
        </NavLink>
        <NavLink to="/" className="nav-item">
          <img src={Logo} alt="" className="nav-logo" />
          <span className="nav-text">Inicio</span>
        </NavLink>
        <NavLink to="/cuentas" className="nav-item">
          <AccountsLogo className="nav-logo" />
          <span className="nav-text">Cuentas</span>
        </NavLink>
        <NavLink to="/recursos" className="nav-item">
          <ResourcesLogo size={50} className="nav-logo" />
          <span className="nav-text">Recursos</span>
        </NavLink>
      </nav>
    </div>
  );
}
