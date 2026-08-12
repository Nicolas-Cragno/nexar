//------------------------------------------------------ externos
import { useMemo, useState } from "react";
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
import { useEmpresas } from "../../contexto/EmpresasContext";
import { useMovimientos } from "../../contexto/MovimientosContext";
import { useCruces } from "../../contexto/CrucesContext";

const FormViaje = ({ elemento = null, onGuardar, onClose }) => {
  const titulo = "Registro";
  const subtitulo = "Viaje";
  const campos = eventos["viajes"];
  const camposMov = eventos["cuentaCorriente"];
  const camposCruce = eventos["cruces"];
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
  const { empresas } = useEmpresas();
  const { movimientos } = useMovimientos();
  const { cruces } = useCruces();
  const { viajes } = useViajes();

  const conflictosRecursos = useMemo(() => {
    const viajeId = elemento?.id;
    const activosAjenos = viajes.filter(
      (viaje) => viaje.estado === true && String(viaje.id) !== String(viajeId),
    );
    const conflictos = [];
    const persona = personas.find((ps) => String(ps.id) === String(formData.persona));
    const tractor = tractores.find((tr) => String(tr.id) === String(formData.tractor));

    const viajePersona = activosAjenos.find(
      (viaje) => String(viaje.persona) === String(formData.persona),
    );
    const viajeTractor = activosAjenos.find(
      (viaje) => String(viaje.tractor) === String(formData.tractor),
    );

    if (persona && ((persona.enViaje && String(persona.viajeActivo) !== String(viajeId)) || viajePersona)) {
      conflictos.push(`El chofer ${persona.id} está afectado al viaje ${viajePersona?.id || persona.viajeActivo || "desconocido"}.`);
    }
    if (tractor && ((tractor.enViaje && String(tractor.viajeActivo) !== String(viajeId)) || viajeTractor)) {
      conflictos.push(`El tractor ${tractor.id} está afectado al viaje ${viajeTractor?.id || tractor.viajeActivo || "desconocido"}.`);
    }

    (formData.furgon || []).forEach((id) => {
      const furgon = furgones.find((fg) => String(fg.id) === String(id));
      const viajeFurgon = activosAjenos.find((viaje) =>
        (viaje.furgon || []).some((furgonId) => String(furgonId) === String(id)),
      );
      if (furgon && ((furgon.enViaje && String(furgon.viajeActivo) !== String(viajeId)) || viajeFurgon)) {
        conflictos.push(`El furgón ${id} está afectado al viaje ${viajeFurgon?.id || furgon.viajeActivo || "desconocido"}.`);
      }
    });

    return conflictos;
  }, [elemento?.id, formData.persona, formData.tractor, formData.furgon, viajes, personas, tractores, furgones]);

  const handleCloseFormMovimientoCuenta = () => {
    setFormMovimientoCuentaVisible(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (conflictosRecursos.length) {
      await Swal.fire({
        title: "Recursos no disponibles",
        html: conflictosRecursos.map((mensaje) => `<p>${mensaje}</p>`).join(""),
        icon: "error",
        confirmButtonColor: "#4161bd",
      });
      return;
    }

    const personaOperadora = personas.find(
      (persona) => String(persona.id) === String(formData.operador),
    );
    const sucursalOperadora = personaOperadora?.sucursal || "01";

    const viajeCreado = await submitViaje(
      formData,
      campos,
      ubicaciones,
      contadores,
      sucursalOperadora,
      setLoading,
      onGuardar,
      onClose,
      viajes,
      elemento,
    );

    if (!viajeCreado) return;

    setNuevoViaje(viajeCreado);


    let anticipoCreado = null;
    let cruceCreado = null;

    // registrar evento de movimiento de cuenta (por adelantos)
    if (viajeCreado.movimiento) {
      const cuentaPersona = cuentaCorriente.find(
        (cc) => String(cc.dni) === String(viajeCreado.persona),
      );

      anticipoCreado = await submitMovimientoCuenta(
        {
          viaje: viajeCreado.id,
          tipo: "PAGO",
          operador: viajeCreado.operador,
          persona: cuentaPersona.id,
          monto: viajeCreado.adelanto,
        },
        camposMov,
        ubicaciones,
        contadores,
        sucursalOperadora,
        setLoading,
        onGuardar,
        onClose,
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
      cruceCreado = await submitCruce(
        {
          viaje: viajeCreado.id,
          persona: viajeCreado.persona,
          tractor: viajeCreado.tractor,
          furgon: viajeCreado.furgon,
        },
        camposCruce,
        ubicaciones,
        contadores,
        sucursalOperadora,
        setLoading,
        onGuardar,
        onClose,
      );
    }
      
    const handleImprimir = async () => {
      const persona = personas.find(
        (ps) => String(ps.dni) === String(viajeCreado.persona),
      );
      const tractor = tractores.find(
        (tr) => String(tr.id) === String(viajeCreado.tractor),
      );

      const clientesAsignados = empresas.filter((em) =>
        (viajeCreado.cliente || []).some(
          (idGuardado) => String(idGuardado) === String(em.id),
        ),
      );


      const anticiposAsignados = movimientos?.filter(
        (mv) => String(mv.viaje) === String(viajeCreado.id),
      );

      if (viajeCreado.adelanto !== undefined) {
        anticiposAsignados.unshift(anticipoCreado);
      }

      const crucesBarcazaAsignados = cruces.filter(
        (cr) => String(cr.viaje) === String(viajeCreado.id),
      );

      if (cruceCreado !== undefined) {
        crucesBarcazaAsignados.unshift(cruceCreado);
      }


      const nombresClientes = clientesAsignados.map((c) => c.label);

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
        personaCompleta: persona?.label ?? "",
        tractorCompleto: tractor?.label ?? "",

        furgonCompleto: [
          furgon1?.label ?? "",
          furgon2?.label ?? "",
        ],

        anticiposCompletos: anticiposAsignados,
        crucesBarcazaCompletos: crucesBarcazaAsignados,

        clientesCompletos: nombresClientes,
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
      
    onClose();
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
              subTitle={`${subtitulo} ${elemento ? elemento.id : ""}`}
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
              {conflictosRecursos.length > 0 && (
                <div className="complete">
                  {conflictosRecursos.map((mensaje) => (
                    <div key={mensaje}>{mensaje}</div>
                  ))}
                </div>
              )}
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
