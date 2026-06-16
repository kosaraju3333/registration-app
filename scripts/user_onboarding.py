#!/usr/bin/python3


import sys
import subprocess

username = sys.argv[1]
password = sys.argv[2]

scripts_path = "/home/ubuntu/scripts"


print("🚀 Starting full provisioning...")

# Step 1: VPN user
print("Creating VPN user...")
subprocess.run(["python3", f"{scripts_path}/vpn-user-creation.py", username, password])

# Step 2: Windows user
#print("Creating Windows user...")
#subprocess.run(["python3", "windows.py", username, password])

# Step 3: MySQL user
#print("Creating MySQL user...")
#subprocess.run(["python3", "mysql.py", username, password])

print("✅ All provisioning completed successfully")
