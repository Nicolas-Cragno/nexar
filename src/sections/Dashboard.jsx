import "./css/Dashboard.css";
import Logo from "../assets/logos/LOGO_PRINCIPAL.png";
import InfoModal from "../components/modales/InfoModal";
import DashboardLogo from "../components/logos/DashboardLogo";

const Dashboard = () => {
  return (
    <section className="dashboard page">
      <div className="dashboard-content">
        <img src={Logo} alt="Nexar" className="dashboard-logo" />
        <h1 className="dashboard-title">¡Bienvenido!</h1>
        {/*<p className="dashboard-subtitle">Nexar</p> */}
      </div>
    </section>
  );
};

export default Dashboard;
