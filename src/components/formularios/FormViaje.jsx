//------------------------------------------------------ externos
import { useState } from "react";
import Swal from "sweetalert2";
//------------------------------------------------------ elementos
import FormMovimientoCuenta from "./FormMovimientoCuenta";
import FormContent from "../funcionales/FormContent";
import FormHeader from "../funcionales/FormHeader";
import TextButton from "../buttons/TextButton";
import Loading from "../../routes/Loading";
//------------------------------------------------------ funciones
import {
  submitCruce,
  submitMovimientoCuenta,
  submitViaje,
} from "./data/Submits";
import { eventos } from "./data/FormContent";
import { useData } from "../../contexto/DataContext";
import { useViajes } from "../../contexto/ViajesContext";
import { usePersonas } from "../../contexto/PersonasContext";
import { useTractores } from "../../contexto/TractoresContext";
import { useFurgones } from "../../contexto/FurgonesContext";
import { generarDocumentos } from "../../functions/docFunctions";
import imgPlantilla from "../../functions/docs/hojaRuta.png";
//------------------------------------------------------ estilos
import "./css/Forms.css";

const FormViaje = ({ elemento = null, onGuardar, onClose }) => {
  const titulo = "Registro";
  const subtitulo = "Viaje";
  const campos = eventos["viajes"];
  const [loading, setLoading] = useState(false);
  const [formMovimientoCuentaVisible, setFormMovimientoCuentaVisible] =
    useState(false);
  const [formData, setFormData] = useState({
    area: "TRAFICO",
    tipo: elemento?.tipo || "",
    operador: elemento?.operador || "",
    persona: elemento?.persona || "",
    tractor: elemento?.tractor || "",
    furgon: elemento?.furgon || [],
    cliente: elemento?.cliente || [],
    adelanto: 0, // total de adelantos (para submit y crear evento de mov de cuenta)
    adelantos: [], // listado de adelantos que se reinicia a cero
    tramos: elemento?.tramos || [],
    detalle: elemento?.detalle || "",
    monto: elemento?.monto || 0,
  });
  const { contadores, ubicaciones, sectores, cuentaCorriente } = useData();
  const [nuevoViaje, setNuevoViaje] = useState(null);
  const { tractores } = useTractores();
  const { furgones } = useFurgones();
  const { personas } = usePersonas();

  const handleCloseFormMovimientoCuenta = () => {
    setFormMovimientoCuentaVisible(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const viajeCreado = await submitViaje(
      formData,
      campos,
      contadores,
      ubicaciones,
      setLoading,
      onGuardar,
      onClose,
      false,
      elemento?.id,
    );

    if (!viajeCreado) return;

    setNuevoViaje(viajeCreado);

    // registrar evento de movimiento de cuenta (por adelantos)

    if (viajeCreado.movimiento) {
      const cuentaPersona = cuentaCorriente.find(
        (cc) => String(cc.dni) === String(viajeCreado.persona),
      );

      await submitMovimientoCuenta(
        {
          viaje: viajeCreado.id,
          tipo: "PAGO",
          operador: viajeCreado.operador,
          persona: cuentaPersona.id,
          monto: viajeCreado.adelanto,
        },
        eventos.cuentaCorriente,
        sectores,
        setLoading,
      );
    }

    // generar cruce de barcaza (opcional)
    const cruce = await Swal.fire({
      title: "Viaje registrado",
      text: "¿Desea generar cruce de barcaza?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí",
      cancelButtonText: "No",
      confirmButtonColor: "#4161bd",
    });

    if (cruce.isConfirmed) {
      await submitCruce(
        {
          viaje: viajeCreado.id,
          persona: viajeCreado.persona,
          tractor: viajeCreado.tractor,
          furgon: viajeCreado.furgon,
        },
        eventos.cruces,
        contadores,
        ubicaciones,
        setLoading,
        onGuardar,
        onClose,
      );

      //const impresion = generarDocumentos("pdf", viajeCreado, imgPlantilla);
      const handleImprimir = async () => {
        const persona = personas.find(
          (ps) => String(ps.dni) === String(viajeCreado.persona),
        );
        const tractor = tractores.find(
          (tr) => String(tr.id) === String(viajeCreado.tractor),
        );

        const idFurgon1 = viajeCreado.furgon?.[0];
        const idFurgon2 = viajeCreado.furgon?.[1];

        const furgon1 = idFurgon1
          ? furgones.find((fg) => String(fg.id) === String(idFurgon1))
          : null;
        const furgon2 = idFurgon2
          ? furgones.find((fg) => String(fg.id) === String(idFurgon2))
          : null;
        const viajeEnriquecido = {
          ...viajeCreado,
          personaCompleta: persona?.nombreCompleto ?? "null o undefinded >:(",
          tractorCompleto: tractor?.label ?? "null o undefinded >:(",

          furgonCompleto: [
            furgon1?.label ?? "null o undefinded >:(",
            furgon2?.label ?? "null o undefinded >:(",
          ],
        };

        debugger;
        console.log("viaje enriquecido", viajeEnriquecido);

        try {
          // 2. Le pasas la variable importada, NO un string manual
          await generarDocumentos("pdf", viajeEnriquecido, imgPlantilla);
          console.log("PDF generado correctamente");
        } catch (error) {
          console.error("Falló la creación del PDF:", error);
        }
      };

      await handleImprimir();
    } else {
      onClose();
    }
  };

  return (
    <>
      <div className="doble-form">
        {loading ? (
          <Loading />
        ) : (
          <div className="doble-form-content">
            <FormHeader
              title={titulo}
              subTitle={`${subtitulo} ${elemento?.id}`}
              onClose={onClose}
            />

            <div className="doble-form-modal">
              <FormContent
                elemento={elemento}
                campos={campos}
                data={formData}
                setData={setFormData}
                isDouble={true}
              />
            </div>
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
      {formMovimientoCuentaVisible && (
        <FormMovimientoCuenta
          elemento={nuevoViaje}
          onClose={handleCloseFormMovimientoCuenta}
          desdeViaje={true}
        />
      )}
    </>
  );
};

export default FormViaje;
