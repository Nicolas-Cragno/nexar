//------------------------------------------------------ externos
import Swal from "sweetalert2";
import { increment, serverTimestamp, doc, runTransaction } from "firebase/firestore";
//------------------------------------------------------ funciones
import {
    verificarCamposObligatorios,
    formatearCampoParaCarga,
    formatearCampoFirestore,
    formatearMonto
} from "../../../functions/dataFunctions";
import { db } from "../../../firebase/firebaseConfig";
import { submit, update, statusOptions, eventCode } from "../../../functions/abmFunctions";

const CUIT_TRANSCAN = "33719349949";

// elementos

export const submitTractor = async (formData, campos, loading, onGuardar, onClose, modoEdicion = false, idElemento = null) => {
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

export const submitMovimientoCuenta = async (
    formData,
    campos,
    ubicaciones,
    contadores,
    sucursal,
    loading,
    onGuardar,
    onClose
) => {

    const verificacion = verificarCamposObligatorios(campos, formData);
    if (!verificacion) return null;

    loading(true);

    try {

        // --------------------------------------------------
        // Preparar información
        // --------------------------------------------------

        const elementoAGuardar = campos.reduce((acc, cp) => {

            if (cp.use !== "database") return acc;

            acc[cp.key] = formatearCampoParaCarga(
                formData[cp.key],
                cp.dato
            );

            return acc;

        }, {});


        // compatibilidad con el modelo actual
        const cuenta = String(
            elementoAGuardar.cuenta ||
            elementoAGuardar.persona ||
            ""
        );


        if (!cuenta) {
            throw new Error(
                "No se ha indicado una cuenta corriente."
            );
        }


        const monto = Number(elementoAGuardar.monto) || 0;

        if (monto <= 0) {
            throw new Error(
                "El monto del movimiento debe ser mayor a cero."
            );
        }


        // --------------------------------------------------
        // Confirmación
        // --------------------------------------------------

        const result = await confirmDataSwal(
            "Movimiento de cuenta",
            elementoAGuardar
        );


        if (!result.isConfirmed) {
            return null;
        }


        // --------------------------------------------------
        // Generar ID recién después de confirmar
        // --------------------------------------------------

        const { id: identificador } = await eventCode(
            "movimientos",
            ubicaciones,
            contadores,
            sucursal
        );


        // --------------------------------------------------
        // Determinar cuentas
        // --------------------------------------------------

        const {
            cuentaSuma,
            cuentaResta
        } = obtenerCuentasMovimiento(
            elementoAGuardar.tipo,
            cuenta
        );


        const movimientoRef = doc(
            db,
            "movimientos",
            identificador
        );

        const cuentaSumaRef = doc(
            db,
            "cuentaCorriente",
            String(cuentaSuma)
        );

        const cuentaRestaRef = doc(
            db,
            "cuentaCorriente",
            String(cuentaResta)
        );


        // --------------------------------------------------
        // Transacción
        // --------------------------------------------------

        await runTransaction(db, async (transaction) => {

            const movimientoSnap =
                await transaction.get(movimientoRef);

            const cuentaSumaSnap =
                await transaction.get(cuentaSumaRef);

            const cuentaRestaSnap =
                await transaction.get(cuentaRestaRef);


            if (movimientoSnap.exists()) {
                throw new Error(
                    `El movimiento ${identificador} ya existe.`
                );
            }


            if (!cuentaSumaSnap.exists()) {
                throw new Error(
                    `No existe la cuenta corriente ${cuentaSuma}.`
                );
            }


            if (!cuentaRestaSnap.exists()) {
                throw new Error(
                    `No existe la cuenta corriente ${cuentaResta}.`
                );
            }


            transaction.set(
                movimientoRef,
                {
                    id: identificador,

                    fecha: serverTimestamp(),

                    ...elementoAGuardar,

                    // mantener compatibilidad actual
                    persona: cuenta,

                    estado:
                        elementoAGuardar.estado ?? false,
                }
            );


            transaction.update(
                cuentaSumaRef,
                {
                    monto: increment(monto),
                    ultimaModificacion: serverTimestamp(),
                }
            );


            transaction.update(
                cuentaRestaRef,
                {
                    monto: increment(-monto),
                    ultimaModificacion: serverTimestamp(),
                }
            );
        });

        statusOptions({
            status: "success"
        });


        if (onGuardar) {
            await onGuardar();
        }


        if (onClose) {
            onClose();
        }


        return {
            elemento: {
                id: identificador,
                ...elementoAGuardar,
                persona: cuenta,
                estado:
                    elementoAGuardar.estado ?? false,
            }
        };


    } catch (error) {

        console.error(
            "[Error] al registrar movimiento de cuenta:",
            error
        );


        statusOptions({
            status: "error"
        });


        Swal.fire({
            title: "Error",
            text:
                error?.message ||
                "No hemos podido procesar la solicitud.",
            icon: "error",
            confirmButtonText: "Entendido",
            confirmButtonColor: "#4161bd",
        });


        return null;

    } finally {

        loading(false);

    }
};
export const submitLiquidacion = async ({ formData, ubicaciones, contadores, sucursal, loading, onGuardar, onClose }) => {
    loading(true);
    try {
        const seleccionados = formData?.movimientos || [];
        const cuenta = String(formData?.cuenta || formData?.persona || "");
        if (!cuenta) throw new Error("No se ha indicado una cuenta corriente.");
        if (!formData?.operador) throw new Error("No se ha indicado un operador.");
        if (!seleccionados.length) throw new Error("Debe seleccionar al menos un movimiento para liquidar.");
        if (seleccionados.some((movimiento) => !["ADELANTO", "PAGO", "COBRO", "GASTO"].includes(movimiento.tipo))) {
            throw new Error("La selección contiene un tipo de movimiento no compatible.");
        }
        const liquidado = seleccionados.find((movimiento) => movimiento.estado === true);
        if (liquidado) throw new Error(`El movimiento ${liquidado.id} ya se encuentra liquidado.`);

        const saldoEsperado = calcularSaldoLiquidacion(seleccionados);
        const tipoEsperado = obtenerTipoMovimientoCierre(saldoEsperado);
        const montoEsperado = Math.abs(saldoEsperado);
        const esAdelanto = tipoEsperado === "ADELANTO";
        const confirmacion = await Swal.fire({
            title: esAdelanto ? "Confirmar adelanto" : "Confirmar liquidación",
            html: `<p>Se liquidarán <strong>${seleccionados.length}</strong> movimientos.</p>
                <p>Saldo seleccionado: <strong>$ ${formatearMonto(saldoEsperado)}</strong></p>
                ${tipoEsperado
                    ? `<p>${esAdelanto ? "¿Desea generar" : "Se generará"} un movimiento <strong>${tipoEsperado}</strong> por <strong>$ ${formatearMonto(montoEsperado)}</strong>?</p>`
                    : "<p>El saldo es cero. No se generará un movimiento compensatorio.</p>"}`,
            icon: esAdelanto ? "warning" : "question",
            showCancelButton: true,
            confirmButtonText: esAdelanto ? "Sí, generar adelanto" : "Liquidar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#4161bd",
        });
        if (!confirmacion.isConfirmed) return null;

        const { id: idLiquidacion } = await eventCode("liquidaciones", ubicaciones, contadores, sucursal);
        let idMovimientoCierre = null;
        if (tipoEsperado) {
            ({ id: idMovimientoCierre } = await eventCode("movimientos", ubicaciones, contadores, sucursal));
        }

        const liquidacionRef = doc(db, "liquidaciones", idLiquidacion);
        const cierreRef = idMovimientoCierre ? doc(db, "movimientos", idMovimientoCierre) : null;
        const movimientosRefs = seleccionados.map((movimiento) => doc(db, "movimientos", String(movimiento.id)));
        const cuentaRef = doc(db, "cuentaCorriente", cuenta);
        const cuentas = tipoEsperado ? obtenerCuentasMovimiento(tipoEsperado, cuenta) : null;
        const sumaRef = cuentas ? doc(db, "cuentaCorriente", String(cuentas.cuentaSuma)) : null;
        const restaRef = cuentas ? doc(db, "cuentaCorriente", String(cuentas.cuentaResta)) : null;
        let resultadoReal;

        await runTransaction(db, async (transaction) => {
            const snaps = [];
            for (const movimientoRef of movimientosRefs) {
                const snap = await transaction.get(movimientoRef);
                if (!snap.exists()) throw new Error("Uno de los movimientos seleccionados ya no existe.");
                snaps.push(snap);
            }
            const liquidacionSnap = await transaction.get(liquidacionRef);
            const cuentaSnap = await transaction.get(cuentaRef);
            const cierreSnap = cierreRef ? await transaction.get(cierreRef) : null;
            const sumaSnap = sumaRef ? await transaction.get(sumaRef) : null;
            const restaSnap = restaRef ? await transaction.get(restaRef) : null;

            if (liquidacionSnap.exists()) throw new Error(`La liquidación ${idLiquidacion} ya existe.`);
            if (!cuentaSnap.exists()) throw new Error(`No existe la cuenta corriente ${cuenta}.`);
            if (cierreSnap?.exists()) throw new Error(`El movimiento ${idMovimientoCierre} ya existe.`);

            const actuales = snaps.map((snap) => ({ id: snap.id, ...snap.data() }));
            if (actuales.some((movimiento) => !["ADELANTO", "PAGO", "COBRO", "GASTO"].includes(movimiento.tipo))) {
                throw new Error("Uno de los movimientos tiene un tipo no compatible.");
            }
            const yaLiquidado = actuales.find((movimiento) => movimiento.estado === true);
            if (yaLiquidado) throw new Error(`El movimiento ${yaLiquidado.id} ya fue liquidado.`);
            if (actuales.some((movimiento) => String(movimiento.cuenta || movimiento.persona) !== cuenta)) {
                throw new Error("Todos los movimientos deben pertenecer a la misma cuenta corriente.");
            }

            const saldoReal = calcularSaldoLiquidacion(actuales);
            const tipoReal = obtenerTipoMovimientoCierre(saldoReal);
            const montoReal = Math.abs(saldoReal);
            if (tipoReal !== tipoEsperado || montoReal !== montoEsperado) {
                throw new Error("Los movimientos cambiaron. Revise el saldo y vuelva a confirmar la liquidación.");
            }
            if (tipoReal && !sumaSnap.exists()) throw new Error(`No existe la cuenta corriente ${cuentas.cuentaSuma}.`);
            if (tipoReal && !restaSnap.exists()) throw new Error(`No existe la cuenta corriente ${cuentas.cuentaResta}.`);

            transaction.set(liquidacionRef, {
                id: idLiquidacion, fecha: serverTimestamp(), cuenta, persona: cuenta,
                movimientos: actuales.map((movimiento) => movimiento.id),
                saldoLiquidado: saldoReal, tipoCierre: tipoReal,
                movimientoCierre: idMovimientoCierre, operador: formData?.operador || null,
                detalle: formData?.detalle || "", estado: true,
            });
            movimientosRefs.forEach((movimientoRef) => transaction.update(movimientoRef, {
                estado: true, liquidacion: idLiquidacion, fechaLiquidacion: serverTimestamp(),
            }));
            if (tipoReal) {
                transaction.set(cierreRef, {
                    id: idMovimientoCierre, fecha: serverTimestamp(), cuenta, persona: cuenta,
                    viaje: null, tipo: tipoReal, monto: montoReal,
                    detalle: "Movimiento compensatorio automático",
                    operador: formData?.operador || null, estado: true,
                    liquidacion: idLiquidacion, esCierreLiquidacion: true,
                });
                transaction.update(sumaRef, { monto: increment(montoReal), ultimaModificacion: serverTimestamp() });
                transaction.update(restaRef, { monto: increment(-montoReal), ultimaModificacion: serverTimestamp() });
            }
            resultadoReal = { saldoLiquidado: saldoReal, tipoCierre: tipoReal, cantidad: actuales.length };
        });

        await Swal.fire({
            title: "Liquidación registrada",
            html: `<p>ID: <strong>${idLiquidacion}</strong></p>
                <p>Monto liquidado: <strong>$ ${formatearMonto(resultadoReal.saldoLiquidado)}</strong></p>
                <p>Movimientos: <strong>${resultadoReal.cantidad}</strong></p>
                <p>Cierre: <strong>${resultadoReal.tipoCierre || "SIN MOVIMIENTO"}</strong></p>`,
            icon: "success", confirmButtonText: "Entendido", confirmButtonColor: "#4161bd",
        });
        if (onGuardar) await onGuardar();
        if (onClose) onClose();
        return { liquidacion: {
            id: idLiquidacion, cuenta, persona: cuenta,
            movimientos: seleccionados.map((movimiento) => movimiento.id),
            saldoLiquidado: resultadoReal.saldoLiquidado,
            tipoCierre: resultadoReal.tipoCierre, movimientoCierre: idMovimientoCierre,
        }};
    } catch (error) {
        console.error("[Error] al registrar liquidación:", error);
        Swal.fire({
            title: "Error", text: error?.message || "No hemos podido procesar la liquidación.",
            icon: "error", confirmButtonText: "Entendido", confirmButtonColor: "#4161bd",
        });
        return null;
    } finally {
        loading(false);
    }
};

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

            const { id: identificador } = await eventCode("viajes", ubicaciones, contadores, sucursal);

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

// helpers para liquidacion y movimiento de cuenta


export const calcularImpactoMovimiento = (movimiento) => {
    const monto = Number(movimiento?.monto) || 0;

    switch (movimiento?.tipo) {
        case "ADELANTO":
        case "PAGO":
            return monto;

        case "COBRO":
        case "GASTO":
            return -monto;

        default:
            return 0;
    }
};


export const calcularSaldoLiquidacion = (movimientos = []) => {
    return movimientos.reduce((total, movimiento) => {
        return total + calcularImpactoMovimiento(movimiento);
    }, 0);
};


export const obtenerTipoMovimientoCierre = (saldo) => {
    if (saldo > 0) {
        return "COBRO";
    }

    if (saldo < 0) {
        return "ADELANTO";
    }

    return null;
};


export const obtenerCuentasMovimiento = (tipo, cuenta) => {
    switch (tipo) {
        case "COBRO":
        case "GASTO":
            return {
                cuentaSuma: CUIT_TRANSCAN,
                cuentaResta: cuenta,
            };

        case "ADELANTO":
        case "PAGO":
            return {
                cuentaSuma: cuenta,
                cuentaResta: CUIT_TRANSCAN,
            };

        default:
            throw new Error(`Tipo de movimiento no valido: ${tipo || "SIN TIPO"}.`);
    }
};

/// asasfga

