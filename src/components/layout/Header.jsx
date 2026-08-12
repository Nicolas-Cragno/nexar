import { NavLink } from "react-router-dom";
import Logo from "../../assets/logos/LOGO_PRINCIPAL.png";
import "./css/Header.css";

const Header = () => {
  return (
    <>
      <header>
        <NavLink to="/">
          <img src={Logo} alt="" className="header-logo" />
        </NavLink>
        <nav>
          <ul className="header-navbar">
            <li></li>
            <li>
              <NavLink to="/operaciones">Operaciones</NavLink>
            </li>
            <li>
              <NavLink to="/cuentas">Cuentas</NavLink>
            </li>
            <li>
              <NavLink to="/recursos">Recursos</NavLink>
            </li>
          </ul>
        </nav>
      </header>
    </>
  );
};

export default Header;
