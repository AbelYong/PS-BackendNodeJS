import bcrypt from "bcrypt";
import { db } from "./drizzle/db.js";
import { Categoria, Rol, Usuario } from "./drizzle/schema.js";
import { sql } from "drizzle-orm";

async function seed() {
    let acumulador = 0;
    let ids;

    ids = await db.insert(Categoria).values([
        { id: 1, nombre: "Televisores", protegida: true },
        { id: 2, nombre: "Celulares y Tecnología", protegida: true},
        { id: 3, nombre: "Laptops", protegida: true},
        { id: 4, nombre: "Electrodomésticos", protegida: true},
        { id: 5, nombre: "Hogar y muebles", protegida: true},
        { id: 6, nombre: "Moda", protegida: true},
        { id: 7, nombre: "Deportes", protegida: true},
        { id: 8, nombre: "Construcción", protegida: true},
        { id: 9, nombre: "Oficina", protegida: true},
        { id: 10, nombre: "Juguetes", protegida: true},
        { id: 11, nombre: "Bebes", protegida: true},
        { id: 12, nombre: "Salud", protegida: true},
        { id: 13, nombre: "Belleza", protegida: true},
        { id: 14, nombre: "Videojuegos", protegida: true},
        { id: 15, nombre: "Supermercado", protegida: true},
    ]).$returningId().onDuplicateKeyUpdate({ set: {id: sql`id`}});

    acumulador = ids.length;

    ids = await db.insert(Rol).values([
        { id: 1, nombre: "Administrador" },
        { id: 2, nombre: "Usuario" }
    ]).onDuplicateKeyUpdate({ set: {id: sql`id`}});

    acumulador = acumulador + ids.length;

    ids = await db.insert(Usuario).values([
        { id: 1, email: "gvera@uv.mx", passwordHash: await bcrypt.hash("Super_4dm1in", 10), nombre: "Guillermo Vera", rolId: 1, protegido: true},
        { id: 2, email: "patito@uv.mx", passwordHash: await bcrypt.hash("No3sPatit0", 10), nombre: "Patito", rolId: 2, protegido: false}
    ]).onDuplicateKeyUpdate({ set: {id: sql`id`}});

    acumulador = acumulador + ids.length;

    console.log(`Seeding completado, se insertaron/actualizaron ${acumulador} registros`);
}

try {
    await seed();
    process.exit(0);
} catch (error) {
    console.error("Error durante el seeding:", error);
    process.exit(1);
}
