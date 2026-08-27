import { NavLink } from "react-router-dom";
import Logo from "../../assets/logos/LOGO_PRINCIPAL.png";
import { useAuth } from "../../contexto/AuthContext";
import { confirmLogout } from "../../functions/confirmLogout";
import "./css/Header.css";

const Header = () => {
  const { fullUser, logout } = useAuth();

  return (
    <>
      <header>
        <NavLink to="/">
          <img src={Logo} alt="" className="header-logo" />
        </NavLink>
        <nav>
          <ul className="header-navbar">
            <li>
              <NavLink to="/operaciones">Operaciones</NavLink>
            </li>
            <li>
              <NavLink to="/cuentas">Cuentas</NavLink>
            </li>
            <li>
              <NavLink to="/recursos">Recursos</NavLink>
            </li>
            <li className="header-session">
              <span>{fullUser?.nombre}</span>
              <button type="button" onClick={() => confirmLogout(logout)}>
                Cerrar sesión
              </button>
            </li>
          </ul>
        </nav>
      </header>
    </>
  );
};

export default Header;
