import { useEffect, useState } from "react";
import "./css/Clock.css";

const Clock = () => {
  const [fechaHora, setFechaHora] = useState(new Date());

  useEffect(() => {
    const now = new Date();
    const msHastaSiguienteMinuto = (60 - now.getSeconds()) * 1000;

    const timeout = setTimeout(() => {
      setFechaHora(new Date());

      const intervalo = setInterval(() => {
        setFechaHora(new Date());
      }, 60000);

      return () => clearInterval(intervalo);
    }, msHastaSiguienteMinuto);

    return () => clearTimeout(timeout);
  }, []);

  const formatearDiaMes = (date) =>
    date.toLocaleDateString("es-ES", { day: "numeric", month: "long" }); // Ej: 3 de septiembre

  const formatearAnio = (date) =>
    date.toLocaleDateString("es-ES", { year: "numeric" }); // Ej: 2025

  const formatearHora = (date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); // Ej: 13:20

  return (
    <div className="clock">
      <h1 className="clock-date">{formatearDiaMes(fechaHora)}</h1>
      <h2 className="clock-year">{formatearAnio(fechaHora)}</h2>
      <p className="clock-hour">{formatearHora(fechaHora)} hs</p>
    </div>
  );
};

export default Clock;
