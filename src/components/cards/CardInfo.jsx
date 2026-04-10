// ----------------------------------------------------------------------- imports externos
import { Link } from "react-router-dom";
import Swal from "sweetalert2";

// ----------------------------------------------------------------------- imports internos
import RepairLogo from "../../assets/logos/repairLogo.png";
import DeniedLogo from "../../assets/logos/deniedLogo.png";
import "./css/CardInfo.css";

const CardInfo = ({
  title,
  route,
  backColor,
  img,
  state = true,
  access = true,
  small = false,
}) => {
  const handleClick = (e) => {
    if (!state) {
      e.preventDefault();
      Swal.fire({
        title: "Recurso no disponible",
        text: "Es posible que se encuentre en reparación y/o producción",
        icon: "warning",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#4161bd",
      });
    }
  };

  return (
    <Link
      to={state ? route : "#"}
      className="card-info-route"
      onClick={handleClick}
      tabIndex={state ? 0 : -1} // opcional: evita foco si no disponible
      aria-disabled={!state}
    >
      <div
        className={!small ? "card-info" : "card-info-small"}
        style={{ backgroundColor: !state ? "#b4b4b4" : backColor }}
      >
        <h1 className="card-info-title2">{title}</h1>

        {!small ? (
          access ? (
            !state ? (
              <img src={RepairLogo} alt="" className="card-info-img"></img>
            ) : (
              <img src={img} alt="" className="card-info-img"></img>
            )
          ) : (
            <img src={DeniedLogo} alt="" className="card-info-img"></img>
          )
        ) : null}
      </div>
    </Link>
  );
};

export default CardInfo;
