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

    var data = {"OkPercent": 99.88967884285364, "KoPercent": 0.1103211571463594};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.840003972589135, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9841954022988506, 500, 1500, "[GET] Search"], "isController": false}, {"data": [1.0, 500, 1500, "[POST] Update product quantity"], "isController": false}, {"data": [0.9952107279693486, 500, 1500, "[POST] Search product - Autocomplete"], "isController": false}, {"data": [0.7774463007159904, 500, 1500, "[GET] Select Category"], "isController": false}, {"data": [0.9795918367346939, 500, 1500, "[GET] Product details"], "isController": false}, {"data": [1.0, 500, 1500, "JSR223 Sampler - Search terms script"], "isController": false}, {"data": [0.9707520891364902, 500, 1500, "Login Action"], "isController": true}, {"data": [1.0, 500, 1500, "[POST] Ajax cart refresh"], "isController": false}, {"data": [1.0, 500, 1500, "[POST] Ajax update cart"], "isController": false}, {"data": [1.0, 500, 1500, "Update cart"], "isController": true}, {"data": [0.5137457044673539, 500, 1500, "[GET] Homepage"], "isController": false}, {"data": [0.9022988505747126, 500, 1500, "Search by term"], "isController": true}, {"data": [0.9827586206896551, 500, 1500, "[GET] Open Product - Search result"], "isController": false}, {"data": [0.9846796657381616, 500, 1500, "[POST] Login"], "isController": false}, {"data": [1.0, 500, 1500, "[GET] View cart"], "isController": false}, {"data": [0.7954545454545454, 500, 1500, "[GET] Select Sub-Category"], "isController": false}, {"data": [0.9941176470588236, 500, 1500, "[POST] Add product to cart"], "isController": false}, {"data": [0.5979827089337176, 500, 1500, "Transaction Controller - Search"], "isController": true}, {"data": [0.4470588235294118, 500, 1500, "Transaction Controller - Add to cart"], "isController": true}, {"data": [0.9944289693593314, 500, 1500, "[GET] Open Login page"], "isController": false}, {"data": [0.4462738301559792, 500, 1500, "Transaction Controller - Browse"], "isController": true}, {"data": [0.9980392156862745, 500, 1500, "[POST] Ajax Add to cart"], "isController": false}, {"data": [1.0, 500, 1500, "[GET] View  cart"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 8158, 9, 0.1103211571463594, 265.91235596960155, 0, 7344, 164.0, 594.0, 727.0, 1468.8199999999997, 6.797370372530558, 1953.3201164014783, 151.14937818704848], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["[GET] Search", 348, 1, 0.28735632183908044, 129.53160919540235, 62, 2077, 107.5, 158.10000000000002, 188.75000000000006, 1143.02, 0.2936701426072339, 8.233045480686547, 1.1701966353144255], "isController": false}, {"data": ["[POST] Update product quantity", 25, 0, 0.0, 86.67999999999999, 67, 141, 82.0, 115.60000000000001, 134.1, 141.0, 0.022809719495193535, 0.0466262742649796, 0.048720135234264945], "isController": false}, {"data": ["[POST] Search product - Autocomplete", 1044, 0, 0.0, 100.95402298850586, 34, 1012, 86.0, 144.0, 161.75, 542.4499999999955, 0.8803633438291083, 19.73069826163024, 1.3085335030323626], "isController": false}, {"data": ["[GET] Select Category", 838, 3, 0.35799522673031026, 406.7207637231504, 95, 3139, 350.0, 619.1, 715.5499999999995, 1556.7800000000013, 0.7018396070368215, 116.60374544338171, 33.16939038676555], "isController": false}, {"data": ["[GET] Product details", 833, 2, 0.24009603841536614, 226.36134453781528, 94, 1951, 197.0, 260.6, 398.4999999999998, 1182.3599999999985, 0.6993406216995404, 68.65669265643024, 12.144070326916554], "isController": false}, {"data": ["JSR223 Sampler - Search terms script", 1164, 0, 0.0, 0.9544673539518911, 0, 225, 0.0, 1.0, 1.0, 2.0, 0.9719536267898475, 0.0, 0.0], "isController": false}, {"data": ["Login Action", 359, 1, 0.2785515320334262, 383.91643454039007, 302, 2304, 341.0, 425.0, 505.0, 1529.9999999999964, 0.3019031672921977, 8.431726870611786, 2.0449214134597513], "isController": true}, {"data": ["[POST] Ajax cart refresh", 25, 0, 0.0, 71.60000000000001, 56, 118, 66.0, 90.2, 110.19999999999999, 118.0, 0.022810739296060586, 0.2173132798421497, 0.04543435924633318], "isController": false}, {"data": ["[POST] Ajax update cart", 25, 0, 0.0, 59.720000000000006, 51, 77, 59.0, 69.2, 75.19999999999999, 77.0, 0.02281146778108291, 0.01799967379601073, 0.04545808706452908], "isController": false}, {"data": ["Update cart", 25, 0, 0.0, 299.59999999999997, 245, 394, 300.0, 357.4000000000001, 389.5, 394.0, 0.02280501710376283, 0.5667073474914481, 0.18402134407069556], "isController": true}, {"data": ["[GET] Homepage", 1164, 2, 0.1718213058419244, 709.5455326460475, 463, 7344, 586.5, 1019.5, 1461.75, 2050.2999999999984, 0.9713971929625445, 1569.5048857447775, 58.277289779142755], "isController": false}, {"data": ["Search by term", 348, 1, 0.28735632183908044, 432.39655172413796, 230, 2448, 386.0, 561.3000000000001, 808.5000000000003, 1500.1599999999999, 0.2935589125498122, 27.967649187029505, 2.4787527312894153], "isController": true}, {"data": ["[GET] Open Product - Search result", 348, 0, 0.0, 224.14655172413805, 102, 1498, 188.5, 242.10000000000002, 317.8000000000002, 1378.5599999999995, 0.2935990348353567, 31.47451404956804, 3.400941996526167], "isController": false}, {"data": ["[POST] Login", 359, 0, 0.0, 282.74651810584976, 226, 2190, 254.0, 298.0, 339.0, 1300.3999999999992, 0.3019031672921977, 5.229102370770307, 1.4113383416286625], "isController": false}, {"data": ["[GET] View cart", 255, 0, 0.0, 110.96862745098039, 44, 247, 109.0, 140.4, 153.0, 226.19999999999993, 0.21843749518152583, 3.2212353020476585, 0.7066476392260631], "isController": false}, {"data": ["[GET] Select Sub-Category", 836, 0, 0.0, 446.0119617224883, 84, 2016, 486.0, 596.3000000000001, 740.0999999999997, 1486.7399999999996, 0.7009765038713021, 130.84962675071188, 38.729427582932814], "isController": false}, {"data": ["[POST] Add product to cart", 255, 0, 0.0, 86.11372549019606, 39, 1006, 75.0, 97.0, 105.0, 656.3599999999999, 0.21850562716256303, 0.6662312888490152, 0.3787338822644552], "isController": false}, {"data": ["Transaction Controller - Search", 347, 1, 0.2881844380403458, 656.7319884726224, 367, 2735, 571.0, 869.5999999999999, 1362.799999999999, 2278.1999999999903, 0.2928062483334515, 59.327201931202765, 5.864596972925548], "isController": true}, {"data": ["Transaction Controller - Add to cart", 255, 1, 0.39215686274509803, 1049.8980392156866, 432, 2685, 901.0, 1549.2, 1758.3999999999999, 2648.2799999999997, 0.21856293584020736, 68.21544923093703, 17.51656796112708], "isController": true}, {"data": ["[GET] Open Login page", 359, 1, 0.2785515320334262, 101.1699164345404, 1, 1166, 85.0, 127.0, 148.0, 375.7999999999985, 0.3019712244134061, 3.2033464578312745, 0.6337258985536504], "isController": false}, {"data": ["Transaction Controller - Browse", 577, 2, 0.3466204506065858, 1157.6863084922031, 423, 3904, 1146.0, 1572.0, 1900.7000000000003, 2652.8400000000006, 0.48594547978062547, 250.3328587706211, 67.52543594552189], "isController": true}, {"data": ["[POST] Ajax Add to cart", 255, 0, 0.0, 62.69019607843134, 35, 983, 57.0, 67.0, 72.0, 212.67999999999938, 0.21850637610174342, 0.7840087768869954, 0.38035104977318185], "isController": false}, {"data": ["[GET] View  cart", 25, 0, 0.0, 81.6, 69, 111, 77.0, 101.2, 108.6, 111.0, 0.022810551978861004, 0.284906467327534, 0.04445384524317873], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 172.22.4.19:80 failed to respond", 1, 11.11111111111111, 0.012257906349595489], "isController": false}, {"data": ["Assertion failed", 8, 88.88888888888889, 0.09806325079676391], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 8158, 9, "Assertion failed", 8, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 172.22.4.19:80 failed to respond", 1, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["[GET] Search", 348, 1, "Assertion failed", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["[GET] Select Category", 838, 3, "Assertion failed", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["[GET] Product details", 833, 2, "Assertion failed", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["[GET] Homepage", 1164, 2, "Assertion failed", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["[GET] Open Login page", 359, 1, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 172.22.4.19:80 failed to respond", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
