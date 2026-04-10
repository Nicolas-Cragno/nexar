import { Link } from "react-router-dom";
import Logo from "../../assets/logos/logoPrincipal.png";
import "./css/Header.css";

const Header = () => {
  return (
    <>
      <header>
        <img src={Logo} alt="" className="header-logo" />
        <nav>
          <ul className="header-navbar">
            <li>
              <Link to="/">Home</Link>
            </li>
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
