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

    var data = {"OkPercent": 99.54963775210496, "KoPercent": 0.45036224789504603};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.30989623324485005, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.5405946255002859, 500, 1500, "[GET] Search"], "isController": false}, {"data": [0.8394160583941606, 500, 1500, "[POST] Update product quantity"], "isController": false}, {"data": [0.8307955843167111, 500, 1500, "[POST] Search product - Autocomplete"], "isController": false}, {"data": [0.15077866918357716, 500, 1500, "[GET] Select Category"], "isController": false}, {"data": [0.081480605487228, 500, 1500, "[GET] Product details"], "isController": false}, {"data": [0.190560323069157, 500, 1500, "Login Action"], "isController": true}, {"data": [0.9890510948905109, 500, 1500, "[POST] Ajax cart refresh"], "isController": false}, {"data": [0.9927007299270073, 500, 1500, "[POST] Ajax update cart"], "isController": false}, {"data": [0.8357664233576643, 500, 1500, "Update cart"], "isController": true}, {"data": [0.024205877356888058, 500, 1500, "[GET] Homepage"], "isController": false}, {"data": [0.3021726700971984, 500, 1500, "Search by term"], "isController": true}, {"data": [0.14951400800457404, 500, 1500, "[GET] Open Product - Search result"], "isController": false}, {"data": [0.22942958101968702, 500, 1500, "[POST] Login"], "isController": false}, {"data": [0.9665641813989239, 500, 1500, "[GET] View cart"], "isController": false}, {"data": [0.25088631529189315, 500, 1500, "[GET] Select Sub-Category"], "isController": false}, {"data": [0.7632590315142198, 500, 1500, "[POST] Add product to cart"], "isController": false}, {"data": [0.04888507718696398, 500, 1500, "Transaction Controller - Search"], "isController": true}, {"data": [0.04342813220599539, 500, 1500, "Transaction Controller - Add to cart"], "isController": true}, {"data": [0.3308934881373044, 500, 1500, "[GET] Open Login page"], "isController": false}, {"data": [0.015598217346588962, 500, 1500, "Transaction Controller - Browse"], "isController": true}, {"data": [0.9803996925441968, 500, 1500, "[POST] Ajax Add to cart"], "isController": false}, {"data": [0.9927007299270073, 500, 1500, "[GET] View  cart"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 35749, 161, 0.45036224789504603, 3955.9017874625893, 0, 18697, 3284.5, 10528.0, 11767.95, 14038.780000000035, 9.163012893168327, 3040.8311366117523, 236.43599065577226], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["[GET] Search", 1749, 5, 0.2858776443682104, 1339.4008004574036, 61, 8011, 206.0, 3401.0, 4047.0, 5240.0, 0.4510573154842896, 13.34324625364856, 1.9147757996596309], "isController": false}, {"data": ["[POST] Update product quantity", 137, 0, 0.0, 565.7299270072991, 63, 4761, 84.0, 2571.600000000001, 3843.899999999999, 4722.620000000001, 0.03601472134595163, 0.07639855867179285, 0.07668839543901157], "isController": false}, {"data": ["[POST] Search product - Autocomplete", 5254, 6, 0.11419870574800152, 545.1752950133225, 3, 6705, 99.0, 2288.5, 3126.25, 4550.249999999999, 1.352495139872813, 31.12591983513988, 2.024886156331217], "isController": false}, {"data": ["[GET] Select Category", 4238, 32, 0.7550731477111845, 4864.485842378487, 0, 13600, 4937.0, 8885.0, 9956.199999999999, 11717.489999999998, 1.0883251066946376, 181.82055538614676, 52.69392423666372], "isController": false}, {"data": ["[GET] Product details", 4228, 46, 1.0879848628192998, 4880.335856196776, 1, 14286, 4973.5, 8294.0, 8946.55, 10445.130000000001, 1.0872321199432007, 106.80674273683364, 18.85713560928843], "isController": false}, {"data": ["Login Action", 1981, 14, 0.7067137809187279, 5191.960625946483, 2, 15176, 6061.0, 8555.2, 9155.199999999999, 10963.76000000001, 0.5082144228739076, 14.16686536162753, 3.435292886540553], "isController": true}, {"data": ["[POST] Ajax cart refresh", 137, 0, 0.0, 111.57664233576641, 54, 4557, 67.0, 94.80000000000001, 106.39999999999998, 3199.260000000016, 0.036015100053628325, 0.34949367525880926, 0.07152959103802353], "isController": false}, {"data": ["[POST] Ajax update cart", 137, 0, 0.0, 78.63503649635034, 50, 2135, 59.0, 78.2, 85.19999999999999, 1435.4200000000083, 0.036015421961415654, 0.028418675616323767, 0.07156540168959649], "isController": false}, {"data": ["Update cart", 137, 0, 0.0, 874.4233576642341, 245, 12029, 306.0, 3134.4, 4228.599999999998, 10091.000000000024, 0.03601291312660169, 0.9083251558117088, 0.29184532310877664], "isController": true}, {"data": ["[GET] Homepage", 5887, 16, 0.27178528962119924, 10007.212332257497, 480, 18697, 10401.0, 13037.0, 13916.999999999996, 15703.399999999998, 1.50892771551881, 2439.0252149960074, 90.51907002477415], "isController": false}, {"data": ["Search by term", 1749, 11, 0.6289308176100629, 2974.1429388221836, 229, 17433, 2769.0, 6124.0, 6911.5, 10088.5, 0.4509829959555927, 44.48346832821068, 3.939640815508245], "isController": true}, {"data": ["[GET] Open Product - Search result", 1749, 5, 0.2858776443682104, 2910.6821040594627, 99, 11634, 2640.0, 5424.0, 6413.5, 7924.5, 0.45058866356020694, 48.79164066652214, 5.233960875542851], "isController": false}, {"data": ["[POST] Login", 1981, 5, 0.2523977788995457, 2322.7349823321533, 1, 9848, 2230.0, 4206.599999999999, 4879.399999999998, 7156.1600000000035, 0.5082502797813883, 8.785975231521984, 2.371056265820284], "isController": false}, {"data": ["[GET] View cart", 1301, 0, 0.0, 247.58570330514996, 45, 8087, 113.0, 152.0, 210.89999999999986, 5258.760000000004, 0.335310401813202, 4.9820975257939, 1.0982657508742941], "isController": false}, {"data": ["[GET] Select Sub-Category", 4231, 32, 0.7563223824155046, 4521.915386433464, 4, 15385, 4871.0, 8728.6, 9683.4, 11589.920000000013, 1.087310157599581, 199.37654226070183, 59.57964357176054], "isController": false}, {"data": ["[POST] Add product to cart", 1301, 4, 0.3074558032282859, 718.5580322828592, 15, 7010, 81.0, 2778.3999999999996, 3677.8999999999987, 5006.960000000003, 0.335374883901258, 1.0341524443828058, 0.585714306774186], "isController": false}, {"data": ["Transaction Controller - Search", 1749, 16, 0.9148084619782733, 5884.825042881638, 362, 24235, 5775.0, 9538.0, 11077.0, 15373.5, 0.45056208199354014, 93.23071307213527, 9.169615956605256], "isController": true}, {"data": ["Transaction Controller - Add to cart", 1301, 16, 1.2298232129131437, 10566.849346656427, 426, 34400, 8149.0, 22284.2, 24828.1, 30102.94, 0.3352607173909346, 102.75116028216402, 26.477366551545884], "isController": true}, {"data": ["[GET] Open Login page", 1981, 10, 0.5047955577990914, 2869.2256436143402, 0, 8608, 3192.0, 5934.0, 6462.499999999999, 7270.18, 0.5083730138872316, 5.383189306876637, 1.0647360509380266], "isController": false}, {"data": ["Transaction Controller - Browse", 2917, 73, 2.5025711347274595, 16298.07541995202, 518, 36115, 16757.0, 24022.200000000008, 25976.3, 29104.02000000001, 0.7498838027155202, 386.0032972445594, 105.4029524541824], "isController": true}, {"data": ["[POST] Ajax Add to cart", 1301, 0, 0.0, 127.07916986933122, 34, 6477, 59.0, 78.0, 88.89999999999986, 2808.080000000001, 0.3353766129849266, 1.2012325875961951, 0.5883052333509743], "isController": false}, {"data": ["[GET] View  cart", 137, 0, 0.0, 118.4817518248175, 66, 4926, 80.0, 103.2, 111.19999999999999, 3106.1800000000217, 0.03601529887834689, 0.45407136277027577, 0.0720798887679324], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 172.22.4.19:80 failed to respond", 61, 37.88819875776397, 0.17063414361240875], "isController": false}, {"data": ["404/Not Found", 12, 7.453416149068323, 0.03356737251391647], "isController": false}, {"data": ["Assertion failed", 88, 54.6583850931677, 0.2461607317687208], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 35749, 161, "Assertion failed", 88, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 172.22.4.19:80 failed to respond", 61, "404/Not Found", 12, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["[GET] Search", 1749, 5, "Assertion failed", 5, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["[POST] Search product - Autocomplete", 5254, 6, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 172.22.4.19:80 failed to respond", 6, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["[GET] Select Category", 4238, 32, "Assertion failed", 21, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 172.22.4.19:80 failed to respond", 11, "", "", "", "", "", ""], "isController": false}, {"data": ["[GET] Product details", 4228, 46, "Assertion failed", 21, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 172.22.4.19:80 failed to respond", 13, "404/Not Found", 12, "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["[GET] Homepage", 5887, 16, "Assertion failed", 16, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["[GET] Open Product - Search result", 1749, 5, "Assertion failed", 5, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["[POST] Login", 1981, 5, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 172.22.4.19:80 failed to respond", 5, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["[GET] Select Sub-Category", 4231, 32, "Assertion failed", 20, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 172.22.4.19:80 failed to respond", 12, "", "", "", "", "", ""], "isController": false}, {"data": ["[POST] Add product to cart", 1301, 4, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 172.22.4.19:80 failed to respond", 4, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["[GET] Open Login page", 1981, 10, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 172.22.4.19:80 failed to respond", 10, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
