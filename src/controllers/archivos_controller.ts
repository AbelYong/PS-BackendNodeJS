import { Request, Response } from "express"
import { db } from "../drizzle/db.js"
import { Archivo } from "../drizzle/schema.js"
import { IdInput } from "../schemas/general_schema.js";
import fs from "node:fs";
import { eq } from "drizzle-orm";

export const getAll = async (_req: Request, res: Response): Promise<void> => {
    const data = await db.query.Archivo.findMany({
        columns: {
            id: true,
            mime: true,
            inDb: true,
            nombre: true,
            size: true
        }
    });
    res.status(200).json(data);
}

export const getDetalle = async (req: Request<IdInput>, res: Response) => {
    const id = req.params.id;

    const data = await db.query.Archivo.findFirst({
        columns: {
            id: true,
            mime: true,
            inDb: true,
            nombre: true,
            size: true
        },
        where: { id: id }
    });

    if (data == null) {
        res.status(404).json(data);
        return;
    }
    res.status(200).json(data);
}

export const get = async (req: Request<IdInput>, res: Response) => {
    const id = req.params.id;

    const data = await db.query.Archivo.findFirst({
        where: { id: id }
    })

    if (data == null) {
        res.status(404).send();
        return;
    }

    let imagen = data.datos;

    if (!data.inDb) {
        imagen = fs.readFileSync(`uploads/${data.nombre}`);
    }

    res.status(200).contentType(data.mime).send(imagen);
}

export const create = async (req: Request, res: Response) => {
    console.log(req.file);

    if (req.file == null) {
        res.status(400).json({message: "El archivo es obligatorio"});
        return;
    }

    let binario = null;
    let inDb = false;

    if (process.env["FILES_IN_BD"] === "true") {
        binario = fs.readFileSync(`uploads/${req.file.filename}`);
        fs.existsSync(`uploads/${req.file.filename}`) && fs.unlinkSync(`uploads/${req.file.filename}`);
        inDb = true;
    }

    const newId = await db.insert(Archivo).values({
        mime: req.file.mimetype,
        inDb: inDb,
        nombre: req.file.filename,
        size: req.file.size,
        datos: binario
    }).$returningId();

    if (newId[0] == null) {
        res.status(500).json({message: "failed to save file"});
        return;
    }

    const nuevoArchivo = await db.query.Archivo.findFirst({
        columns: {
            id: true,
            mime: true,
            inDb: true,
            nombre: true
        },
        where: { id: newId[0].id }
    });

    res.status(201).json(nuevoArchivo);
}

export const update = async (req: Request<IdInput>, res: Response) => {
    if (req.file == null) {
        res.status(400).json({message: "El archivo es obligatorio"});
        return;
    }

    const id = req.params.id;

    const archivoExistente = await db.query.Archivo.findFirst({
        where: { id: id }
    });

    if (archivoExistente == null) {
        fs.existsSync(`uploads/${req.file.filename}`) && fs.unlinkSync(`uploads/${req.file.filename}`);
        res.status(404);
        return;
    }

    let binario = null;
    let inDb = false;

    if (process.env["FILES_IN_BD"] === "true") {
        binario = fs.readFileSync(`uploads/${req.file.filename}`);
        fs.existsSync(`uploads/${req.file.filename}`) && fs.unlinkSync(`uploads/${req.file.filename}`);
        inDb = true;
    }

    const result = await db.update(Archivo).set({
        mime: req.file.mimetype,
        inDb: inDb,
        nombre: req.file.filename,
        size: req.file.size,
        datos: binario
    }).where(eq(Archivo.id, id));

    if (result[0].affectedRows === 0) {
        res.status(500).json({message: "failed to save file"});
        return;
    }

    const archivoActualizado = await db.query.Archivo.findFirst({
        columns: {
            id: true,
            mime: true,
            inDb: true,
            nombre: true
        },
        where: { id: id }
    });

    if (archivoActualizado == null) {
        res.status(400).send();
        return;
    }

    if (!archivoExistente.inDb) {
        fs.existsSync(`uploads/${req.file.filename}`) && fs.unlinkSync(`uploads/${req.file.filename}`);
    }

    req.bitacora("archivos.editar", archivoActualizado.id);
    res.status(204).send();
}

export const eliminate = async (req: Request<IdInput>, res: Response) => {
    const id = req.params.id;

    const imagen = await db.query.Archivo.findFirst({
        where: { id: id }
    });

    if (imagen == null) {
        res.status(404).send();
        return;
    }

    const data = await db.delete(Archivo).where(
        eq(Archivo.id, id)
    );

    if (data[0].affectedRows <= 0) {
        res.status(404).send();
        return;
    }
    
    req.bitacora("archivos.eliminar", id);
    if (!imagen.inDb) {
        fs.existsSync(`uploads/${imagen.nombre}`) && fs.unlinkSync(`uploads/${imagen.nombre}`);
    }
    res.status(204).send();
}