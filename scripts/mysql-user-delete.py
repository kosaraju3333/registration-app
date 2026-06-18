#!/usr/bin/python3

import mysql.connector
import sys

username = sys.argv[1]


conn = mysql.connector.connect(
    host="training-host.turingiq.ai",
    user="automation",
    password="Automation@Training123"
)

cursor = conn.cursor()

# Drop database
cursor.execute(
    f"DROP DATABASE IF EXISTS `{username}`"
)

# Drop user
cursor.execute(
    f"DROP USER IF EXISTS '{username}'@'localhost'"
)

# Apply changes
conn.commit()

cursor.close()
conn.close()

print("MYSQL_USER_AND_DATABASE_DELETED_SUCCESS")
