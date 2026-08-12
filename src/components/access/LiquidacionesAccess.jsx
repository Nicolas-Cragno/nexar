import { useState } from "react";
import Logo from "../../assets/logos/LOGO_BANK.png";
import Access from "./Access";
import FormLiquidacion from "../formularios/FormLiquidacion";
import { columnas } from "../modales/data/Columnas";
import { useLiquidaciones } from "../../contexto/LiquidacionesContext";

const LiquidacionesAccess = () => {
  const { liquidaciones } = useLiquidaciones();
  const [formVisible, setFormVisible] = useState(false);

  return (
    <>
      <Access
        coleccion={liquidaciones}
        entity="liquidaciones"
        title="LIQUIDACIONES"
        logo={Logo}
        headers={columnas.liquidaciones}
        text={`${liquidaciones.length} REGISTROS`}
        onClickForm={() => setFormVisible(true)}
        editable={false}
      />
      {formVisible && (
        <FormLiquidacion onClose={() => setFormVisible(false)} />
      )}
    </>
  );
};

export default LiquidacionesAccess;
