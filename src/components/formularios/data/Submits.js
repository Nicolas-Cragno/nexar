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
import { asignarNrosAdelanto } from "../../../functions/adelantos";

const CUIT_TRANSCAN = "33719349949";

// elementos

export const submitTractor = async (formData, campos, loading, onGuardar, onClose, modoEdicion = false, idElemento = null) => {
    const verificacion = verificarCamposObligatorios(campos, formData);
    if (!verificacion) return;

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

            if (!result.isConfirmed) return;

            loading(true);
            const modificacion = await update(idElemento, "tractores", elementoAGuardar, onGuardar);

            statusOptions(modificacion);
        } else {
            const result = await confirmDataSwal("Nuevo Tractor", elementoAGuardar);

            if (!result.isConfirmed) return;

            loading(true);
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

            if (!result.isConfirmed) return;

            loading(true);
            const modificacion = await update(idElemento, "furgones", elementoAGuardar, onGuardar);

            statusOptions(modificacion);
        } else {
            const result = await confirmDataSwal("Nuevo Furgón", elementoAGuardar);

            if (!result.isConfirmed) return;

            loading(true);
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

            if (!result.isConfirmed) return;

            loading(true);
            // avanzar a modificar
            const modificacion = await update(idElemento, "personas", { ...elementoAGuardar, ultimaModificacion: serverTimestamp() }, onGuardar);

            statusOptions(modificacion);
        } else {
            // preguntar al usuario si quiere confirmar
            const result = await confirmDataSwal("Ingreso de Persona", elementoAGuardar);

            if (!result.isConfirmed) return;

            loading(true);
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

            if (!result.isConfirmed) return;

            loading(true);
            const modificacion = await update(idElemento, "empresas", elementoAGuardar, onGuardar);

            statusOptions(modificacion);
        } else {
            const result = await confirmDataSwal("Nueva empresa", elementoAGuardar);

            if (!result.isConfirmed) return;

            loading(true);
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

        loading(true);


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

export const submitMovimientosCuenta = async ({
    datosComunes,
    movimientos,
    ubicaciones,
    sucursal,
    loading,
    onGuardar,
    onClose,
}) => {
    const movimientosNormalizados = movimientos.map((movimiento) => ({
        tipo: formatearCampoParaCarga(movimiento.tipo, "text"),
        monto: formatearCampoParaCarga(movimiento.monto, "number"),
        detalle: formatearCampoParaCarga(movimiento.detalle, "text"),
    }));
    const datosNormalizados = {
        viaje: formatearCampoParaCarga(datosComunes.viaje, "text"),
        operador: formatearCampoParaCarga(datosComunes.operador, "number"),
        persona: String(datosComunes.persona || ""),
    };
    const errorValidacion = validarCargaMovimientos(
        datosNormalizados,
        movimientosNormalizados,
    );

    if (errorValidacion) {
        await Swal.fire({
            title: "No se puede registrar la carga",
            text: errorValidacion,
            icon: "error",
            confirmButtonColor: "#4161bd",
        });
        return null;
    }

    const resumen = resumirMovimientos(movimientosNormalizados);
    const confirmacion = await confirmarCargaMovimientos(
        movimientosNormalizados.length,
        resumen,
    );

    if (!confirmacion.isConfirmed) return null;

    loading(true);

    try {
        const sucursalOriginal = String(sucursal || "01");
        const ubicacion = ubicaciones.find(
            (item) => String(item.id).toLowerCase() === sucursalOriginal.toLowerCase(),
        );
        const prefijo = String(ubicacion?.id || sucursalOriginal).padStart(3, "0");
        const codigoSucursalAdelantos = String(ubicacion?.id || sucursalOriginal).padStart(2, "0");
        const contadorRef = doc(db, "contadores", "movimientos");
        const contadorAdelantosRef = doc(db, "contadores", "adelantos");
        const cuentaRef = doc(db, "cuentaCorriente", datosNormalizados.persona);
        const transcanRef = doc(db, "cuentaCorriente", CUIT_TRANSCAN);
        const hayPagos = movimientosNormalizados.some((movimiento) => movimiento.tipo === "PAGO");

        const elementos = await runTransaction(db, async (transaction) => {
            const contadorSnapshot = await transaction.get(contadorRef);
            const contadorAdelantosSnapshot = hayPagos
                ? await transaction.get(contadorAdelantosRef)
                : null;
            const cuentaSnapshot = await transaction.get(cuentaRef);
            const transcanSnapshot = await transaction.get(transcanRef);

            if (!contadorSnapshot.exists()) {
                throw new Error("No existe el contador de movimientos.");
            }
            if (hayPagos && !contadorAdelantosSnapshot.exists()) {
                throw new Error("No existe el contador de adelantos.");
            }
            if (!cuentaSnapshot.exists()) {
                throw new Error(`No existe la cuenta corriente ${datosNormalizados.persona}.`);
            }
            if (!transcanSnapshot.exists()) {
                throw new Error(`No existe la cuenta corriente ${CUIT_TRANSCAN}.`);
            }

            const contador = contadorSnapshot.data();
            const contadorAdelantos = contadorAdelantosSnapshot?.data() || {};
            const ultimoSucursal = Number(contador[sucursalOriginal]);
            const ultimoGeneral = Number(contador.ultimo);

            if (!Number.isFinite(ultimoSucursal)) {
                throw new Error(
                    `El contador movimientos no tiene un correlativo válido para la sucursal ${sucursalOriginal}.`,
                );
            }

            const adelantos = asignarNrosAdelanto(
                movimientosNormalizados,
                codigoSucursalAdelantos,
                hayPagos ? contadorAdelantos[codigoSucursalAdelantos] : 0,
            );
            const elementosConId = adelantos.elementos.map((movimiento, index) => {
                const orden = ultimoSucursal + index + 1;
                return {
                    id: `${prefijo}-${String(orden).padStart(8, "0")}`,
                    orden,
                    ...datosNormalizados,
                    ...movimiento,
                    estado: false,
                };
            });
            const referencias = elementosConId.map((movimiento) =>
                doc(db, "movimientos", movimiento.id),
            );
            const existentes = [];

            for (const referencia of referencias) {
                existentes.push(await transaction.get(referencia));
            }

            const duplicado = existentes.find((snapshot) => snapshot.exists());
            if (duplicado) {
                throw new Error(`El movimiento ${duplicado.id} ya existe.`);
            }

            const siguienteSucursal = ultimoSucursal + elementosConId.length;
            transaction.update(contadorRef, {
                ultimo: Number.isFinite(ultimoGeneral)
                    ? ultimoGeneral + elementosConId.length
                    : siguienteSucursal,
                [sucursalOriginal]: siguienteSucursal,
            });
            if (adelantos.cantidad > 0) {
                const ultimoAdelantosGeneral = Number(contadorAdelantos.ultimo);
                transaction.update(contadorAdelantosRef, {
                    ultimo: Number.isFinite(ultimoAdelantosGeneral)
                        ? Math.max(ultimoAdelantosGeneral, adelantos.ultimo)
                        : adelantos.ultimo,
                    [codigoSucursalAdelantos]: adelantos.ultimo,
                });
            }

            referencias.forEach((referencia, index) => {
                const { orden, ...movimiento } = elementosConId[index];
                transaction.set(referencia, {
                    ...movimiento,
                    fecha: serverTimestamp(),
                });
            });

            if (resumen.impactoNeto !== 0) {
                transaction.update(cuentaRef, {
                    monto: increment(resumen.impactoNeto),
                    ultimaModificacion: serverTimestamp(),
                });
                transaction.update(transcanRef, {
                    monto: increment(-resumen.impactoNeto),
                    ultimaModificacion: serverTimestamp(),
                });
            }

            return elementosConId.map(({ orden, ...movimiento }) => movimiento);
        });

        await Swal.fire({
            title: "Movimientos registrados",
            text: `Se registraron ${elementos.length} movimientos.`,
            icon: "success",
            confirmButtonColor: "#4161bd",
        });

        if (onGuardar) await onGuardar();
        if (onClose) onClose();

        return { elementos };
    } catch (error) {
        console.error("[Error] al registrar movimientos de cuenta:", error);
        await Swal.fire({
            title: "No se registraron los movimientos",
            text: error?.message || "No hemos podido procesar la carga.",
            icon: "error",
            confirmButtonColor: "#4161bd",
        });
        return null;
    } finally {
        loading(false);
    }
};

export const submitLiquidacion = async ({ formData, ubicaciones, contadores, sucursal, loading, onGuardar, onClose }) => {
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

        loading(true);
        const { id: idLiquidacion } = await eventCode("liquidaciones", ubicaciones, contadores, sucursal);
        let idMovimientoCierre = null;
        if (tipoEsperado) {
            ({ id: idMovimientoCierre } = await eventCode("movimientos", ubicaciones, contadores, sucursal));
        }

        const liquidacionRef = doc(db, "liquidaciones", idLiquidacion);
        const cierreRef = idMovimientoCierre ? doc(db, "movimientos", idMovimientoCierre) : null;
        const movimientosRefs = seleccionados.map((movimiento) => doc(db, "movimientos", String(movimiento.id)));
        const cuentaRef = doc(db, "cuentaCorriente", cuenta);
        const sucursalOriginal = String(sucursal || "01");
        const ubicacion = ubicaciones.find(
            (item) => String(item.id).toLowerCase() === sucursalOriginal.toLowerCase(),
        );
        const codigoSucursalAdelantos = String(ubicacion?.id || sucursalOriginal).padStart(2, "0");
        const generaNroAdelanto = tipoEsperado === "PAGO";
        const contadorAdelantosRef = doc(db, "contadores", "adelantos");
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
            const contadorAdelantosSnap = generaNroAdelanto
                ? await transaction.get(contadorAdelantosRef)
                : null;
            const cierreSnap = cierreRef ? await transaction.get(cierreRef) : null;
            const sumaSnap = sumaRef ? await transaction.get(sumaRef) : null;
            const restaSnap = restaRef ? await transaction.get(restaRef) : null;

            if (liquidacionSnap.exists()) throw new Error(`La liquidación ${idLiquidacion} ya existe.`);
            if (!cuentaSnap.exists()) throw new Error(`No existe la cuenta corriente ${cuenta}.`);
            if (generaNroAdelanto && !contadorAdelantosSnap.exists()) {
                throw new Error("No existe el contador de adelantos.");
            }
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

            const contadorAdelantos = contadorAdelantosSnap?.data() || {};
            const asignacionAdelanto = asignarNrosAdelanto(
                [{ tipo: tipoReal }, { tipo: tipoReal }],
                codigoSucursalAdelantos,
                generaNroAdelanto ? contadorAdelantos[codigoSucursalAdelantos] : 0,
            );
            const nroAdelantoLiquidacion = asignacionAdelanto.elementos[0].nroAdelanto;
            const nroAdelantoMovimientoCierre = asignacionAdelanto.elementos[1].nroAdelanto;

            transaction.set(liquidacionRef, {
                id: idLiquidacion, fecha: serverTimestamp(), cuenta, persona: cuenta,
                movimientos: actuales.map((movimiento) => movimiento.id),
                saldoLiquidado: saldoReal, tipoCierre: tipoReal,
                movimientoCierre: idMovimientoCierre, operador: formData?.operador || null,
                detalle: formData?.detalle || "", estado: true,
                ...(nroAdelantoLiquidacion ? { nroAdelanto: nroAdelantoLiquidacion } : {}),
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
                    ...(nroAdelantoMovimientoCierre
                        ? { nroAdelanto: nroAdelantoMovimientoCierre }
                        : {}),
                });
                transaction.update(sumaRef, { monto: increment(montoReal), ultimaModificacion: serverTimestamp() });
                transaction.update(restaRef, { monto: increment(-montoReal), ultimaModificacion: serverTimestamp() });
            }
            if (asignacionAdelanto.cantidad > 0) {
                const ultimoAdelantosGeneral = Number(contadorAdelantos.ultimo);
                transaction.update(contadorAdelantosRef, {
                    ultimo: Number.isFinite(ultimoAdelantosGeneral)
                        ? Math.max(ultimoAdelantosGeneral, asignacionAdelanto.ultimo)
                        : asignacionAdelanto.ultimo,
                    [codigoSucursalAdelantos]: asignacionAdelanto.ultimo,
                });
            }
            resultadoReal = {
                saldoLiquidado: saldoReal,
                tipoCierre: tipoReal,
                cantidad: actuales.length,
                nroAdelanto: nroAdelantoLiquidacion,
            };
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
            ...(resultadoReal.nroAdelanto ? { nroAdelanto: resultadoReal.nroAdelanto } : {}),
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

const normalizarIds = (valores = []) =>
    [...new Set((Array.isArray(valores) ? valores : []).filter(Boolean).map(String))];

const viajeUsaRecurso = (viaje, tipo, id) => {
    if (!viaje || viaje.estado !== true) return false;
    if (tipo === "personas") return String(viaje.persona) === String(id);
    if (tipo === "tractores") return String(viaje.tractor) === String(id);
    return (viaje.furgon || []).some((furgonId) => String(furgonId) === String(id));
};

const validarRecursoViaje = ({ recurso, tipo, id, viajeId, viajesActivos, eraRecursoPropio }) => {
    if (!recurso) {
        throw new Error(`No existe el recurso ${tipo}/${id}.`);
    }

    const viajeAsociado = viajesActivos.find((viaje) =>
        viajeUsaRecurso(viaje, tipo, id)
    );
    const banderaOcupado = recurso.enViaje === true;
    const banderaViaje = recurso.viajeActivo ? String(recurso.viajeActivo) : null;
    const perteneceAlPropio = String(viajeAsociado?.id) === String(viajeId);
    const banderaPropia = banderaViaje === String(viajeId);

    if (banderaPropia && !eraRecursoPropio) {
        throw new Error(
            `Inconsistencia en ${tipo}/${id}: apunta al viaje ${viajeId}, pero no forma parte de sus recursos actuales.`
        );
    }

    if (viajeAsociado && !perteneceAlPropio) {
        throw new Error(
            `El recurso ${tipo}/${id} está afectado al viaje activo ${viajeAsociado.id}.`
        );
    }

    if ((banderaOcupado || banderaViaje) && !banderaPropia) {
        if (!viajeAsociado) {
            throw new Error(
                `Inconsistencia en ${tipo}/${id}: figura afectado al viaje ${banderaViaje || "desconocido"}, pero no coincide con un viaje activo cargado.`
            );
        }
        throw new Error(
            `El recurso ${tipo}/${id} está afectado al viaje ${banderaViaje || viajeAsociado.id}.`
        );
    }

    if (viajeAsociado && (!banderaOcupado || !banderaViaje)) {
        throw new Error(
            `Inconsistencia en ${tipo}/${id}: está asociado al viaje activo ${viajeAsociado.id}, pero sus banderas no coinciden.`
        );
    }
};

export const submitViaje = async (
    formData,
    campos,
    ubicaciones,
    contadores,
    sucursal,
    loading,
    onGuardar,
    onClose,
    viajes = [],
    elemento = null
) => {
    const verificacion = verificarCamposObligatorios(campos, formData);
    if (!verificacion) return null;

    try {
        const datosViaje = campos.reduce((acc, campo) => {
            if (campo.use === "database") {
                acc[campo.key] = formatearCampoParaCarga(formData[campo.key], campo.dato);
            }
            return acc;
        }, {});

        const confirmacion = await confirmDataSwal("Viaje", datosViaje);
        if (!confirmacion.isConfirmed) return null;

        loading(true);
        const modoEdicion = !!elemento;
        const idViaje = modoEdicion
            ? String(elemento.id)
            : (await eventCode("viajes", ubicaciones, contadores, sucursal)).id;
        const viajeRef = doc(db, "viajes", idViaje);
        const viajesActivosConocidos = viajes.filter(
            (viaje) => viaje.estado === true
        );
        const viajesConflictoRefs = viajesActivosConocidos
            .filter((viaje) => String(viaje.id) !== idViaje)
            .map((viaje) => doc(db, "viajes", String(viaje.id)));

        let viajeGuardado;

        await runTransaction(db, async (transaction) => {
            const viajeSnap = await transaction.get(viajeRef);
            if (modoEdicion && !viajeSnap.exists()) {
                throw new Error(`No existe el viaje ${idViaje}.`);
            }
            if (!modoEdicion && viajeSnap.exists()) {
                throw new Error(`El viaje ${idViaje} ya existe.`);
            }

            const viajeAnterior = viajeSnap.exists() ? viajeSnap.data() : null;
            if (modoEdicion && viajeAnterior.estado !== true) {
                throw new Error("No se pueden reasignar recursos de un viaje cerrado.");
            }

            const recursosNuevos = [
                { tipo: "personas", id: String(datosViaje.persona) },
                { tipo: "tractores", id: String(datosViaje.tractor) },
                ...normalizarIds(datosViaje.furgon).map((id) => ({ tipo: "furgones", id })),
            ];
            const recursosAnteriores = viajeAnterior
                ? [
                    { tipo: "personas", id: String(viajeAnterior.persona) },
                    { tipo: "tractores", id: String(viajeAnterior.tractor) },
                    ...normalizarIds(viajeAnterior.furgon).map((id) => ({ tipo: "furgones", id })),
                ]
                : [];
            const recursosTodos = [...recursosNuevos, ...recursosAnteriores].filter(
                (recurso, index, lista) =>
                    lista.findIndex(
                        (otro) => otro.tipo === recurso.tipo && otro.id === recurso.id
                    ) === index
            );
            const recursosConRefs = recursosTodos.map((recurso) => ({
                ...recurso,
                ref: doc(db, recurso.tipo, recurso.id),
            }));
            const recursosSnaps = [];
            for (const recurso of recursosConRefs) {
                recursosSnaps.push({
                    ...recurso,
                    snap: await transaction.get(recurso.ref),
                });
            }

            const viajesConflicto = [];
            for (const ref of viajesConflictoRefs) {
                const snapshot = await transaction.get(ref);
                if (snapshot.exists()) {
                    viajesConflicto.push({ id: snapshot.id, ...snapshot.data() });
                }
            }

            recursosTodos.forEach((recursoNuevo) => {
                const recursoActual = recursosSnaps.find(
                    (recurso) =>
                        recurso.tipo === recursoNuevo.tipo && recurso.id === recursoNuevo.id
                );
                validarRecursoViaje({
                    recurso: recursoActual?.snap.data(),
                    tipo: recursoNuevo.tipo,
                    id: recursoNuevo.id,
                    viajeId: idViaje,
                    viajesActivos: viajesConflicto,
                    eraRecursoPropio: recursosAnteriores.some(
                        (recurso) =>
                            recurso.tipo === recursoNuevo.tipo && recurso.id === recursoNuevo.id
                    ),
                });
            });

            recursosAnteriores.forEach((recursoAnterior) => {
                const seConserva = recursosNuevos.some(
                    (recurso) =>
                        recurso.tipo === recursoAnterior.tipo && recurso.id === recursoAnterior.id
                );
                if (seConserva) return;
                const recursoActual = recursosSnaps.find(
                    (recurso) =>
                        recurso.tipo === recursoAnterior.tipo && recurso.id === recursoAnterior.id
                );
                const datos = recursoActual?.snap.data();
                if (!datos) {
                    throw new Error(`No existe el recurso anterior ${recursoAnterior.tipo}/${recursoAnterior.id}.`);
                }
                if (
                    datos.viajeActivo &&
                    String(datos.viajeActivo) !== idViaje
                ) {
                    throw new Error(
                        `Inconsistencia en ${recursoAnterior.tipo}/${recursoAnterior.id}: pertenece a otro viaje.`
                    );
                }
            });

            viajeGuardado = modoEdicion
                ? {
                    ...viajeAnterior,
                    ...datosViaje,
                    id: idViaje,
                    ultimaModificacion: serverTimestamp(),
                }
                : {
                    id: idViaje,
                    fecha: serverTimestamp(),
                    estado: true,
                    movimiento: datosViaje.adelanto > 0,
                    ...datosViaje,
                };

            if (modoEdicion) {
                transaction.update(viajeRef, {
                    ...datosViaje,
                    ultimaModificacion: serverTimestamp(),
                });
            } else {
                transaction.set(viajeRef, viajeGuardado);
            }

            recursosNuevos.forEach((recursoNuevo) => {
                const recurso = recursosConRefs.find(
                    (item) =>
                        item.tipo === recursoNuevo.tipo && item.id === recursoNuevo.id
                );
                transaction.update(recurso.ref, {
                    enViaje: true,
                    viajeActivo: idViaje,
                    ultimaModificacion: serverTimestamp(),
                });
            });

            recursosAnteriores.forEach((recursoAnterior) => {
                const seConserva = recursosNuevos.some(
                    (recurso) =>
                        recurso.tipo === recursoAnterior.tipo && recurso.id === recursoAnterior.id
                );
                if (seConserva) return;
                const recurso = recursosConRefs.find(
                    (item) =>
                        item.tipo === recursoAnterior.tipo && item.id === recursoAnterior.id
                );
                transaction.update(recurso.ref, {
                    enViaje: false,
                    viajeActivo: null,
                    ultimaModificacion: serverTimestamp(),
                });
            });
        });

        statusOptions({ status: "success" });
        if (onGuardar) await onGuardar();
        return viajeGuardado;
    } catch (error) {
        console.error("[Error] al guardar viaje:", error);
        Swal.fire({
            title: "No se pudo guardar el viaje",
            text: error?.message || "No hemos podido procesar la solicitud.",
            icon: "error",
            confirmButtonText: "Entendido",
            confirmButtonColor: "#4161bd",
        });
        return null;
    } finally {
        loading(false);
    }
};

export const submitCruce = async (
    formData,
    campos,
    ubicaciones,
    contadores,
    sucursal,
    loading,
    onGuardar,
    onClose,
    viajeReferencia = null
) => {
    const verificacion = verificarCamposObligatorios(campos, formData);
    if (!verificacion) return null;

    try {
        const elementoAGuardar = campos.reduce((acc, campo) => {
            if (campo.use === "database") {
                acc[campo.key] = formatearCampoParaCarga(
                    formData[campo.key],
                    campo.dato
                );
            }
            return acc;
        }, {});

        if (viajeReferencia) {
            if (
                viajeReferencia.estado !== true ||
                String(viajeReferencia.id) !== String(elementoAGuardar.viaje)
            ) {
                throw new Error("El viaje seleccionado ya no está activo o no coincide.");
            }

            const furgonesViaje = normalizarIds(viajeReferencia.furgon);
            const furgonesCruce = normalizarIds(elementoAGuardar.furgon);
            const recursosCoinciden =
                String(viajeReferencia.persona) === String(elementoAGuardar.persona) &&
                String(viajeReferencia.tractor) === String(elementoAGuardar.tractor) &&
                furgonesViaje.length === furgonesCruce.length &&
                furgonesViaje.every((id) => furgonesCruce.includes(id));

            if (!recursosCoinciden) {
                throw new Error(
                    "Los datos del cruce no coinciden con los recursos actuales del viaje."
                );
            }
        }

        const confirmacion = await confirmDataSwal("Cruce", elementoAGuardar);
        if (!confirmacion.isConfirmed) return null;

        loading(true);
        const { id: identificador } = await eventCode(
            "cruces",
            ubicaciones,
            contadores,
            sucursal
        );
        const documento = {
            id: identificador,
            fecha: serverTimestamp(),
            estado: true,
            ...elementoAGuardar,
            viaje: String(elementoAGuardar.viaje),
            furgon: normalizarIds(elementoAGuardar.furgon),
        };
        const resultadoCarga = await submit("cruces", documento);

        statusOptions(resultadoCarga);

        if (resultadoCarga.status !== "success") {
            return null;
        }

        if (onGuardar) await onGuardar();
        if (onClose) onClose();

        return {
            elemento: {
                ...documento,
                // Firestore conserva serverTimestamp(); el PDF inmediato necesita una fecha materializada.
                fecha: new Date(),
            }
        };
    } catch (error) {
        console.error("[Error] al guardar cruce:", error);
        Swal.fire({
            title: "No se pudo guardar el cruce",
            text: error?.message || "No hemos podido procesar la solicitud.",
            icon: "error",
            confirmButtonText: "Entendido",
            confirmButtonColor: "#4161bd",
        });
        return null;
    } finally {
        loading(false);
    }
};

// estados

export const submitFinViaje = async (
    viaje,
    state = false,
    callback = null
) => {
    const id = String(viaje?.id || viaje);
    const detalleRecursos = typeof viaje === "object"
        ? `Chofer: ${viaje.persona || "-"}<br/>Tractor: ${viaje.tractor || "-"}<br/>Furgones: ${normalizarIds(viaje.furgon).join(", ") || "ninguno"}`
        : "Se liberarán los recursos asociados al viaje.";

    const result = await Swal.fire({
        title: id,
        html: `<p>¿Desea finalizar el viaje?</p><p>${detalleRecursos}</p>`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, finalizar y liberar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#4161bd",
    });

    if (!result.isConfirmed) return false;

    try {
        const viajeRef = doc(db, "viajes", id);
        let recursosLiberados;

        await runTransaction(db, async (transaction) => {
            const viajeSnap = await transaction.get(viajeRef);
            if (!viajeSnap.exists()) {
                throw new Error(`No existe el viaje ${id}.`);
            }

            const viajeActual = viajeSnap.data();
            if (viajeActual.estado !== true) {
                throw new Error(`El viaje ${id} ya está cerrado.`);
            }

            const recursos = [
                { tipo: "personas", id: String(viajeActual.persona) },
                { tipo: "tractores", id: String(viajeActual.tractor) },
                ...normalizarIds(viajeActual.furgon).map((furgonId) => ({
                    tipo: "furgones",
                    id: furgonId,
                })),
            ];
            const recursosLeidos = [];
            for (const recurso of recursos) {
                const ref = doc(db, recurso.tipo, recurso.id);
                const snapshot = await transaction.get(ref);
                if (!snapshot.exists()) {
                    throw new Error(`No existe el recurso ${recurso.tipo}/${recurso.id}.`);
                }
                recursosLeidos.push({ ...recurso, ref, datos: snapshot.data() });
            }

            recursosLeidos.forEach((recurso) => {
                const tieneBandera = recurso.datos.enViaje !== undefined;
                const tieneViaje = recurso.datos.viajeActivo !== undefined;
                if (tieneBandera && recurso.datos.enViaje !== true) {
                    throw new Error(
                        `Inconsistencia en ${recurso.tipo}/${recurso.id}: el viaje está activo pero el recurso figura libre.`
                    );
                }
                if (
                    tieneViaje &&
                    String(recurso.datos.viajeActivo) !== id
                ) {
                    throw new Error(
                        `Inconsistencia en ${recurso.tipo}/${recurso.id}: figura asociado al viaje ${recurso.datos.viajeActivo || "ninguno"}.`
                    );
                }
            });

            transaction.update(viajeRef, {
                estado: state,
                fechaFin: serverTimestamp(),
                ultimaModificacion: serverTimestamp(),
            });
            recursosLeidos.forEach((recurso) => {
                transaction.update(recurso.ref, {
                    enViaje: false,
                    viajeActivo: null,
                    ultimaModificacion: serverTimestamp(),
                });
            });

            recursosLiberados = {
                persona: viajeActual.persona,
                tractor: viajeActual.tractor,
                furgones: normalizarIds(viajeActual.furgon),
            };
        });

        await Swal.fire({
            title: "Viaje finalizado",
            html: `
                <p>Chofer liberado: <strong>${recursosLiberados.persona}</strong></p>
                <p>Tractor liberado: <strong>${recursosLiberados.tractor}</strong></p>
                <p>Furgones liberados: <strong>${recursosLiberados.furgones.join(", ") || "ninguno"}</strong></p>
            `,
            icon: "success",
            confirmButtonColor: "#4161bd",
        });

        if (callback) await callback();
        return true;
    } catch (error) {
        console.error("[Error] al finalizar viaje:", error);
        Swal.fire({
            title: "No se pudo finalizar el viaje",
            text: error?.message || "No hemos podido procesar la solicitud.",
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

const TIPOS_MOVIMIENTO_VALIDOS = ["ADELANTO", "PAGO", "COBRO", "GASTO"];

const validarCargaMovimientos = (datosComunes, movimientos) => {
    if (!datosComunes.persona) return "Seleccione una cuenta corriente.";
    if (datosComunes.persona === CUIT_TRANSCAN) {
        return "La cuenta seleccionada no puede ser la cuenta de Transcan.";
    }
    if (!datosComunes.operador) return "Seleccione un operador.";
    if (!movimientos.length) return "Agregue al menos un movimiento.";
    if (movimientos.length > 25) return "La carga admite hasta 25 movimientos.";

    const tipoInvalido = movimientos.find(
        (movimiento) => !TIPOS_MOVIMIENTO_VALIDOS.includes(movimiento.tipo),
    );
    if (tipoInvalido) return "Todos los movimientos deben tener un tipo válido.";

    const montoInvalido = movimientos.find(
        (movimiento) => !Number.isFinite(movimiento.monto) || movimiento.monto <= 0,
    );
    if (montoInvalido) return "Todos los movimientos deben tener un monto mayor a cero.";

    return null;
};

const resumirMovimientos = (movimientos) => {
    const totalPorTipo = (tipo) => movimientos
        .filter((movimiento) =>
            tipo === "ADELANTO"
                ? ["ADELANTO", "PAGO"].includes(movimiento.tipo)
                : movimiento.tipo === tipo
        )
        .reduce((total, movimiento) => total + movimiento.monto, 0);

    return {
        adelantos: totalPorTipo("ADELANTO"),
        gastos: totalPorTipo("GASTO"),
        cobros: totalPorTipo("COBRO"),
        impactoNeto: movimientos.reduce(
            (total, movimiento) => total + calcularImpactoMovimiento(movimiento),
            0,
        ),
    };
};

const confirmarCargaMovimientos = (cantidad, resumen) => Swal.fire({
    title: `Registrar ${cantidad} movimiento${cantidad === 1 ? "" : "s"}`,
    html: `
        <div style="text-align:left">
            <p>Adelantos/Pagos: <strong>$ ${formatearMonto(resumen.adelantos)}</strong></p>
            <p>Gastos: <strong>$ ${formatearMonto(resumen.gastos)}</strong></p>
            <p>Cobros: <strong>$ ${formatearMonto(resumen.cobros)}</strong></p>
            <p>Impacto neto cuenta: <strong>$ ${formatearMonto(resumen.impactoNeto)}</strong></p>
            <p>¿Confirmar carga?</p>
        </div>
    `,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Guardar movimientos",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#4161bd",
});


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

