#!/usr/bin/python3

import subprocess
import sys

username = sys.argv[1]
password = sys.argv[2]

#username = "student1"
#password = "Password123"

linux_script = f"""
sudo useradd -m -s /bin/bash {username}
echo "{username}:{password}" | sudo chpasswd
#sudo usermod -aG students {username}
echo USER_CREATED_SUCCESS
"""

result = subprocess.run(
    [
        "ssh",
        "ubuntu@vpn-internal.turingiq.ai",
        linux_script
    ],
    capture_output=True,
    text=True
)

print(result.stdout)
print(result.stderr)
