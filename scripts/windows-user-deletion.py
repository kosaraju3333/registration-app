#!/usr/bin/python3

import subprocess

username = ""

result = subprocess.run(
    [
        "ssh",
        "Administrator@training-host.turingiq.ai",
        f'powershell -ExecutionPolicy Bypass -File "C:\\Scripts\\delete_user.ps1" "{username}"'
    ],
    capture_output=True,
    text=True
)

print(result.stdout)
print(result.stderr)
