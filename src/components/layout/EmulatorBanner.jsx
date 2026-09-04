import { useEmulator } from "../../firebase/firebaseConfig";
import "./css/EmulatorBanner.css";

const EmulatorBanner = () => useEmulator
  ? <div className="emulator-banner">MODO PRUEBAS — FIREBASE EMULATOR</div>
  : null;

export default EmulatorBanner;
