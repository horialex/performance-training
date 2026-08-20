@echo off

REM Usage: generate-report.bat <path-to-jtl-file>
REM Example: generate-report.bat results\results_20260820_1307.jtl

REM if exist report rmdir /s /q report

jmeter -g "%~1" -o report