// ----------------------------------------------------------------------- imports externos
import { useState } from "react";
import { GiAutoRepair as LogoRepair } from "react-icons/gi";
import Swal from "sweetalert2";

// ----------------------------------------------------------------------- imports internos
import FormMovimientoStock from "../forms/FormMovimientoStock";
import "./css/CardButton.css";

const CardButton = ({ title, backColor, state = true }) => {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const handleClick = (e) => {
    e.preventDefault();
    if (!state) {
      Swal.fire({
        title: "Recurso no disponible",
        text: "Es posible que se encuentre en reparación y/o producción",
        icon: "warning",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#4161bd",
      });
    } else {
      setMostrarFormulario(true);
    }
  };

  const handleClose = () => {
    setMostrarFormulario(false);
  };

  return (
    <>
      <div className="card-button-route" onClick={handleClick}>
        <div className="card-button" style={{ backgroundColor: backColor }}>
          <h1 className="card-button-title2">{title}</h1>
          {!state && (
            <span className="card-button-alert">
              no disponible <LogoRepair className="card-button-alert-logo" />
            </span>
          )}
        </div>
      </div>

      {mostrarFormulario && <FormMovimientoStock onClose={handleClose} />}
    </>
  );
};

export default CardButton;
