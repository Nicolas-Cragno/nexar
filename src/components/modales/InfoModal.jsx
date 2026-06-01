import "./css/InfoModal.css";
import { useData } from "../../contexto/DataContext";
import { useEffect, useState } from "react";
import { formatearMonto } from "../../functions/dataFunctions";

const InfoModal = ({ cuit = "33719349949" }) => {
  const { empresas, cuentaCorriente } = useData();
  const [title, setTitle] = useState(cuit);
  const [personas, setPersonas] = useState(0);
  const [tractores, setTractores] = useState(0);
  const [furgones, setFurgones] = useState(0);
  const [cuenta, setCuenta] = useState(0);

  useEffect(() => {
    const empresaData = empresas?.find((em) => em.id === cuit);
    const cuentaData = cuentaCorriente?.find((ct) => ct.id === cuit);
    const montoFull = cuentaData?.monto
      ? formatearMonto(cuentaData.monto)
      : formatearMonto(0);

    setTitle(cuentaData?.nombre);
    setPersonas(empresaData?.personas);
    setTractores(empresaData?.tractores);
    setFurgones(empresaData?.furgones);
    setCuenta(montoFull);
  }, [empresas, cuentaCorriente, cuit]);

  return (
    <div className="info-modal-container">
      <div className="info-modal">
        <h1>{title}</h1>

        <div className="info-list">
          <div className="info-item">
            <span>Empleados</span>
            <strong>{personas}</strong>
          </div>

          <div className="info-item">
            <span>Tractores</span>
            <strong>{tractores}</strong>
          </div>

          <div className="info-item">
            <span>Furgones</span>
            <strong>{furgones}</strong>
          </div>

          <div className="info-item">
            <span>Cuenta corriente</span>
            <strong>${cuenta}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
