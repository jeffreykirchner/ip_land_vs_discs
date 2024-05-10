echo "setup ip_land_vs_discs"
sudo service postgresql restart
echo "drop template db: enter db password"
dropdb ip_land_vs_discs -U dbadmin -h localhost -i -p 5433
echo "create database: enter db password"
createdb -h localhost -p 5433 -U dbadmin -O dbadmin ip_land_vs_discs
echo "restore database: enter db password"
pg_restore -v --no-owner --role=dbowner --host=localhost --port=5433 --username=dbadmin --dbname=ip_land_vs_discs database_dumps/ip_land_vs_discs.sql