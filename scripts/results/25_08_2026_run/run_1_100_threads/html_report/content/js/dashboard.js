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

    var data = {"OkPercent": 99.69887670862093, "KoPercent": 0.301123291379077};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.38650247924828096, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.5526742301458671, 500, 1500, "[GET] Search"], "isController": false}, {"data": [0.9381443298969072, 500, 1500, "[POST] Update product quantity"], "isController": false}, {"data": [0.7660637149028078, 500, 1500, "[POST] Search product - Autocomplete"], "isController": false}, {"data": [0.15114732291320251, 500, 1500, "[GET] Select Category"], "isController": false}, {"data": [0.16733870967741934, 500, 1500, "[GET] Product details"], "isController": false}, {"data": [1.0, 500, 1500, "JSR223 Sampler - Search terms script"], "isController": false}, {"data": [0.15666901905434016, 500, 1500, "Login Action"], "isController": true}, {"data": [0.9587628865979382, 500, 1500, "[POST] Ajax cart refresh"], "isController": false}, {"data": [0.9896907216494846, 500, 1500, "[POST] Ajax update cart"], "isController": false}, {"data": [0.9329896907216495, 500, 1500, "Update cart"], "isController": true}, {"data": [0.060796397250533304, 500, 1500, "[GET] Homepage"], "isController": false}, {"data": [0.24513776337115073, 500, 1500, "Search by term"], "isController": true}, {"data": [0.21191247974068073, 500, 1500, "[GET] Open Product - Search result"], "isController": false}, {"data": [0.1803105151729005, 500, 1500, "[POST] Login"], "isController": false}, {"data": [0.9562363238512035, 500, 1500, "[GET] View cart"], "isController": false}, {"data": [0.2646174406949549, 500, 1500, "[GET] Select Sub-Category"], "isController": false}, {"data": [0.6176148796498906, 500, 1500, "[POST] Add product to cart"], "isController": false}, {"data": [0.08441558441558442, 500, 1500, "Transaction Controller - Search"], "isController": true}, {"data": [0.0650984682713348, 500, 1500, "Transaction Controller - Add to cart"], "isController": true}, {"data": [0.19641602248770204, 500, 1500, "[GET] Open Login page"], "isController": false}, {"data": [0.046030199707744766, 500, 1500, "Transaction Controller - Browse"], "isController": true}, {"data": [0.9682713347921226, 500, 1500, "[POST] Ajax Add to cart"], "isController": false}, {"data": [0.9896907216494846, 500, 1500, "[GET] View  cart"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 29556, 89, 0.301123291379077, 9107.445188794114, 0, 78040, 7986.0, 32093.9, 36072.95, 42884.96000000001, 8.172088320267559, 2342.2160153363, 181.30891407926035], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["[GET] Search", 1234, 2, 0.1620745542949757, 3115.8419773095598, 61, 26598, 163.0, 8157.5, 8815.0, 14437.250000000013, 0.34426288963221896, 10.142882873897676, 1.4478354279014751], "isController": false}, {"data": ["[POST] Update product quantity", 97, 0, 0.0, 509.59793814433, 64, 9379, 80.0, 130.60000000000008, 6499.99999999999, 9379.0, 0.027680096840388288, 0.057980004714890725, 0.059074913506831424], "isController": false}, {"data": ["[POST] Search product - Autocomplete", 3704, 2, 0.05399568034557235, 1658.350701943844, 7, 16935, 102.0, 7529.0, 8163.0, 9797.699999999999, 1.031752288086186, 23.125429218544436, 1.5464146686331426], "isController": false}, {"data": ["[GET] Select Category", 3007, 11, 0.36581310276022616, 13350.943797805134, 1, 63307, 12980.0, 27897.200000000004, 31738.199999999997, 37178.16000000003, 0.8334432765213458, 137.0326167074369, 39.889279071479194], "isController": false}, {"data": ["[GET] Product details", 2976, 16, 0.5376344086021505, 13867.386088709673, 1, 48713, 13999.0, 26778.800000000003, 29062.6, 34983.69, 0.8259900431563144, 81.47456951236335, 14.421806742112503], "isController": false}, {"data": ["JSR223 Sampler - Search terms script", 4219, 0, 0.0, 1.324484474994077, 0, 466, 0.0, 1.0, 1.0, 13.0, 1.1720649066709634, 0.0, 0.0], "isController": false}, {"data": ["Login Action", 1417, 3, 0.2117148906139732, 16287.568807339443, 307, 66193, 20806.0, 24766.2, 25536.1, 43692.65999999995, 0.39350726891514737, 10.990827670041934, 2.6646497473756927], "isController": true}, {"data": ["[POST] Ajax cart refresh", 97, 0, 0.0, 318.6804123711341, 55, 8145, 72.0, 99.4, 587.899999999975, 8145.0, 0.027680333807703867, 0.27341714550196, 0.05509202391181331], "isController": false}, {"data": ["[POST] Ajax update cart", 97, 0, 0.0, 199.31958762886595, 50, 13395, 59.0, 74.0, 86.19999999999999, 13395.0, 0.027680633972128173, 0.02184202892269541, 0.05511965319661383], "isController": false}, {"data": ["Update cart", 97, 0, 0.0, 1184.7216494845359, 244, 33756, 296.0, 411.4000000000002, 9907.59999999998, 33756.0, 0.02767857244766467, 0.7017711330359171, 0.22432356074633417], "isController": true}, {"data": ["[GET] Homepage", 4219, 31, 0.7347712728134629, 24687.466224223725, 488, 78040, 30174.0, 39594.0, 42390.0, 47494.80000000002, 1.166744329785719, 1885.1255229621554, 69.98211162851956], "isController": false}, {"data": ["Search by term", 1234, 4, 0.3241491085899514, 8083.002431118313, 235, 60568, 7503.0, 16313.0, 17481.75, 37201.200000000186, 0.34419855291564627, 33.28113499621005, 2.9953862070239934], "isController": true}, {"data": ["[GET] Open Product - Search result", 1234, 4, 0.3241491085899514, 7172.421393841162, 97, 41034, 7200.5, 15730.0, 18073.0, 24711.600000000064, 0.34256633822124233, 37.25562397884209, 4.00760318691838], "isController": false}, {"data": ["[POST] Login", 1417, 2, 0.14114326040931546, 5995.133380381088, 230, 45954, 6924.0, 8825.2, 9554.599999999999, 27252.179999999902, 0.39357721973941134, 6.810353494299797, 1.837427768806714], "isController": false}, {"data": ["[GET] View cart", 914, 1, 0.10940919037199125, 512.6301969365413, 1, 29420, 112.5, 161.0, 454.5, 15929.100000000075, 0.2559233372403176, 3.801149918557438, 0.8424842281818354], "isController": false}, {"data": ["[GET] Select Sub-Category", 2993, 16, 0.5345806882726362, 12808.05212161709, 0, 51595, 11318.0, 28716.799999999996, 31967.999999999985, 37989.439999999995, 0.829682738524085, 152.75975434232052, 45.74603767715654], "isController": false}, {"data": ["[POST] Add product to cart", 914, 2, 0.2188183807439825, 2653.043763676148, 1, 13291, 91.0, 7985.0, 8690.5, 10210.650000000001, 0.25593838661369434, 0.7960471489646817, 0.4465962631630456], "isController": false}, {"data": ["Transaction Controller - Search", 1232, 7, 0.5681818181818182, 15209.011363636353, 349, 97061, 15286.5, 26690.4, 32202.19999999999, 49016.59000000017, 0.34376294866017554, 70.62101572560282, 7.010534051139622], "isController": true}, {"data": ["Transaction Controller - Add to cart", 914, 7, 0.7658643326039387, 30538.543763676116, 426, 123664, 16251.0, 80182.0, 88187.25, 102375.3, 0.25578933257734615, 79.24079274281026, 20.69105135520071], "isController": true}, {"data": ["[GET] Open Login page", 1423, 1, 0.07027406886858749, 10304.96556570625, 9, 23961, 13440.0, 16458.8, 17206.199999999997, 19644.999999999996, 0.3945730265109818, 4.19301942771314, 0.8297923127927064], "isController": false}, {"data": ["Transaction Controller - Browse", 2053, 14, 0.6819288845591817, 45357.6580613736, 440, 144421, 50385.0, 80893.6, 86084.5, 97212.78, 0.571986587708557, 292.1940775388522, 79.80596235898845], "isController": true}, {"data": ["[POST] Ajax Add to cart", 914, 1, 0.10940919037199125, 286.48905908096265, 0, 13665, 58.0, 79.0, 100.25, 9080.10000000001, 0.2559398916483789, 0.9182340213981431, 0.44897606629487247], "isController": false}, {"data": ["[GET] View  cart", 97, 0, 0.0, 157.1237113402062, 67, 7578, 76.0, 99.00000000000001, 116.39999999999998, 7578.0, 0.027680562879965665, 0.34857923714508954, 0.055051792794435575], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 172.22.4.19:80 failed to respond", 17, 19.10112359550562, 0.05751793206117201], "isController": false}, {"data": ["404/Not Found", 3, 3.3707865168539324, 0.010150223304912708], "isController": false}, {"data": ["Assertion failed", 69, 77.52808988764045, 0.23345513601299228], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 29556, 89, "Assertion failed", 69, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 172.22.4.19:80 failed to respond", 17, "404/Not Found", 3, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["[GET] Search", 1234, 2, "Assertion failed", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["[POST] Search product - Autocomplete", 3704, 2, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 172.22.4.19:80 failed to respond", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["[GET] Select Category", 3007, 11, "Assertion failed", 8, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 172.22.4.19:80 failed to respond", 3, "", "", "", "", "", ""], "isController": false}, {"data": ["[GET] Product details", 2976, 16, "Assertion failed", 11, "404/Not Found", 3, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 172.22.4.19:80 failed to respond", 2, "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["[GET] Homepage", 4219, 31, "Assertion failed", 31, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["[GET] Open Product - Search result", 1234, 4, "Assertion failed", 4, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["[POST] Login", 1417, 2, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 172.22.4.19:80 failed to respond", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["[GET] View cart", 914, 1, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 172.22.4.19:80 failed to respond", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["[GET] Select Sub-Category", 2993, 16, "Assertion failed", 13, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 172.22.4.19:80 failed to respond", 3, "", "", "", "", "", ""], "isController": false}, {"data": ["[POST] Add product to cart", 914, 2, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 172.22.4.19:80 failed to respond", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["[GET] Open Login page", 1423, 1, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 172.22.4.19:80 failed to respond", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["[POST] Ajax Add to cart", 914, 1, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 172.22.4.19:80 failed to respond", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
