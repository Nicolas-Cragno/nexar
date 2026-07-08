import { Link } from "react-router-dom";
import Logo from "../../assets/logos/LOGO_PRINCIPAL.png";
import "./css/Header.css";

const Header = () => {
  return (
    <>
      <header>
        <Link to="/">
          <img src={Logo} alt="" className="header-logo" />
        </Link>
        <nav>
          <ul className="header-navbar">
            <li></li>
            <li>
              <Link to="/movimientos">Movimientos</Link>
            </li>
            <li>
              <Link to="/recursos">Recursos</Link>
            </li>
          </ul>
        </nav>
      </header>
    </>
  );
};

export default Header;
