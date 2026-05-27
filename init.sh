#!/bin/bash
set -e

mysql -u root -p"${MYSQL_ROOT_PASSWORD}" <<-EOSQL
    CREATE USER '${APP_USER}'@'%' IDENTIFIED BY '${APP_PASSWORD}';
    GRANT SELECT, INSERT, UPDATE, DELETE ON \`${MYSQL_DATABASE}\`.* TO '${APP_USER}'@'%';
    FLUSH PRIVILEGES;
EOSQL

echo "Usuario ${APP_USER} creado con permisos limitados sobre ${MYSQL_DATABASE}."