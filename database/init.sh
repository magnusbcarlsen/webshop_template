#!/bin/bash
echo "Creating MySQL users and databases..."
mysql -u root -p$MYSQL_ROOT_PASSWORD <<EOSQL
CREATE USER IF NOT EXISTS '$MYSQL_USER'@'%' IDENTIFIED BY '$MYSQL_ROOT_PASSWORD';
GRANT ALL PRIVILEGES ON $MYSQL_DATABASE.* TO '$MYSQL_USER'@'%';
FLUSH PRIVILEGES;
EOSQL
echo "MySQL users and databases created."