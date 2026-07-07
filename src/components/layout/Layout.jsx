import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import Footer from "./Footer";
import Header from "./Header";
import Lowbar from "./Lowbar";
import "./css/Layout.css";

const Layout = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(
      "(max-width:768px) and (hover:none) and (pointer:coarse)",
    );

    const update = () => setIsMobile(media.matches);

    update();

    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return (
    <div className="layout">
      {!isMobile && <Header />}
      <div className="page-content">
        <Outlet />
      </div>
      {!isMobile ? <Footer /> : <Lowbar />}
    </div>
  );
};

export default Layout;
