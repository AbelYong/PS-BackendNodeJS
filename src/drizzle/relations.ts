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
    },
    Carrito: {
        cliente: r.one.Usuario({
            from: r.Carrito.clienteId,
            to: r.Usuario.id
        })
    },
    ProductoCarrito: {
        carrito: r.one.Carrito({
            from: r.ProductoCarrito.carritoId,
            to: r.Carrito.id
        }),
        producto: r.one.Producto({
            from: r.ProductoCarrito.productoId,
            to: r.Producto.id
        })
    },
    Pedido: {
        cliente: r.one.Usuario({
            from: r.Pedido.clienteId,
            to: r.Usuario.id
        }),
        carrito: r.one.Carrito({
            from: r.Pedido.carritoId,
            to: r.Carrito.id
        })
    },
    ProductoPedido: {
        pedido: r.one.Pedido({
            from: r.ProductoPedido.pedidoId,
            to: r.Pedido.id
        }),
        producto: r.one.Producto({
            from: r.ProductoPedido.productoId,
            to: r.Producto.id
        })
    }
}));
