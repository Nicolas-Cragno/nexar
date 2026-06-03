//------------------------------------------------------ externos
import Swal from "sweetalert2";
import { increment, serverTimestamp } from "firebase/firestore";
//------------------------------------------------------ funciones
import {
    verificarCamposObligatorios,
    formatearCampoParaCarga,
    formatearCampoFirestore
} from "../../../functions/dataFunctions";
import { submit, update, statusOptions, codeGenerator, codeTravel } from "../../../functions/abmFunctions";


// elementos

export const submitTractor = async (formData, campos, loading, onGuardar, onClose, modoEdicion = false, idElemento = null) => {
    const verificacion = verificarCamposObligatorios(campos, formData);
    const CUIT_TRANSCAN = "33719349949";
    if (!verificacion) return;

    loading(true); // ahora si empieza a cargar ...

    let campoId;

    const elementoAGuardar = campos.reduce((acc, cp) => {
        if (cp.use !== "database") return acc; // solo se guardan los campos que tengan el "use" = "database" en elementos["tractores"]
        if (cp.isId) campoId = formData[cp.key];

        // let valor = formData[cp.key];
        let valor = formatearCampoParaCarga(formData[cp.key], cp.dato);

        acc[cp.key] = valor;
        return acc;
    }, {});

    try {
        if (modoEdicion) {
            const result = await confirmDataSwal("Modificación de Tractor", elementoAGuardar);

            if (!result.isConfirmed) {
                loading(false);
                return;
            }

            const modificacion = await update(idElemento, "tractores", elementoAGuardar, onGuardar);

            statusOptions(modificacion);
        } else {
            const result = await confirmDataSwal("Nuevo Tractor", elementoAGuardar);

            if (!result.isConfirmed) {
                loading(false);
                return;
            }

            // avanzar con la carga
            const carga = await submit("tractores", { id: campoId, ...elementoAGuardar, estado: true }, onGuardar);
            if (carga && String(elementoAGuardar.empresa) === String(CUIT_TRANSCAN)) {
                await update(String(CUIT_TRANSCAN), "empresas", { tractores: increment(1) });
            }

            statusOptions(carga);
        }
        onClose();
    } catch (error) {
        console.error("[Error] al intentar guardar", error);

        Swal.fire({
            title: "Error",
            text: "No hemos podido procesar la solicitud.",
            icon: "error",
            confirmButtonText: "Entendido",
            confirmButtonColor: "#4161bd",
        });
    } finally {
        loading(false);
    }
}
export const submitFurgon = async (formData, campos, loading, onGuardar, onClose, modoEdicion = false, idElemento = null) => {
    const verificacion = verificarCamposObligatorios(campos, formData);
    const CUIT_TRANSCAN = "33719349949";
    if (!verificacion) return;

    loading(true); // ahora si empieza a cargar ...

    let campoId;

    const elementoAGuardar = campos.reduce((acc, cp) => {
        if (cp.use !== "database") return acc; // solo se guardan los campos que tengan el "use" = "database" en elementos["tractores"]
        if (cp.isId) campoId = formData[cp.key];

        // let valor = formData[cp.key];
        let valor = formatearCampoParaCarga(formData[cp.key], cp.dato);

        acc[cp.key] = valor;
        return acc;
    }, {});

    try {
        if (modoEdicion) {
            const result = await confirmDataSwal("Modificación de Furgón", elementoAGuardar);

            if (!result.isConfirmed) {
                loading(false);
                return;
            }

            const modificacion = await update(idElemento, "furgones", elementoAGuardar, onGuardar);

            statusOptions(modificacion);
        } else {
            const result = await confirmDataSwal("Nuevo Furgón", elementoAGuardar);

            if (!result.isConfirmed) {
                loading(false);
                return;
            }

            // avanzar con la carga
            const carga = await submit("furgones", { id: campoId, ...elementoAGuardar, estado: true }, onGuardar);
            if (carga && String(elementoAGuardar.empresa) === String(CUIT_TRANSCAN)) {
                await update(String(CUIT_TRANSCAN), "empresas", { furgones: increment(1) });
            }
            statusOptions(carga);
        }
        onClose();
    } catch (error) {
        console.error("[Error] al intentar guardar", error);

        Swal.fire({
            title: "Error",
            text: "No hemos podido procesar la solicitud.",
            icon: "error",
            confirmButtonText: "Entendido",
            confirmButtonColor: "#4161bd",
        });
    } finally {
        loading(false);
    }
}
export const submitPersona = async (formData, campos, loading, onGuardar, onClose, modoEdicion = false, idElemento = null) => {
    const verificacion = verificarCamposObligatorios(campos, formData);
    const CUIT_TRANSCAN = "33719349949";
    if (!verificacion) return;

    loading(true); // ahora si empieza a cargar ...

    let campoId;

    const elementoAGuardar = campos.reduce((acc, cp) => {
        if (cp.use !== "database") return acc; // solo se guardan los campos que tengan el "use" = "database" en elementos["tractores"]
        if (cp.isId) campoId = formData[cp.key];

        // let valor = formData[cp.key];
        let valor = formatearCampoParaCarga(formData[cp.key], cp.dato);

        acc[cp.key] = valor;
        return acc;
    }, {});

    // guardar elemento
    try {
        if (modoEdicion) {
            // preguntar al usuario si quiere confirmar
            const result = await confirmDataSwal("Edición de Persona", elementoAGuardar);

            if (!result.isConfirmed) {
                loading(false);
                return;
            }
            // avanzar a modificar
            const modificacion = await update(idElemento, "personas", { ...elementoAGuardar, ultimaModificacion: serverTimestamp() }, onGuardar);

            statusOptions(modificacion);
        } else {
            // preguntar al usuario si quiere confirmar
            const result = await confirmDataSwal("Ingreso de Persona", elementoAGuardar);

            if (!result.isConfirmed) {
                loading(false);
                return;
            }

            // avanzar con la carga
            const carga = await submit("personas", { id: campoId, ...elementoAGuardar, estado: true, alta: serverTimestamp() }, onGuardar);

            if (carga) {
                await submit("cuentaCorriente", { id: String(elementoAGuardar.cuit), estado: true, monto: 0, nombre: `${elementoAGuardar.apellido}, ${elementoAGuardar.nombres}` });

                if (String(elementoAGuardar.empresa) === String(CUIT_TRANSCAN)) {
                    await update(String(CUIT_TRANSCAN), "empresas", { personas: increment(1) });
                }
            }

            statusOptions(carga);

        }
        onClose();
    } catch (error) {
        console.error("[Error] al intentar guardar", error);

        Swal.fire({
            title: "Error",
            text: "No hemos podido procesar la solicitud.",
            icon: "error",
            confirmButtonText: "Entendido",
            confirmButtonColor: "#4161bd",
        });
    } finally {
        loading(false);
    }
}

