import { Link } from "react-router-dom";
import LogoDefault from "../../assets/logos/logotruck.svg";
import "./css/Card.css";

const Card = ({ title, logo = LogoDefault, route = null, onClick = null }) => {
  return (
    <>
      {route ? (
        <Link to={route} className="card-route">
          <div className="card2">
            <div className="card-section-line">
              <img src={logo} alt="" className="card-logo" />
              <h3 className="card-title2">{title}</h3>
            </div>
          </div>
        </Link>
      ) : (
        <div className="card2" onClick={onClick}>
          <div className="card-section-line">
            <img src={logo} alt="" className="card-logo" />
            <h3 className="card-title2">{title}</h3>
          </div>
        </div>
      )}
    </>
  );
};

export default Card;
