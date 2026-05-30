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

Descargue las imagenes para poblar la base de datos de la siguiente [carpeta Google Drive](https://drive.google.com/drive/folders/1aE2HeyF352HPMpiH8zevv3CC3m6dsT_Z)

Una vez tenga las imagenes, coloquelas en la raíz del directorio *seed-images*, las imagenes deben estar al mismo nivel que el archivo .gitkeep.

## Docker ##

Instale **docker** si no lo tiene instalado.

**Importante** el servicio mercadolibre-node tiene como *target* por defecto **development**, que entre otras cosas, expone la documentación de swagger e información de depuración detallada, para ejecutarlo con configuración de seguridad, cambie el *target* en el archivo *docker-compose-yml* a **production**

Ejecute el siguiente comando para construir los contenedores y levantar el servicio:

```bash
docker compose up --build
```

Ejecute este comando para poblar la base de datos.
**Nota**: solo hagalo si ya coloco las imagenes en el directorio *seed-images*, si aún no lo ha hecho, hagalo y vuelva a construir el contenedor.

```bash
docker compose exec -u mercado_libre mercado-libre-node npm run db:seed
```