// eventos
export const submitMovimientoCuenta = async (formData, campos, sectores, loading, onGuardar, onClose) => {
    const CUIT_TRANSCAN = "33719349949";
    const verificacion = verificarCamposObligatorios(campos, formData);
    if (!verificacion) return;
    loading(true); // ahora si empieza a cargar ...

    // guardar elemento
    try {
        const { id: identificador } = await codeGenerator(formData.area, sectores, true);

        const elementoAGuardar = campos.reduce((acc, cp) => {
            if (cp.use !== "database") return acc;

            let valor = formatearCampoParaCarga(formData[cp.key], cp.dato);

            acc[cp.key] = valor;
            return acc;
        }, {});

        const result = await confirmDataSwal("Movimiento de cuenta", elementoAGuardar);

        if (!result.isConfirmed) {
            loading(false);
            return;
        }


        let cuentaSuma, cuentaResta;

        if (elementoAGuardar.tipo === "COBRO") {
            cuentaSuma = CUIT_TRANSCAN;
            cuentaResta = elementoAGuardar.persona;
        } else {
            cuentaSuma = elementoAGuardar.persona;
            cuentaResta = CUIT_TRANSCAN;
        }

        const carga = async () => {
            const cargaMovimiento = await submit("movimientos", { id: identificador, fecha: serverTimestamp(), ...elementoAGuardar });
            const cargaCuentaSuma = await update(cuentaSuma, "cuentaCorriente", { monto: increment(elementoAGuardar.monto) });
            const cargaCuentaResta = await update(cuentaResta, "cuentaCorriente", { monto: increment(-elementoAGuardar.monto) });

            if (cargaMovimiento) console.log("[Movimiento] Movimiento de cuenta corriente registrado.");
            if (cargaCuentaSuma) console.log("[Cuenta Receptora] Movimiento de cuenta corriente registrado.");
            if (cargaCuentaResta) console.log("[Cuenta aportante] Movimiento de cuenta corriente registrado.");

            if (cargaMovimiento && cargaCuentaResta && cargaCuentaSuma) {
                return true;
            } else {
                return false;
            }
        };

        const resultadoCarga = await carga();


        statusOptions(resultadoCarga);
        if (onGuardar) onGuardar();

        onClose();
    } catch (error) {
        console.error("[Error] al intentar guardar", error);

        Swal.fire({
            title: "Error",
            text: "No hemos podido procesar la solicitud.",
            icon: "error",
            confirmButtonText: "Entendido",
            confirmButtonColor: "#4161bd",
        });
    } finally {
        loading(false);
    }
}

