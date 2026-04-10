import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";
import "./css/Layout.css";

const Layout = () => {
  return (
    <div className="layout">
      <Header />
      <div className="page-content">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
