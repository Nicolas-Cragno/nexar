import fs from "fs";
import path from "path";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig.js";

export const migrarColeccion = async (
  archivoJSON,
  coleccion,
  campoId = "id"
) => {
  try {
    const ruta = path.resolve(archivoJSON);

    const data = JSON.parse(
      fs.readFileSync(ruta, "utf8")
    );

    console.log(
      `[SCRIPT] Migrando ${data.length} registros a ${coleccion}`
    );

    for (const item of data) {
      const docId = String(item[campoId]);

      await setDoc(
        doc(db, coleccion, docId),
        item,
        { merge: true }
      );

      console.log(`✅ ${docId}`);
    }

    console.log("[SCRIPT] Finalizado");
  } catch (error) {
    console.error(error);
  }
};

const args = process.argv.slice(2);

if (args.length < 2) {
  console.log(
    "Uso: node migrarColeccion.js <archivoJSON> <coleccion> [campoId]"
  );
} else {
  const [archivoJSON, coleccion, campoId] = args;

  await migrarColeccion(
    archivoJSON,
    coleccion,
    campoId || "id"
  );
}