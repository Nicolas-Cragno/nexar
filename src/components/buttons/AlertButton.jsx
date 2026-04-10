import { IoMdAlert as AlertLogo } from "react-icons/io";
import { IoRefreshCircle as RefreshLogo } from "react-icons/io5";
import "./css/Buttons.css";

const AlertButton = ({
  txtFront = "Hay actualizaciones",
  txtBack = "Actualizar",
  type = "button",
  onClick,
}) => {
  return (
    <button type={type} className="alert-btn" onClick={onClick}>
      <span className="btn-text visible">
        <AlertLogo />
        {txtFront}
      </span>
      <span className="btn-text hidden">
        <RefreshLogo />
        {txtBack}
      </span>
    </button>
  );
};

export default AlertButton;
