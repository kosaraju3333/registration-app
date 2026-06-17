#!/usr/bin/python3

import mysql.connector
import subprocess
import sys

username = sys.argv[1]
password = sys.argv[2]


#username = "rk"
#password = "Rk@123"

conn = mysql.connector.connect(
    host="training-host.turingiq.ai",
    user="automation",
    password="@"
)

cursor = conn.cursor()

cursor.execute(
    f"CREATE USER IF NOT EXISTS '{username}'@'localhost' IDENTIFIED BY '{password}'"
)

cursor.execute(
    f"CREATE DATABASE IF NOT EXISTS `{username}`"
)

cursor.execute(
    f"GRANT ALL PRIVILEGES ON `{username}`.* TO '{username}'@'localhost'"
)

conn.commit()
conn.close()

# Import SQL dump
with open("/home/ubuntu/scripts/mysqlsampledatabase.sql", "r") as sql_file:
    subprocess.run(
        [
            "mysql",
            "-h", "training-host.turingiq.ai",
            "-u", "automation",
            "-pAutomation@Training123",
            username
        ],
        stdin=sql_file,
        check=True
    )

print("DATABASE_CREATED_AND_IMPORTED_SUCCESS")
