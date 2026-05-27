import * as mysql from "drizzle-orm/mysql-core";
import { mysqlTable } from "drizzle-orm/mysql-core";

export const Categoria = mysqlTable(
    "categoria", {
        id: mysql.int("id").primaryKey().autoincrement().notNull(),
        nombre: mysql.varchar("nombre", { length: 255} ).notNull(),
        protegida: mysql.boolean("protegida").default(false),
        createdAt: mysql.date("created_at").$defaultFn(() => new Date),
        updatedAt: mysql.date("updated_at").$defaultFn(() => new Date)
    }
);

export const CategoriaProducto = mysqlTable(
    "categoria_producto", {
        categoriaId: mysql.int("categoria_id").references(() => Categoria.id).notNull(),
        productoId: mysql.int("producto_id").references(() => Producto.id).notNull(),
        createdAt: mysql.date("created_at").$defaultFn(() => new Date),
        updatedAt: mysql.date("updated_at").$defaultFn(() => new Date)
    }, (table) => [
        mysql.primaryKey({ columns: [table.categoriaId, table.productoId] })
    ]
)

export const Producto = mysqlTable(
    "producto", {
        id: mysql.int("id").primaryKey().autoincrement().notNull(),
        titulo: mysql.varchar("titulo", { length: 255} ).default("sin titulo"),
        descripcion: mysql.text("descripcion").default("sin descripcion"),
        precio: mysql.decimal("precio").notNull(),
        archivoId: mysql.int("archivo_id").references(() => Archivo.id),
        createdAt: mysql.date("created_at").$defaultFn(() => new Date),
        updatedAt: mysql.date("updated_at").$defaultFn(() => new Date)
    }
);

export const Rol = mysqlTable(
    "rol", {
        id: mysql.int("id").primaryKey().autoincrement().notNull(),
        nombre: mysql.varchar("nombre", { length: 255} ).notNull(),
        createdAt: mysql.date("created_at").$defaultFn(() => new Date),
        updatedAt: mysql.date("updated_at").$defaultFn(() => new Date)
    }
);

export const Usuario = mysqlTable(
    "usuario", {
        id: mysql.int("id").primaryKey().autoincrement().notNull(),
        email: mysql.varchar("email", { length: 255} ).notNull().unique(),
        passwordHash: mysql.varchar("password_hash", { length: 1024} ).notNull(),
        nombre: mysql.varchar("nombre", { length: 255} ).notNull(),
        protegido: mysql.boolean("protegido").default(false),
        rolId: mysql.int("rol_id").references(() => Rol.id).notNull(),
        createdAt: mysql.date("created_at").$defaultFn(() => new Date),
        updatedAt: mysql.date("updated_at").$defaultFn(() => new Date)
    }
);

export const Archivo = mysqlTable(
    "archivo", {
        id: mysql.int("id").primaryKey().autoincrement().notNull(),
        mime: mysql.varchar("mime", { length: 255} ).notNull(),
        nombre: mysql.varchar("nombre", { length: 255} ).notNull(),
        size: mysql.int("size").notNull(),
        inDb: mysql.boolean("in_db").default(true).notNull(),
        datos: mysql.longblob("datos"),
        createdAt: mysql.date("created_at").$defaultFn(() => new Date),
        updatedAt: mysql.date("updated_at").$defaultFn(() => new Date)
    }
);

export const Bitacora = mysqlTable(
    "bitacora", {
        id: mysql.int("id").primaryKey().autoincrement().notNull(),
        accion: mysql.varchar("accion", { length: 255} ).notNull(),
        elementoId: mysql.int("elemento_id"),
        ip: mysql.varchar("ip", { length: 45 } ).notNull(),
        usuario: mysql.varchar("usuario", { length: 255} ).notNull(),
        fecha: mysql.date("fecha").$defaultFn(() => new Date),
        createdAt: mysql.date("created_at").$defaultFn(() => new Date),
        updatedAt: mysql.date("updated_at").$defaultFn(() => new Date)
    }
);
