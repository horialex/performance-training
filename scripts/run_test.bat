@echo off


REM ==============================
REM JMeter JVM Memory Configuration
REM ==============================

set SCRIPT=script.jmx
set HEAP=-Xms2g -Xmx4g -XX:MaxMetaspaceSize=256m
set RESULTS_DIR=results

set HOST=172.22.4.19
set PORT=80
set PROTOCOL=http

set LANG=en

set THREADS=1
set RAMP_UP=1
set DURATION=120

set WAIT_TIME_SHORT=1000
set WAIT_TIME_MID=3000
set WAIT_TIME_LONG=5000



if not exist "%RESULTS_DIR%" mkdir "%RESULTS_DIR%"

for /f "tokens=1-3 delims=/ " %%a in ('date /t') do set DATE=%%c%%a%%b
for /f "tokens=1-2 delims=:." %%a in ("%time%") do set TIME=%%a%%b

set TIMESTAMP=%DATE%_%TIME%

jmeter ^
    -n ^
    -t %SCRIPT% ^
    -JHOST=%HOST% ^
    -JPORT=%PORT% ^
    -JPROTOCOL=%PROTOCOL% ^
    -JLANG=%LANG% ^
    -JTHREADS=%THREADS% ^
    -JRAMP_UP=%RAMP_UP% ^
    -JDURATION=%DURATION% ^
    -JWAIT_TIME_SHORT=%WAIT_TIME_SHORT% ^
    -JWAIT_TIME_MID=%WAIT_TIME_MID% ^
    -JWAIT_TIME_LONG=%WAIT_TIME_LONG% ^
    -l "%RESULTS_DIR%\results_%TIMESTAMP%.jtl"