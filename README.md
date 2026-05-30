# Programación Segura - Backend NodeJS #

## Inicializacion del Proyecto ##

Descargue las dependencias, abra el terminal en la raiz del proyecto:

```bash
npm install
```

Ejecute este comando para generar los archivos de migracion de la base de datos:

```bash
npm run db:generate
```

Para crear el contenedor debe existir un archivo **swagger-output.json**. Ingrese el comando:

```bash
npm run swagger
```

Instale **docker** si no lo tiene instalado, luego abra el terminal y ejecute:

```bash
docker compose up --build
```

Ejecute este comando para poblar la base de datos:

```bash
docker compose exec -u mercado_libre mercado-libre-node npm run db:seed
```
