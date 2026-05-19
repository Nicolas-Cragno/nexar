import { Link } from "react-router-dom";
import LogoDefault from "../../assets/logos/logoPrincipal.png";
import "./css/Card.css";
import PlusButton from "../buttons/PlusButton";

const CardText = ({
  title,
  text,
  logo = LogoDefault,
  route = null,
  onClick = null,
  onClick2 = null,
}) => {
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
        <div className="card2">
          <div className="card-section-line">
            <img src={logo} alt="" className="card-logo" />
            <div className="card-section-info">
              <h1 className="card-title2">{title}</h1>
              <p className="card-text link" onClick={onClick}>
                {text}
              </p>
            </div>
            <div className="col-md-2">
              <PlusButton onClick={onClick2} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CardText;
