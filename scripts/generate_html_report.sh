#!/bin/bash

# Usage: ./generate-report.sh <path-to-jtl-file>
# Example: ./generate-report.sh results/results_20260820_1307.jtl

# rm -rf report

jmeter -g "$1" -o report