export const submitViaje = async (formData, campos, contadores, ubicaciones, loading, onGuardar, onClose) => {
    const CUIT_TRANSCAN = "33719349949";
    const verificacion = verificarCamposObligatorios(campos, formData);
    if (!verificacion) return;
    loading(true); // ahora si empieza a cargar ...

    // guardar elemento
    try {
        const { id: identificador } = await codeTravel(ubicaciones, contadores);

        const elementoAGuardar = campos.reduce((acc, cp) => {
            if (cp.use !== "database") return acc;

            let valor = formatearCampoParaCarga(formData[cp.key], cp.dato);

            acc[cp.key] = valor;
            return acc;
        }, {});

        const result = await confirmDataSwal("Viaje", elementoAGuardar);


        if (!result.isConfirmed) {
            loading(false);
            return;
        }

        const carga = async () => {
            const cargaViaje = await submit("viajes", { id: identificador, fecha: serverTimestamp(), estado: true, ...elementoAGuardar });

            if (cargaViaje) {
                return true;
            } else {
                return false;
            }
        };

        const resultadoCarga = await carga();


        statusOptions(resultadoCarga);
        if (onGuardar) onGuardar();

        onClose();
    } catch (error) {
        console.error("[Error] al intentar guardar", error);

        Swal.fire({
            title: "Error",
            text: "No hemos podido procesar la solicitud.",
            icon: "error",
            confirmButtonText: "Entendido",
            confirmButtonColor: "#4161bd",
        });
    } finally {
        loading(false);
    }
}

export const submitCruce = async (formData, campos, contadores, ubicaciones, loading, onGuardar, onClose) => {
    const verificacion = verificarCamposObligatorios(campos, formData);
    if (!verificacion) return;
    loading(true); // ahora si empieza a cargar ...

    // guardar elemento
    try {
        const elementoAGuardar = campos.reduce((acc, cp) => {
            if (cp.use !== "database") return acc;

            let valor = formatearCampoParaCarga(formData[cp.key], cp.dato);

            acc[cp.key] = valor;
            return acc;
        }, {});

        const result = await confirmDataSwal("Cruce", elementoAGuardar);


        if (!result.isConfirmed) {
            loading(false);
            return;
        }

        const { id: identificador } = await codeTravel(ubicaciones, contadores, "cruces");

        const carga = async () => {
            const cargaCruce = await submit("cruces", { id: identificador, fecha: serverTimestamp(), estado: true, ...elementoAGuardar });

            if (cargaCruce) {
                return true;
            } else {
                return false;
            }
        };

        const resultadoCarga = await carga();


        statusOptions(resultadoCarga);
        if (onGuardar) onGuardar();

        onClose();
    } catch (error) {
        console.error("[Error] al intentar guardar", error);

        Swal.fire({
            title: "Error",
            text: "No hemos podido procesar la solicitud.",
            icon: "error",
            confirmButtonText: "Entendido",
            confirmButtonColor: "#4161bd",
        });
    } finally {
        loading(false);
    }
}

// swal/ficha que muestra lo que se está por cargar

const confirmDataSwal = async (title, data) => {
    const htmlCampos = Object.entries(data)
        .map(
            ([key, value]) => `
        <div style="
          display:flex;
          justify-content:space-between;
          padding:8px 0;
          border-bottom:1px solid #eee;
        ">
          <strong>${key.toUpperCase()}</strong>
          <span>
            ${formatearCampoFirestore(value)}
          </span>
        </div>
        `
        )
        .join("");

    return await Swal.fire({
        title,
        html: `
      <div style="
        text-align:left;
        max-height:350px;
        overflow:auto;
      ">
        ${htmlCampos}
      </div>
    `,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Guardar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#4161bd",
    });
};

