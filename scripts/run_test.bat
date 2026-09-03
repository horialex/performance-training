@echo off
setlocal EnableExtensions EnableDelayedExpansion

REM Anchor relative paths (SCRIPT, RESULTS_DIR) to this script, not the caller cwd
cd /d "%~dp0"

REM ============================================================
REM JMeter Performance Test
REM ============================================================

REM ------------------------------------------------------------
REM Test Configuration
REM ------------------------------------------------------------

set "HEAP=-Xms2g -Xmx4g -XX:MaxMetaspaceSize=256m"
set "SCRIPT=script_v2.jmx"
set "TEST_TYPE=LOAD"

set "HOST=172.22.4.19"
set "PORT=80"
set "PROTOCOL=http"
set "LANG=en"

set "THREADS=50"
set "RAMP_UP=300"
set "DURATION=3600"

set "WAIT_TIME_SHORT=1000"
set "WAIT_TIME_MID=3000"
set "WAIT_TIME_LONG=5000"

REM ------------------------------------------------------------
REM Results directory
REM ------------------------------------------------------------

set "RUN_NAME=02_09_2026_run"
set "RESULTS_DIR=results\%RUN_NAME%"

if not exist "%RESULTS_DIR%" mkdir "%RESULTS_DIR%"

REM ------------------------------------------------------------
REM JTL filename - timestamp is YYYYMMDD_HHMMSS, locale-independent
REM ------------------------------------------------------------

for /f %%I in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMdd_HHmmss"') do set "TIMESTAMP=%%I"

set "JTL_FILE=%RESULTS_DIR%\%TEST_TYPE%_%THREADS%_users_%RAMP_UP%_RampUp_%DURATION%_Duration_%TIMESTAMP%.jtl"

REM ------------------------------------------------------------
REM Display configuration
REM ------------------------------------------------------------

echo.
echo ============================================================
echo JMeter Performance Test
echo ============================================================
echo Test Type : %TEST_TYPE%
echo Threads   : %THREADS%
echo Ramp-up   : %RAMP_UP% seconds
echo Duration  : %DURATION% seconds
echo Host      : %HOST%
echo JTL       : %JTL_FILE%
echo ============================================================
echo.

REM ------------------------------------------------------------
REM Run JMeter
REM ------------------------------------------------------------

call jmeter ^
    -n ^
    -t "%SCRIPT%" ^
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
    -Jjmeter.save.saveservice.subresults=false ^
    -l "%JTL_FILE%"

if errorlevel 1 (
    echo.
    echo ERROR: JMeter test failed.
    echo.
    pause
    exit /b 1
)

echo.
echo ============================================================
echo TEST COMPLETED
echo ============================================================
echo.
echo JTL:
echo %JTL_FILE%
echo.
echo ============================================================

pause
endlocal