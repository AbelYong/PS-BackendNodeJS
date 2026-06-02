import dotenv from "dotenv";
import express, { Request, Response} from "express";
import cors from "cors";
import helmet from "helmet";
import { categoriasRouter } from "./routes/categorias_routes.js";
import { productosRouter } from "./routes/productos_routes.js";
import { usuariosRouter } from "./routes/usuarios_routes.js";
import { rolesRouter } from "./routes/roles_routes.js";
import { authRouter } from "./routes/auth_routes.js";
import { archivosRouter } from "./routes/archivos_routes.js";
import { bitacoraRouter } from "./routes/bitacora_routes.js";
import { carritoRouter } from "./routes/carrito_routes.js";
import { pedidoRouter } from "./routes/pedidos_routes.js";
import { errorHandler } from "./middlewares/errorhandler.js";
import { bitacoraLogger } from "./middlewares/bitacora.js";
import swaggerUi from "swagger-ui-express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();

app.disable("x-powered-by");
app.use(helmet());

dotenv.config();

const port = process.env["SERVER_PORT"];

// Configuración de Expres
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const corsOptions = {
    origin: ["http://localhost:8080", "http://localhost:8081"],
    methods: "GET,PUT,POST,DELETE"
}

app.use(cors(corsOptions));

// Swagger
const __filename = fileURLToPath(import.meta.url);
const __dirname = (path.dirname(__filename));

const swaggerFile = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../swagger-output.json"), "utf8")
);

app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerFile));

//Bitacora
app.use(bitacoraLogger);

//Rutas
app.use("/api/categorias", categoriasRouter);
app.use("/api/productos", productosRouter);
app.use("/api/usuarios", usuariosRouter);
app.use("/api/roles", rolesRouter);
app.use("/api/auth", authRouter);
app.use("/api/archivos", archivosRouter);
app.use("/api/bitacora", bitacoraRouter);
app.use("/api/carritos", carritoRouter);
app.use("/api/pedidos", pedidoRouter);

app.get("/*splat", (_req: Request, res: Response) => res.status(404).json({message: "Recurso no encontrado"}));

// Ultimo middleware
app.use(errorHandler);

app.listen(port, () => {
    console.log(`Mercado libre Node escuchando en el puerto ${port} en entorno ${process.env["NODE_ENV"]}`);
});

//change to trigger sonarcloud analysis 2
