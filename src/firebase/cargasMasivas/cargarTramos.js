import fs from "fs";
import path from "path";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig.js";

function calcularFecha(nro) {
    const dias = Number(nro);

    if (!Number.isFinite(dias)) {
        throw new Error(`Cantidad de días inválida: ${nro}`);
    }

    const fecha = new Date();

    fecha.setHours(12, 0, 0, 0);
    fecha.setDate(fecha.getDate() - dias);

    return Timestamp.fromDate(fecha);
}

function convertirFecha(valor) {
    if (valor === null || valor === undefined || valor === "") {
        return null;
    }

    // Si viene como número: días hacia atrás
    if (typeof valor === "number") {
        return calcularFecha(valor);
    }

    // Si viene como string numérico
    if (
        typeof valor === "string" &&
        valor.trim() !== "" &&
        !isNaN(Number(valor))
    ) {
        return calcularFecha(Number(valor));
    }

    // Si viene como fecha explícita
    if (typeof valor === "string") {
        if (valor.startsWith("1900-01-00")) {
            return null;
        }

        const fecha = new Date(valor);

        if (!isNaN(fecha.getTime())) {
            return Timestamp.fromDate(fecha);
        }
    }

    return valor;
}

export const cargarTramos = async (
    archivoJSON,
    coleccion = "viajes"
) => {
    try {
        const ruta = path.resolve(archivoJSON);

        const data = JSON.parse(
            fs.readFileSync(ruta, "utf8")
        );

        console.log(
            `[SCRIPT] Procesando ${data.length} tramos`
        );
        const viajesAgrupados = {};

        for (const item of data) {
            const viajeId = String(item.viaje);

            if (!viajesAgrupados[viajeId]) {
                viajesAgrupados[viajeId] = [];
            }

            const tramo = {
                operador: item.operador ?? null,
                lugarSalida: item.lugarSalida ?? null,
                lugarLlegada: item.lugarLlegada ?? null,
                fechaSalida: convertirFecha(item.fechaSalida),
                fechaLlegada: convertirFecha(item.fechaLlegada),
            };

            viajesAgrupados[viajeId].push(tramo);
        }

        console.log(
            `[SCRIPT] Viajes encontrados: ${Object.keys(viajesAgrupados).length}`
        );

        for (const [viajeId, tramos] of Object.entries(viajesAgrupados)) {

            await updateDoc(
                doc(db, coleccion, viajeId),
                {
                    tramos
                }
            );

            console.log(
                `✅ ${viajeId} → ${tramos.length} tramo(s)`
            );
        }

        console.log("--------------------------------");
        console.log("[SCRIPT] Finalizado");

    } catch (error) {
        console.error("[ERROR]", error);
    }
};

const args = process.argv.slice(2);

if (args.length < 1) {
    console.log(
        "Uso: node cargarTramos.js <archivoJSON> [coleccion]"
    );
} else {
    const [archivoJSON, coleccion] = args;

    await cargarTramos(
        archivoJSON,
        coleccion || "viajes"
    );
}