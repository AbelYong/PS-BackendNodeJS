import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { db } from "./drizzle/db.js";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { Categoria, Rol, Usuario, Producto, Archivo } from "./drizzle/schema.js";
import { sql } from "drizzle-orm";
import { Administrador as AdministradorRol, Usuario as UsuarioRol, Cliente as ClienteRol } from './config/roles.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seed() {
    let acumulador = 0;

    const categoriasIds = await db.insert(Categoria).values([
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

    acumulador = categoriasIds.length;

    acumulador = acumulador + await seedArchivos(); 

    const productoIds = await db.insert(Producto).values([
        { id: 1, titulo: "Smart TV Samsung 55", descripcion: "Televisor inteligente de 55 pulgadas con resolución 4K y funciones avanzadas.", precio: "799.99", archivoId: 1 },
        { id: 2, titulo: "iPhone 14 Pro", descripcion: "El último modelo de iPhone con cámara mejorada y rendimiento excepcional.", precio: "999.99", archivoId: 2 },
        { id: 3, titulo: "Laptop Dell XPS 13", descripcion: "Portátil ultradelgado con pantalla InfinityEdge y alto rendimiento para profesionales.", precio: "1199.99", archivoId: 3 },
        { id: 4, titulo: "Refrigerador LG InstaView", descripcion: "Refrigerador inteligente con puerta de vidrio y tecnología de ahorro de energía.", precio: "1499.99", archivoId: 4 },
        { id: 5, titulo: "Sofá Seccional de Cuero", descripcion: "Sofá seccional de cuero genuino con diseño moderno y cómodo para tu sala de estar.", precio: "899.99", archivoId: 5 },
        { id: 6, titulo: "Chaqueta de Invierno Columbia", descripcion: "Chaqueta impermeable y aislante para mantenerte abrigado durante el invierno.", precio: "199.99", archivoId: 6 },
        { id: 7, titulo: "Bicicleta de Montaña Trek Marlin 7", descripcion: "Bicicleta de montaña con suspensión delantera y componentes de alta calidad para aventuras al aire libre.", precio: "599.99", archivoId: 7 },
        { id: 8, titulo: "Taladro Inalámbrico DeWalt 20V", descripcion: "Taladro inalámbrico con batería de 20V y diseño ergonómico para proyectos de bricolaje.", precio: "149.99", archivoId: 8 },
        { id: 9, titulo: "Escritorio de Oficina Moderno", descripcion: "Escritorio de oficina con diseño moderno y amplio espacio para trabajar cómodamente.", precio: "299.99", archivoId: 9 },
        { id: 10, titulo: "Set de Construcción LEGO City", descripcion: "Set de construcción LEGO City con vehículos y edificios para horas de diversión creativa.", precio: "89.99", archivoId: 10 },
        { id: 11, titulo: "Cochecito de Bebé Graco", descripcion: "Cochecito de bebé con diseño compacto y características de seguridad para paseos cómodos.", precio: "199.99", archivoId: 11 },
        { id: 12, titulo: "Monitor de Presión Arterial Omron", descripcion: "Monitor de presión arterial digital con tecnología avanzada para un seguimiento preciso de la salud.", precio: "49.99", archivoId: 12 },
        { id: 13, titulo: "Set de Maquillaje Maybelline", descripcion: "Set de maquillaje completo con productos de alta calidad para realzar tu belleza natural.", precio: "39.99", archivoId: 13 },
        { id: 14, titulo: "Consola de Videojuegos PlayStation 5", descripcion: "La última consola de videojuegos con gráficos impresionantes y una amplia biblioteca de juegos.", precio: "499.99", archivoId: 14 },
        { id: 15, titulo: "Cesta de Supermercado Reutilizable", descripcion: "Cesta de supermercado reutilizable y resistente para llevar tus compras de manera ecológica.", precio: "14.99", archivoId: 15 },
    ]).$returningId().onDuplicateKeyUpdate({ set: {id: sql`id`}});

    acumulador = acumulador + productoIds.length;

    const rolIds = await db.insert(Rol).values([
        { id: 1, nombre: AdministradorRol },
        { id: 2, nombre: UsuarioRol },
        { id: 3, nombre: ClienteRol }
    ]).onDuplicateKeyUpdate({ set: {id: sql`id`}}).$returningId();

    acumulador = acumulador + rolIds.length;

    const usuarioIds = await db.insert(Usuario).values([
        { id: 1, email: "gvera@uv.mx", passwordHash: await bcrypt.hash("Super_4dm1in", 10), nombre: "Guillermo Vera", rolId: 1, protegido: true},
        { id: 2, email: "patito@uv.mx", passwordHash: await bcrypt.hash("No3sPatit0", 10), nombre: "Patito", rolId: 2, protegido: false}
    ]).onDuplicateKeyUpdate({ set: {id: sql`id`}}).$returningId();

    acumulador = acumulador + usuarioIds.length;

    console.log(`Seeding completado, se insertaron/actualizaron ${acumulador} registros`);
}

async function seedArchivos() : Promise<number> {
    let rows = 0;

    const guardandoEnBD = process.env["FILES_IN_BD"] === "true";

    const archivosAPrecargar = [
        { id: 1, nombreOriginal: 'smart_tv.jpg', mime: 'image/jpeg' },
        { id: 2, nombreOriginal: 'iphone.png', mime: 'image/png' },
        { id: 3, nombreOriginal: 'laptop.png', mime: 'image/png' },
        { id: 4, nombreOriginal: 'refrigerador.jpg', mime: 'image/jpeg' },
        { id: 5, nombreOriginal: 'sofa.jpg', mime: 'image/jpeg' },
        { id: 6, nombreOriginal: 'chaqueta.png', mime: 'image/png' },
        { id: 7, nombreOriginal: 'bicicleta_montania.jpg', mime: 'image/jpeg' },
        { id: 8, nombreOriginal: 'taladro.jpg', mime: 'image/jpeg' },
        { id: 9, nombreOriginal: 'escritorio.jpg', mime: 'image/jpeg' },
        { id: 10, nombreOriginal: 'lego_city.jpg', mime: 'image/jpeg' },
        { id: 11, nombreOriginal: 'carreola.jpg', mime: 'image/jpeg' },
        { id: 12, nombreOriginal: 'monitor_presion.png', mime: 'image/png' },
        { id: 13, nombreOriginal: 'set_maquillaje.png', mime: 'image/png' },
        { id: 14, nombreOriginal: 'ps5.png', mime: 'image/png' },
        { id: 15, nombreOriginal: 'cesta_supermercado.png', mime: 'image/png' },
    ];

    for (const archivo of archivosAPrecargar) {
        const rutaOrigen = path.join(__dirname, '../seed-images', archivo.nombreOriginal);
        
        if (!fs.existsSync(rutaOrigen)) {
            console.error(`[WARN] No se encontró la imagen origen en: ${rutaOrigen}`);
            continue;
        }

        const binario = fs.readFileSync(rutaOrigen);
        const stats = fs.statSync(rutaOrigen);

        const nombreUnico = `${Date.now()}-${archivo.nombreOriginal}`;

        let datosParaBD: Buffer | null = null;
        let inDb = false;

        if (guardandoEnBD) {
            datosParaBD = binario;
            inDb = true;
        } else {
            const rutaDestinoUploads = path.join(__dirname, '../uploads', nombreUnico);
            
            fs.mkdirSync(path.dirname(rutaDestinoUploads), { recursive: true });
            fs.writeFileSync(rutaDestinoUploads, binario);
        }

        const ids = await db.insert(Archivo).values({
            id: archivo.id,
            mime: archivo.mime,
            nombre: nombreUnico,
            size: stats.size,
            inDb: inDb,
            datos: datosParaBD
        }).onDuplicateKeyUpdate({ set: {id: sql`id`, mime: sql`mime`, nombre: sql`nombre`, size: sql`size`, inDb: sql`in_db`, datos: sql`datos` }}).$returningId();

        console.log(`✅ Archivo [${archivo.nombreOriginal}] precargado exitosamente (inDb: ${inDb}).`);

        rows = rows + ids.length;
    }
    return rows;
}

try {
    await seed();
    process.exit(0);
} catch (error) {
    console.error("Error durante el seeding:", error);
    process.exit(1);
}
