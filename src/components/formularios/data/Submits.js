//------------------------------------------------------ externos
import Swal from "sweetalert2";
import { increment, serverTimestamp } from "firebase/firestore";
//------------------------------------------------------ funciones
import {
    verificarCamposObligatorios,
    formatearCampoParaCarga,
    formatearCampoFirestore
} from "../../../functions/dataFunctions";
import { submit, update, statusOptions, eventCode } from "../../../functions/abmFunctions";


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
                await submit("cuentaCorriente", { id: String(elementoAGuardar.cuit), estado: true, monto: 0, nombre: `${elementoAGuardar.apellido}, ${elementoAGuardar.nombres}`, dni: campoId });

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
export const submitEmpresa = async (formData, campos, loading, onGuardar, onClose, modoEdicion = false, idElemento = null) => {
    const verificacion = verificarCamposObligatorios(campos, formData);
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
            const result = await confirmDataSwal("Modificación de empresa", elementoAGuardar);

            if (!result.isConfirmed) {
                loading(false);
                return;
            }

            const modificacion = await update(idElemento, "empresas", elementoAGuardar, onGuardar);

            statusOptions(modificacion);
        } else {
            const result = await confirmDataSwal("Nueva empresa", elementoAGuardar);

            if (!result.isConfirmed) {
                loading(false);
                return;
            }

            // avanzar con la carga
            const carga = await submit("empresas", { id: campoId, ...elementoAGuardar }, onGuardar);
            if (carga) {
                await submit("cuentaCorriente", { id: String(elementoAGuardar.cuit), estado: true, monto: 0, nombre: `${elementoAGuardar.razonSocial}` });
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

export const submitMovimientoCuenta = async (formData, campos, ubicaciones, contadores, sucursal, loading, onGuardar, onClose) => {
    const CUIT_TRANSCAN = "33719349949";
    const verificacion = verificarCamposObligatorios(campos, formData);
    if (!verificacion) return;
    loading(true); // ahora si empieza a cargar ...

    // guardar elemento
    try {
        const { id: identificador } = await eventCode("movimientos", ubicaciones, contadores, sucursal);
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

        if (elementoAGuardar.tipo === "COBRO" || elementoAGuardar.tipo === "GASTO") {
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

        if (onClose) onClose();



        if (resultadoCarga) {
            return {
                elemento: { id: identificador, ...elementoAGuardar }
            };
        }
        return null;



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

export const submitViaje = async (formData, campos, ubicaciones, contadores, sucursal, loading, onGuardar, onClose, elemento = null) => {
    const modoEdicion = elemento;
    const verificacion = verificarCamposObligatorios(campos, formData);
    if (!verificacion) return;
    loading(true); // ahora si empieza a cargar ...

    // guardar elemento
    try {
        if (modoEdicion) {
            const elementoAGuardar = campos.reduce((acc, cp) => {
                if (cp.use !== "database") return acc;

                let valor = formatearCampoParaCarga(formData[cp.key], cp.dato);

                acc[cp.key] = valor;
                return acc;
            }, {});

            const result = await confirmDataSwal("Viaje", elementoAGuardar);


            if (!result.isConfirmed) {
                return null;
            }

            const viajeEditado = {
                ultimaModificacion: serverTimestamp(),
                ...elementoAGuardar,
            };

            const resultadoCarga = await update(elemento.id,
                "viajes",
                viajeEditado
            );

            statusOptions(resultadoCarga);


            if (!resultadoCarga) return null;

            if (onGuardar) onGuardar();


            return viajeEditado;
        } else {

            const { id: identificador } = await eventCode("viajes", ubicaciones, contadores, sucursal);

            const elementoAGuardar = campos.reduce((acc, cp) => {
                if (cp.use !== "database") return acc;

                let valor = formatearCampoParaCarga(formData[cp.key], cp.dato);

                acc[cp.key] = valor;
                return acc;
            }, {});

            const result = await confirmDataSwal("Viaje", elementoAGuardar);


            if (!result.isConfirmed) {
                return null;
            }

            const nuevoViaje = {
                id: identificador,
                fecha: serverTimestamp(),
                estado: true,
                movimiento: elementoAGuardar.adelanto > 0,
                ...elementoAGuardar,
            };

            const resultadoCarga = await submit(
                "viajes",
                nuevoViaje
            );

            statusOptions(resultadoCarga);

            /* lo hace directamente el formViaje
                if (nuevoViaje.movimiento) {
                // automaticamente cargar movimiento de cuenta

                await submitMovimientoCuenta({
                    fecha: serverTimestamp(),
                    viaje: nuevoViaje.id,
                    tipo: "PAGO", //para que se tome la cuenta de la persona/chofer para asignar el cash
                    operador: nuevoViaje.operador || "", // debe llega si o si
                    persona: nuevoViaje.persona || "", // debe llega si o si
                    monto: nuevoViaje.adelanto,
                    detalle: `ADELANTO ASIGNADO EN EL VIAJE ${nuevoViaje.id}`
                }, camposMov, sectores, loading, onGuardar, onClose);
            }

            */

            if (!resultadoCarga) return null;

            if (onGuardar) onGuardar();

            return nuevoViaje;
        }
    } catch (error) {
        console.error("[Error] al intentar guardar", error);

        Swal.fire({
            title: "Error",
            text: "No hemos podido procesar la solicitud.",
            icon: "error",
            confirmButtonText: "Entendido",
            confirmButtonColor: "#4161bd",
        });

        return null;
    } finally {
        loading(false);
    }
}

export const submitCruce = async (formData, campos, ubicaciones, contadores, sucursal, loading, onGuardar, onClose) => {
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

        const { id: identificador } = await eventCode("cruces", ubicaciones, contadores, sucursal);

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

        if (onClose) onClose();



        if (resultadoCarga) {
            return {
                elemento: { id: identificador, ...elementoAGuardar }
            };
        }
        return null;



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

// estados

export const submitFinViaje = async (
    id,
    state = false,
    callback = null
) => {
    const result = await Swal.fire({
        title: id,
        text: "¿Desea finalizar el viaje?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, finalizar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#4161bd",
    });

    if (!result.isConfirmed) return false;

    try {
        const resultado = await update(id, "viajes", {
            estado: state,
            fechaFin: serverTimestamp(),
        });

        statusOptions({
            status: resultado ? "success" : "error"
        });

        if (resultado && callback) {
            await callback();
        }

        return resultado;
    } catch (error) {
        console.error("[Error] al modificar estado", error);

        Swal.fire({
            title: "Error",
            text: "No hemos podido procesar la solicitud.",
            icon: "error",
            confirmButtonText: "Entendido",
            confirmButtonColor: "#4161bd",
        });

        return false;
    }
};

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

