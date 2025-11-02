IMPORTANTE:
Para probar las cosas hay que reiniciar las tablas porque ya las tendreis creadas y faltaran columnas.
Ejecutar este Script de la siguiente forma:
docker compose exec -T db psql -U josevc -h localhost -d tato_db < app/sql/cleanup.sql
