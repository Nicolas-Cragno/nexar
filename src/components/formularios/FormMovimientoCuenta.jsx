//------------------------------------------------------ externos
import { useState, useEffect } from "react";
//------------------------------------------------------ elementos
import FormContent from "../funcionales/FormContent";
import FormHeader from "../funcionales/FormHeader";
import TextButton from "../buttons/TextButton";
import Loading from "../../routes/Loading";
//------------------------------------------------------ funciones
import { submitMovimientoCuenta } from "./data/Submits";
import { eventos } from "./data/FormContent";
import { useData } from "../../contexto/DataContext";
import { useViajes } from "../../contexto/ViajesContext";
//------------------------------------------------------ estilos
import "./css/Forms.css";
import { usePersonas } from "../../contexto/PersonasContext";

const FormMovimientoCuenta = ({
  elemento = null,
  onGuardar,
  onClose,
  desdeViaje = false,
}) => {
  const titulo = "Movimiento";
  const subtitulo = "Cuenta Corriente";
  const campos = eventos["cuentaCorriente"];

  const [loading, setLoading] = useState(false);
  const [readOnly, setReadOnly] = useState(false);

  const [formData, setFormData] = useState({
    area: elemento?.area || "ADMINISTRACION",
    viaje: elemento?.viaje || "",
    tipo: elemento?.tipo || "",
    operador: elemento?.operador || "",
    persona: elemento?.personas || "",
    detalle: elemento?.detalle || "",
    monto: elemento?.monto || 0,
  });

  const { ubicaciones, contadores, cuentaCorriente, personas } = useData();
  const { viajes } = useViajes();

  useEffect(() => {
    if (!desdeViaje || !elemento) return;

    setFormData({
      area: "ADMINISTRACION",
      viaje: elemento?.id,
      tipo: "PAGO",
      operador: elemento?.operador,
      persona: elemento?.persona,
      tractor: elemento?.tractor,
      detalle: `ADELANTO VIAJE ${elemento?.id}`,
      monto: elemento?.monto || 0,
    });

    setReadOnly(true);
  }, [elemento, desdeViaje]);

  useEffect(() => {
    if (desdeViaje) return;

    if (!formData.viaje) {
      setReadOnly(false);
      return;
    }

    const viajeSeleccionado = viajes.find((vj) => vj.id === formData.viaje);
    let cuentaPersona = null;

    if (!viajeSeleccionado) {
      setReadOnly(false);
      return;
    } else {
      cuentaPersona = cuentaCorriente.find(
        (cc) => String(cc.dni) === String(viajeSeleccionado.persona),
      );
    }

    setFormData((prev) => ({
      ...prev,
      tipo: "GASTO",
      persona: cuentaPersona.id,
    }));

    setReadOnly(true);
  }, [formData.viaje, viajes, desdeViaje]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const personaOperadora = formData.operador;
    const sucursalOperadora = personaOperadora?.sucursal || "01";

    await submitMovimientoCuenta(
      formData,
      campos,
      ubicaciones,
      contadores,
      sucursalOperadora,
      setLoading,
      onGuardar,
      onClose,
      //elemento?.id, // NO preparado para editar movimiento existente
    );
  };

  return (
    <div className="form">
      {loading ? (
        <Loading />
      ) : (
        <div className="form-content">
          <FormHeader title={titulo} subTitle={subtitulo} onClose={onClose} />

          <FormContent
            elemento={elemento}
            campos={campos}
            data={formData}
            setData={setFormData}
            readOnly={readOnly}
            desdeViaje={desdeViaje}
          />

          <div className="form-buttons">
            <TextButton
              text={"Guardar"}
              type={"button"}
              onClick={handleSubmit}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FormMovimientoCuenta;
