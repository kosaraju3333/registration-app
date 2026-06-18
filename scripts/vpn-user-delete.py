#!/usr/bin/python3

import subprocess
import sys

username = sys.argv[1]

linux_script = f"""
sudo userdel -r {username}
echo USER_DELETED_SUCCESS
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
