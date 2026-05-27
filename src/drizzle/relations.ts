import * as schema from "./schema.js"
import { defineRelations } from "drizzle-orm"

export const relations = defineRelations(schema, (r) => ({
    CategoriaProducto: {
        categorias: r.one.Categoria({
            from: r.CategoriaProducto.categoriaId,
            to: r.Categoria.id
        }),
        productos: r.one.Producto({
            from: r.CategoriaProducto.productoId,
            to: r.Producto.id  
        })
    },
    Producto: {
        archivo: r.one.Archivo({
            from: r.Producto.archivoId,
            to: r.Archivo.id
        })
    },
    Usuario: {
        rol: r.one.Rol({
            from: r.Usuario.rolId,
            to: r.Rol.id
        })
    }
}));
