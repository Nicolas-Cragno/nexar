import Logo from "../assets/logos/logoPrincipal.png";
import "./css/Loading.css";

const Loading = () => {
  return (
    <div className="loading-page">
      <img src={Logo} alt="" className="loading-logo" />
    </div>
  );
};

export default Loading;
