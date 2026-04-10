import { Link } from "react-router-dom";
import "./css/Card.css";

const Card = ({ title, value, route = null, onClick = null }) => {
  return (
    <>
      {route ? (
        <Link to={route} className="card-route">
          <div className="card">
            <div className="card-section">
              <h3 className="card-title">{title}</h3>
            </div>
            <div className="card-section">
              <p className="card-value big">{value} activos</p>
            </div>
          </div>
        </Link>
      ) : (
        <div className="card" onClick={onClick}>
          <div className="card-section">
            <h3 className="card-title">{title}</h3>
          </div>
          <div className="card-section">
            <p className="card-value big">{value} activos</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Card;
