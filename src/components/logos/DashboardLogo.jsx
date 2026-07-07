import "./css/DashboardLogo.css";
import Logo from "../../assets/logos/LOGO_PRINCIPAL.png";

const DashboardLogo = ({ logo }) => {
  return (
    <div className="dashboard-logo-container">
      <div className="dashboard-logo-card">
        <img src={logo} alt="Logo principal" className="dashboard-logo-image" />
      </div>
    </div>
  );
};

export default DashboardLogo;
