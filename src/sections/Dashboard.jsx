import "./css/sections.css";
import Logo from "../assets/logos/LOGO_PRINCIPAL2.png";
import InfoModal from "../components/modales/InfoModal";
import DashboardLogo from "../components/logos/DashboardLogo";

const Dashboard = () => {
  return (
    <section className="section-container page">
      <DashboardLogo logo={Logo} />
      <InfoModal />
    </section>
  );
};

export default Dashboard;
