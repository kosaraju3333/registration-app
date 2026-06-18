#!/usr/bin/python3


import sys
import subprocess

username = sys.argv[1]

scripts_path = "/home/ubuntu/scripts"


print("🚀 Starting full Deprovisioning...")

# Step 1: VPN user Deleted
print("Creating VPN user...")
subprocess.run(["python3", f"{scripts_path}/vpn-user-delete.py", username])

# Step 2: Windows user Deleted
#print("Creating Windows user...")
#subprocess.run(["python3", f"{scripts_path}/windows-user-deletion.py", username])

# Step 3: MySQL user Deleted
#print("Creating MySQL user...")
#subprocess.run(["python3", f"{scripts_path}/mysql-user-delete.py", username])

print("✅ Deprovisioning completed successfully")


