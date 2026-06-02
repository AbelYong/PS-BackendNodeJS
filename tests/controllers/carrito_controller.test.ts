import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';
import { Request, Response } from 'express';
import { db } from '../../src/drizzle/db.js';
import { 
    Usuario, Rol, Producto, Carrito, ProductoCarrito, Pedido, ProductoPedido 
} from '../../src/drizzle/schema.js';
import * as carritoController from '../../src/controllers/carrito_controller.js';
import { Cliente } from '../../src/config/roles.js';
import { 
    CarritoProductoInput, 
    ActualizarCarritoInput, 
    QuitarDelCarritoInput 
} from '../../src/schemas/carrito_schema.js';

function createMockReqRes<P = any, ResB = any, ReqB = any, ReqQ = any>(overrideReq: any = {}) {
    const req = {
        decodedToken: { name: 'test@ejemplo.com', role: Cliente },
        params: {},
        body: {},
        ...overrideReq
    } as unknown as Request<P, ResB, ReqB, ReqQ>;

    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
        send: vi.fn()
    } as unknown as Response;

    return { req, res };
}

describe('Carrito Controller - Integration Tests', () => {
    let testUserId: number;
    let testProductoId: number;

    
    beforeAll(async () => {
        // Crear un Rol
        const [rolResult] = await db.insert(Rol).values({ nombre: Cliente });
        const rolId = rolResult.insertId;

        const [userResult] = await db.insert(Usuario).values({
            email: 'test@ejemplo.com',
            passwordHash: 'hashedpassword',
            nombre: 'Usuario Test',
            rolId: rolId
        });
        testUserId = userResult.insertId;

        const [prodResult] = await db.insert(Producto).values({
            titulo: 'Producto de Integración',
            precio: '150.50'
        });
        testProductoId = prodResult.insertId;
    });

    beforeEach(async () => {
        await db.delete(ProductoPedido);
        await db.delete(Pedido);
        await db.delete(ProductoCarrito);
        await db.delete(Carrito);
        vi.clearAllMocks();
    });

    describe('create()', () => {
        it('debería crear un carrito nuevo y retornar 201', async () => {
            const { req, res } = createMockReqRes();

            await carritoController.create(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ id: expect.any(Number) })
            );

            const carritoDb = await db.query.Carrito.findFirst({
                where: { clienteId: testUserId }
            });
            expect(carritoDb).toBeDefined();
            expect(carritoDb?.cerrado).toBe(false);
        });

        it('debería retornar 400 si el cliente ya tiene un carrito abierto', async () => {
            await db.insert(Carrito).values({ clienteId: testUserId, cerrado: false });

            const { req, res } = createMockReqRes();
            await carritoController.create(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ code: 'OPEN_CART_EXISTS' })
            );
        });
    });

    describe('get()', () => {
        it('debería retornar los productos del carrito abierto', async () => {
            const [carritoResult] = await db.insert(Carrito).values({ clienteId: testUserId });
            await db.insert(ProductoCarrito).values({
                carritoId: carritoResult.insertId,
                productoId: testProductoId,
                cantidad: 2
            });

            const { req, res } = createMockReqRes();

            await carritoController.get(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    clienteId: testUserId,
                    productos: expect.arrayContaining([
                        expect.objectContaining({ cantidad: 2 })
                    ])
                })
            );
        });
    });

    describe('actualizarProductosCarrito()', () => {
        it('debería insertar el producto si no existe en el carrito (201)', async () => {
            const [carritoResult] = await db.insert(Carrito).values({ clienteId: testUserId });

            const { req, res } = createMockReqRes<CarritoProductoInput, {}, ActualizarCarritoInput>({
                params: { carritoId: carritoResult.insertId, productoId: testProductoId },
                body: { cantidad: 3 }
            });

            await carritoController.actualizarProductosCarrito(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.send).toHaveBeenCalled();

            const relacion = await db.query.ProductoCarrito.findFirst();
            expect(relacion?.cantidad).toBe(3);
        });
    });

    describe('quitarDelCarrito()', () => {
        it('debería eliminar el producto del carrito (204)', async () => {
            const [carritoResult] = await db.insert(Carrito).values({ clienteId: testUserId });
            await db.insert(ProductoCarrito).values({
                carritoId: carritoResult.insertId,
                productoId: testProductoId,
                cantidad: 1
            });

            const { req, res } = createMockReqRes<QuitarDelCarritoInput>({
                params: { 
                    carritoId: carritoResult.insertId, 
                    productoId: testProductoId 
                }
            });

            await carritoController.quitarDelCarrito(req, res);

            expect(res.status).toHaveBeenCalledWith(204);
            const relacion = await db.query.ProductoCarrito.findFirst();
            expect(relacion).toBeUndefined();
        });
    });
});