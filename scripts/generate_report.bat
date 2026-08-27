@echo off

set "JTL=%~1"
set "DIR=%~dp1"
set "NAME=%~n1"

call jmeter -g "%JTL%" -o "%DIR%%NAME%_html"