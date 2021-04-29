#!/bin/python

import json
import sys
inFile = sys.argv[1]

with open(inFile,'r') as f:
    data = json.load(f)

output = ""
for k, v in data.items():
    output = '--build_args {}="{}" {}'.format(k, v, output)
print(output)
