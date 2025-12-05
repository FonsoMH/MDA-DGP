-- -----------------------------------------------------------------
-- SCRIPT DE LIMPIEZA TOTAL
-- ¡CUIDADO! Este script borrará permanentemente todas las tablas
-- y sus datos, incluyendo usuarios, juegos y resultados.
-- -----------------------------------------------------------------

-- La sentencia 'CASCADE' se encarga de borrar todas las dependencias
-- (como claves foráneas e índices) automáticamente.

DROP TABLE IF EXISTS game_results CASCADE;
DROP TABLE IF EXISTS student_game_configuration CASCADE;
DROP TABLE IF EXISTS accessibility_settings CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS games CASCADE;
DROP TABLE IF EXISTS user_deletion CASCADE;


-- Mensaje de confirmación (solo para psql)
echo '¡Limpieza completada! Todas las tablas han sido eliminadas.'