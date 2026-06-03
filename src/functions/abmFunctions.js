import Swal from "sweetalert2";
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, increment } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useData } from "../contexto/DataContext";

const verification = async (collection, id) => {
    const snapshot = await getDoc(
        doc(db, collection, String(id))
    );

    return snapshot.exists();
};

export const statusOptions = (result) => {
    switch (result.status) {
        case "success":
            Swal.fire({
                title: "Guardado",
                text: `Carga exitosa.`,
                icon: "success",
                confirmButtonColor: "#4161bd",
            });
            break;
        case "duplicado":
            Swal.fire({
                title: "Duplicado",
                text: `El elemento ya existe.`,
                icon: "warning",
                confirmButtonColor: "#4161bd",
            });
            break;
        case "error":
            Swal.fire({
                title: "Error",
                text: "No se pudo procesar la solicitud.",
                icon: "error",
                confirmButtonColor: "#4161bd",
            });
            console.error(result.error);
            break;
        default:
            console.warn("[statusOptions] Error:", result);
            break;
    }
};

// generacion de codigo por area

export const codeGenerator = async (area, sectores, cuentaCorriente = false) => {
    const areaString = String(area).trim().toLowerCase();

    const sector = sectores.find(
        (sec) => sec.nombre.trim().toLowerCase() === areaString
    );

    if (!sector) {
        throw new Error(`Sector inválido: ${area}`);
    }

    let parametro = "ultimo";

    if (cuentaCorriente) parametro = "cuentaCorriente"

    const nuevoOrden = Number(sector[parametro] || 0) + 1;

    await update(sector.id, "sectores", { [parametro]: nuevoOrden });

    const codigoSector = String(sector.codigo ?? sector.id).padStart(3, "0");

    return {
        id: `${codigoSector}-${String(nuevoOrden).padStart(8, "0")}`,
        orden: nuevoOrden,
    };
};

// generacion de codigo por sucursal (para viajes)

export const codeTravel = async (ubicaciones, contadores, contador = "viajes", sucursal = "DON TORCUATO") => {

    const sucursalUb = ubicaciones.find((ub) => ub.nombre?.toLowerCase() === sucursal.toLowerCase());

    const contadorColeccion = contadores.find(
        ct => ct.nombre === contador
    );

    const nuevoOrden = (contadorColeccion?.ultimo ?? 0) + 1;

    await update(contador, "contadores", { ultimo: increment(1) });

    const codigoSucursal = String(sucursalUb.codigo ?? sucursalUb.id).padStart(3, "0");

    return {
        id: `${codigoSucursal}-${String(nuevoOrden).padStart(8, "0")}`,
        orden: nuevoOrden,
    };
};

// ABM

export const submit = async (collection, data, onGuardar = null, onError = null) => {
    try {
        const existente = await verification(collection, String(data.id));

        if (existente) return { status: "duplicado" };

        await setDoc(doc(db, collection, String(data.id)), data);

        if (onGuardar) await onGuardar(data);
        return { status: "success", data };
    } catch (error) {
        console.error("[Firestore submit error]:", error);
        if (onError) onError(error);

        return { status: "error", error };
    }
}

export const update = async (id, collection, data, onGuardar = null, onError = null) => {
    try {
        await updateDoc(
            doc(db, collection, String(id)),
            {
                ...data,
                ultimaModificacion: new Date(),
            }
        );

        if (onGuardar) await onGuardar(data);

        return true;
    } catch (error) {
        console.error("[Firestore update error]:", error);
        if (onError) onError(error);

        return false;
    }
}

export const remove = async (id, collection, data, onEliminar = null, onError = null) => {
    try {
        await deleteDoc(
            doc(db, collection, String(id))
        );

        if (onEliminar) await onEliminar(id);

        return true;

    } catch (error) {

        console.error("[Firestore delete error]:", error);

        if (onError) onError(error);

        return false;

    }
}