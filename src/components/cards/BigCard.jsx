import { FaUser as LogoPerson } from "react-icons/fa";
import { FaTruckFront as LogoTruck } from "react-icons/fa6";
import { PiShippingContainerFill as LogoContainer } from "react-icons/pi";
import "./css/BigCard.css";

const BigCard = ({ title, value1, value2, value3, logo }) => {
  return (
    <>
      <div className="big-card container">
        <div className="row big">
          <div className="col-md-2">
            <img src={logo} alt="" className="card-logo"></img>
          </div>
          <div className="col-md">
            <div className="card-section">
              <h3 className="big-card-title">{title}</h3>
            </div>
            <div className="card-section">
              <p className="big-card-value">
                {value1} empleados <LogoPerson className="small-logo" />
              </p>
              <p className="big-card-value">
                {value2} tractores <LogoTruck className="small-logo" />
              </p>
              <p className="big-card-value">
                {value3} furgones <LogoContainer className="small-logo" />
              </p>
            </div>
          </div>
        </div>
        <div className="row small-row small">
          <div className="col-md-2 small1">
            <img src={logo} alt="" className="card-logo-small"></img>
          </div>
          <div className="col-md small2">
            <div className="big-card-section">
              <p className="big-card-value">
                <LogoPerson className="small-logo" />
                {value1}
              </p>
            </div>
            <div className="big-card-section">
              <p className="big-card-value">
                <LogoTruck className="small-logo" />
                {value2}
              </p>
            </div>
            <div className="big-card-section">
              <p className="big-card-value">
                <LogoContainer className="small-logo" />
                {value2}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BigCard;
