/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 98.14828754234098, "KoPercent": 1.8517124576590138};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.3450435313884222, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.5018248175182481, 500, 1500, "[GET] Search"], "isController": false}, {"data": [0.9529411764705882, 500, 1500, "[POST] Update product quantity"], "isController": false}, {"data": [0.7252730582524272, 500, 1500, "[POST] Search product - Autocomplete"], "isController": false}, {"data": [0.09689922480620156, 500, 1500, "[GET] Select Category"], "isController": false}, {"data": [0.10003767897513188, 500, 1500, "[GET] Product details"], "isController": false}, {"data": [1.0, 500, 1500, "JSR223 Sampler - Search terms script"], "isController": false}, {"data": [0.09034267912772585, 500, 1500, "Login Action"], "isController": true}, {"data": [0.9764705882352941, 500, 1500, "[POST] Ajax cart refresh"], "isController": false}, {"data": [0.9882352941176471, 500, 1500, "[POST] Ajax update cart"], "isController": false}, {"data": [0.9294117647058824, 500, 1500, "Update cart"], "isController": true}, {"data": [0.037195438050803525, 500, 1500, "[GET] Homepage"], "isController": false}, {"data": [0.17184643510054845, 500, 1500, "Search by term"], "isController": true}, {"data": [0.13208409506398539, 500, 1500, "[GET] Open Product - Search result"], "isController": false}, {"data": [0.1043613707165109, 500, 1500, "[POST] Login"], "isController": false}, {"data": [0.9458281444582815, 500, 1500, "[GET] View cart"], "isController": false}, {"data": [0.2127619760479042, 500, 1500, "[GET] Select Sub-Category"], "isController": false}, {"data": [0.5677018633540373, 500, 1500, "[POST] Add product to cart"], "isController": false}, {"data": [0.04843173431734318, 500, 1500, "Transaction Controller - Search"], "isController": true}, {"data": [0.037359900373599, 500, 1500, "Transaction Controller - Add to cart"], "isController": true}, {"data": [0.11248073959938366, 500, 1500, "[GET] Open Login page"], "isController": false}, {"data": [0.02699724517906336, 500, 1500, "Transaction Controller - Browse"], "isController": true}, {"data": [0.9582814445828145, 500, 1500, "[POST] Ajax Add to cart"], "isController": false}, {"data": [0.9823529411764705, 500, 1500, "[GET] View  cart"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 26570, 492, 1.8517124576590138, 21648.296876176188, 0, 216708, 16739.0, 71375.00000000001, 82166.25000000001, 100071.59000000007, 7.306508154580084, 2117.8984911146317, 162.15915157505162], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["[GET] Search", 1096, 5, 0.4562043795620438, 7183.369525547447, 61, 45415, 911.0, 17380.6, 19872.44999999999, 29445.24999999994, 0.3050716208516453, 8.929769521922012, 1.279974893785112], "isController": false}, {"data": ["[POST] Update product quantity", 85, 0, 0.0, 591.2352941176472, 66, 23619, 81.0, 123.4, 898.2000000000003, 23619.0, 0.02415533757652624, 0.050710945312742, 0.05156764943841682], "isController": false}, {"data": ["[POST] Search product - Autocomplete", 3296, 4, 0.12135922330097088, 3950.962682038836, 1, 43668, 102.0, 16322.6, 17780.3, 24929.47999999987, 0.9160856128698911, 20.900056329467855, 1.3702893924456845], "isController": false}, {"data": ["[GET] Select Category", 2709, 101, 3.728313030638612, 32201.584348468074, 0, 195806, 31298.0, 64942.0, 72305.5, 90019.50000000007, 0.7476520991802322, 123.41668601387242, 35.809066184701535], "isController": false}, {"data": ["[GET] Product details", 2654, 103, 3.8809344385832705, 32343.03278070835, 1, 115850, 32768.0, 60783.0, 67315.5, 81613.19999999984, 0.7331560572668362, 72.05807897047583, 12.672274580755731], "isController": false}, {"data": ["JSR223 Sampler - Search terms script", 3858, 0, 0.0, 0.6386728875064803, 0, 301, 0.0, 1.0, 1.0, 2.0, 1.0721741624368868, 0.0, 0.0], "isController": false}, {"data": ["Login Action", 1284, 5, 0.3894080996884735, 37789.19859813081, 314, 173305, 45318.0, 52438.5, 64656.25, 116372.75000000022, 0.3562447145936036, 12.986736530155671, 2.550406377175756], "isController": true}, {"data": ["[POST] Ajax cart refresh", 85, 0, 0.0, 267.29411764705884, 55, 15465, 67.0, 91.80000000000004, 118.60000000000005, 15465.0, 0.024155577835523818, 0.23255904671148803, 0.04810245858313043], "isController": false}, {"data": ["[POST] Ajax update cart", 85, 0, 0.0, 283.5058823529413, 51, 18564, 58.0, 76.4, 86.60000000000002, 18564.0, 0.024155873017406723, 0.01906077107891212, 0.04812663611635514], "isController": false}, {"data": ["Update cart", 85, 0, 0.0, 1477.2117647058826, 246, 78916, 291.0, 772.4000000000001, 1151.0, 78916.0, 0.02415405398800481, 0.6067407340076009, 0.1965497292543672], "isController": true}, {"data": ["[GET] Homepage", 3858, 167, 4.328667703473302, 58083.19440124416, 479, 216708, 67107.0, 91501.09999999999, 99206.99999999999, 117114.51, 1.061035970439505, 1708.004209546938, 63.40155285789062], "isController": false}, {"data": ["Search by term", 1094, 9, 0.8226691042047533, 18934.402193784295, 230, 140946, 16318.0, 35846.0, 41789.75, 84012.29999999986, 0.3058473313003152, 29.89947414885889, 2.6540332336918233], "isController": true}, {"data": ["[GET] Open Product - Search result", 1094, 21, 1.9195612431444242, 17018.28976234004, 16, 88613, 15823.0, 35288.0, 42600.75, 62114.049999999974, 0.3041645802848526, 33.06927239493393, 3.560309544543429], "isController": false}, {"data": ["[POST] Login", 1284, 3, 0.2336448598130841, 13902.76713395638, 1, 90869, 15028.5, 17966.5, 31448.25, 65487.70000000004, 0.3562934492785474, 8.404236384435913, 1.7474842888532593], "isController": false}, {"data": ["[GET] View cart", 803, 0, 0.0, 1349.5890410958905, 46, 56327, 110.0, 157.60000000000002, 1200.9999999999948, 46415.520000000084, 0.22497112216884488, 3.7354781626548217, 0.7654269026659498], "isController": false}, {"data": ["[GET] Select Sub-Category", 2672, 82, 3.068862275449102, 30899.698727544976, 0, 125425, 30375.5, 66886.6, 73862.39999999998, 90210.4, 0.7368546454934941, 134.92575465984038, 40.19257720591378], "isController": false}, {"data": ["[POST] Add product to cart", 805, 3, 0.37267080745341613, 6305.64596273292, 36, 46845, 92.0, 17069.8, 18757.699999999993, 27692.239999999983, 0.224158056769629, 0.6864307504059907, 0.39059144373034094], "isController": false}, {"data": ["Transaction Controller - Search", 1084, 29, 2.6752767527675276, 35851.4132841328, 392, 229559, 33866.0, 64441.5, 76285.25, 124210.45000000083, 0.30465047260169253, 62.91967358021006, 6.210336342711125], "isController": true}, {"data": ["Transaction Controller - Add to cart", 803, 44, 5.47945205479452, 71162.89539227898, 372, 299454, 35943.0, 184103.0, 197500.99999999997, 231221.76000000004, 0.22479175968837087, 68.4149250320881, 17.683470986501295], "isController": true}, {"data": ["[GET] Open Login page", 1298, 2, 0.15408320493066255, 23978.291987673336, 74, 86730, 29810.5, 34661.8, 37820.899999999994, 53875.26, 0.35901408867537354, 4.610632070077863, 0.8088237747330421], "isController": false}, {"data": ["Transaction Controller - Browse", 1815, 151, 8.319559228650137, 107885.87272727252, 255, 319054, 116471.0, 182821.80000000002, 197083.8, 229509.27999999994, 0.5062086561401297, 257.913697335561, 70.20791143468179], "isController": true}, {"data": ["[POST] Ajax Add to cart", 803, 1, 0.12453300124533001, 868.8231631382309, 1, 41088, 57.0, 74.0, 102.79999999999995, 23131.400000000012, 0.2249991734152409, 0.8052366097121748, 0.3937767374776612], "isController": false}, {"data": ["[GET] View  cart", 85, 0, 0.0, 335.1764705882353, 66, 21268, 77.0, 99.80000000000001, 133.30000000000007, 21268.0, 0.02415585928785685, 0.3044515252293741, 0.04876602856714547], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: An established connection was aborted by the software in your host machine", 14, 2.845528455284553, 0.05269100489273617], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 172.22.4.19:80 failed to respond", 15, 3.048780487804878, 0.05645464809936018], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 172.22.4.19:80 [/172.22.4.19] failed: Connection timed out: connect", 32, 6.504065040650406, 0.12043658261196838], "isController": false}, {"data": ["404/Not Found", 39, 7.926829268292683, 0.14678208505833648], "isController": false}, {"data": ["Assertion failed", 392, 79.67479674796748, 1.4753481369966128], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 26570, 492, "Assertion failed", 392, "404/Not Found", 39, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 172.22.4.19:80 [/172.22.4.19] failed: Connection timed out: connect", 32, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 172.22.4.19:80 failed to respond", 15, "Non HTTP response code: java.net.SocketException/Non HTTP response message: An established connection was aborted by the software in your host machine", 14], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["[GET] Search", 1096, 5, "Assertion failed", 5, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["[POST] Search product - Autocomplete", 3296, 4, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 172.22.4.19:80 [/172.22.4.19] failed: Connection timed out: connect", 2, "Non HTTP response code: java.net.SocketException/Non HTTP response message: An established connection was aborted by the software in your host machine", 1, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 172.22.4.19:80 failed to respond", 1, "", "", "", ""], "isController": false}, {"data": ["[GET] Select Category", 2709, 101, "Assertion failed", 77, "404/Not Found", 9, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 172.22.4.19:80 [/172.22.4.19] failed: Connection timed out: connect", 8, "Non HTTP response code: java.net.SocketException/Non HTTP response message: An established connection was aborted by the software in your host machine", 4, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 172.22.4.19:80 failed to respond", 3], "isController": false}, {"data": ["[GET] Product details", 2654, 103, "Assertion failed", 75, "404/Not Found", 21, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 172.22.4.19:80 [/172.22.4.19] failed: Connection timed out: connect", 5, "Non HTTP response code: java.net.SocketException/Non HTTP response message: An established connection was aborted by the software in your host machine", 1, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 172.22.4.19:80 failed to respond", 1], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["[GET] Homepage", 3858, 167, "Assertion failed", 156, "Non HTTP response code: java.net.SocketException/Non HTTP response message: An established connection was aborted by the software in your host machine", 6, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 172.22.4.19:80 [/172.22.4.19] failed: Connection timed out: connect", 5, "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["[GET] Open Product - Search result", 1094, 21, "Assertion failed", 19, "Non HTTP response code: java.net.SocketException/Non HTTP response message: An established connection was aborted by the software in your host machine", 1, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 172.22.4.19:80 failed to respond", 1, "", "", "", ""], "isController": false}, {"data": ["[POST] Login", 1284, 3, "Non HTTP response code: java.net.SocketException/Non HTTP response message: An established connection was aborted by the software in your host machine", 1, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 172.22.4.19:80 failed to respond", 1, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 172.22.4.19:80 [/172.22.4.19] failed: Connection timed out: connect", 1, "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["[GET] Select Sub-Category", 2672, 82, "Assertion failed", 60, "404/Not Found", 9, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 172.22.4.19:80 failed to respond", 7, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 172.22.4.19:80 [/172.22.4.19] failed: Connection timed out: connect", 6, "", ""], "isController": false}, {"data": ["[POST] Add product to cart", 805, 3, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 172.22.4.19:80 [/172.22.4.19] failed: Connection timed out: connect", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["[GET] Open Login page", 1298, 2, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 172.22.4.19:80 [/172.22.4.19] failed: Connection timed out: connect", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["[POST] Ajax Add to cart", 803, 1, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 172.22.4.19:80 failed to respond", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
