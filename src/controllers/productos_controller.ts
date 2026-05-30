import { Request, Response } from "express"
import { db } from "../drizzle/db.js"
import { IdInput } from "../schemas/general_schema.js"
import { AsignaCategoriaInput, BusquedaInput, EliminarCategoriaInput, ProductoInput } from "../schemas/producto_schema.js"
import { Producto, Categoria, CategoriaProducto } from '../drizzle/schema.js';
import { like, eq, and } from "drizzle-orm";

export const getAll = async (req: Request<{}, {}, {}, BusquedaInput> ,res: Response): Promise<void> => {
    const tituloBuscado = req.query.titulo;

    const productos = await db
        .select({
            producto: {
                id: Producto.id,
                titulo: Producto.titulo,
                descripcion: Producto.descripcion,
                precio: Producto.precio,
                archivoId: Producto.archivoId
            },
            categoria: {
                id: Categoria.id,
                nombre: Categoria.nombre,
                protegida: Categoria.protegida
            }
        })
        .from(Producto) 
        .leftJoin(CategoriaProducto, eq(Producto.id, CategoriaProducto.productoId))
        .leftJoin(Categoria, eq(CategoriaProducto.categoriaId, Categoria.id))
        .where(like(Producto.titulo, `%${tituloBuscado}%`));

    res.status(200).json(productos);
}

export const get = async (req: Request<IdInput>, res: Response) => {
    const id = req.params.id;

    const data = await db
        .select({
            producto: {
                id: Producto.id,
                titulo: Producto.titulo,
                descripcion: Producto.descripcion,
                precio: Producto.precio,
                archivoId: Producto.archivoId
            },
            categoria: {
                id: Categoria.id,
                nombre: Categoria.nombre,
                protegida: Categoria.protegida
            }
        })
        .from(CategoriaProducto)
        .innerJoin(Producto, eq(CategoriaProducto.productoId, Producto.id))
        .innerJoin(Categoria, eq(CategoriaProducto.categoriaId, Categoria.id))
        .where(eq(Producto.id, id));
    
    const producto = data[0];

    if (producto == null) {
        res.status(404).send();
        return;
    }
    res.status(200).json(producto);
}

export const create = async (req: Request<{}, {}, ProductoInput>, res: Response) => {
    const result = await db.insert(Producto).values({
        titulo: req.body.titulo,
        descripcion: req.body.descripcion,
        precio: req.body.precio.toString(),
        archivoId: req.body.archivoId
    }).$returningId();

    const newId = result[0]?.id;

    const nuevo = await db.query.Producto.findFirst({
        where: { id: newId }
    })

    if (nuevo == null) {
        res.status(500).json({message: "failed to create the producto"});
        return;
    }
    req.bitacora("producto.crear", nuevo.id)
    res.status(201).json(nuevo);
}

export const update = async (req: Request<IdInput, {}, ProductoInput>, res: Response) => {
    const id = req.params.id;
    
    await db.update(Producto).set({
        titulo: req.body.titulo,
        descripcion: req.body.descripcion,
        precio: req.body.precio.toString(),
        archivoId: req.body.archivoId
    }).where(eq(Producto.id, id));

    req.bitacora("producto.editar", id);
    res.status(204).send();
}

export const eliminate = async (req: Request<IdInput>, res: Response) => {
    const id = req.params.id;

    const data = await db.query.Producto.findFirst({
        columns:
        {
            id: true,
            nombre: true,
            protegida: true
        },
        where: { id: id }
    });

    if (data == null) {
        res.status(404).send();
        return;
    }

    const removed = await db.delete(Producto).where(eq(Producto.id, id));

    if (removed[0].affectedRows > 0) {
        req.bitacora("producto.eliminar", id);
        res.status(204).json(data);
    } else {
        res.status(404).send();
    }
}

export const asignaCategoria = async (req: Request<IdInput, {}, AsignaCategoriaInput>, res: Response) => {
    const categoria = await db.query.Categoria.findFirst({
        where: { id: req.body.categoriaId }
    });

    const producto = await db.query.Producto.findFirst({
        where: { id: req.params.id }
    });

    if (categoria == null) {
        res.status(404).json({ resource: "CATEGORIA" });
        return;
    }
    if (producto == null) {
        res.status(404).json({ resource: "PRODUCTO" });
        return;
    }

    await db.insert(CategoriaProducto).values({
        categoriaId: categoria.id,
        productoId: producto.id
    });

    req.bitacora("productocategoria.agregar", `${req.params.id}:${req.body.categoriaId}`);
    res.status(204).send();
}

export const eliminaCategoria = async (req: Request<EliminarCategoriaInput>, res: Response) => {
    const categoria = await db.query.Categoria.findFirst({
        where: { id: req.params.categoriaId }
    });

    if (categoria == null) {
        res.status(404).send();
        return;
    }

    const producto = await db.query.Producto.findFirst({
        where: { id: req.params.productoId }
    });

    if (producto == null) {
        res.status(404).send();
        return;
    }

    await db.delete(CategoriaProducto).where(
        and(
            eq(CategoriaProducto.categoriaId, req.params.categoriaId),
            eq(CategoriaProducto.productoId, req.params.productoId)
        )
    );

    res.status(204).send();
}