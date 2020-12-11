'use strict';

/* global dataset, d3 */

/* For d3 pie chart tutorial : http://zeroviscosity.com/d3-js-step-by-step*/
/* For d3 bar chart tutorial : https://bl.ocks.org/mbostock/3887051*/

//main color and opacity used for EP Template and global legend
var color = ["#776fb5", "#f08200", "#0087cc", "#B8323F", "#799C00"];
var opacity = ["1", "0.7", "0.4", "0.1"];

//colors for per Hub performance chart
var secondaryColors = ["#FFE780", "#FFCF00", "#C6A100", "#9C7E00", "#786100", "#FFEEA6", "#FFF6CD", "#DCC251"];
var disabledColor = "#e1e6ef";

var opticalVisibilityColors = ["#FF0000", "#0000FF", "#FFA500"];

//reminder for blue used in siradel logo.
var blueSiradel = ["#0D6BB1", "#0777B8", "#3884C3", "#548FCA", "#6195CC", "#78A1D2", "#8EAED8", "#B6C7E4"];

//margin for all graphs
var margin = { top: 15, right: 30, bottom: 30, left: 40 };

//list of legends for the global legend function.
var legends = []; var maxBarWidth = 60;
var nbrLegendPerLine = 4;

//are we displaying surface or buildings?
var displaySurface = true;

// The max numbers of hub tahat can be represented in pie chart
var maxHubs = 8;

// Parameters to display verticaly X axis texts on coverage charts 
var coverageXAxisShift = 30;
var coverageXAxisTextRotationAngle = -90;
var coverageXAxisTextHorizontalTranslationFactor = -12;
var coverageXAxisTextVerticalTranslationFactor = 35;

function isDefined(data) {
    return (typeof data !== 'undefined') && data != null;
}

function isBuildingStatsDefined() {
    return isDefined(dataset.GlNetworkPerModulationDLBuildingStatsData) ||
        isDefined(dataset.GlNetworkPerModulationULBuildingStatsData) ||
        isDefined(dataset.GlNetworkPerReceivedPowerDLBuildingStatsData) ||
        isDefined(dataset.GlNetworkPerReceivedPowerULBuildingStatsData) ||
        isDefined(dataset.GlNetworkPerSINRWithMarginsDLBuildingStatsData) ||
        isDefined(dataset.GlNetworkPerSINRWithMarginsULBuildingStatsData) ||
        isDefined(dataset.PerHubPerformancesBuildingStatsData) ||
        isDefined(dataset.OpticalVisibilityPerformancesBuildingStatsData);
}

function getGlNetworkPerModulationDLData() {
    if (displaySurface) {
        return dataset.GlNetworkPerModulationDLSurfaceData;
    }
    return dataset.GlNetworkPerModulationDLBuildingStatsData;
}

function getGlNetworkPerModulationULData() {
    if (displaySurface) {
        return dataset.GlNetworkPerModulationULSurfaceData;
    }
    return dataset.GlNetworkPerModulationULBuildingStatsData;
}

function getGlNetworkPerReceivedPowerDLData() {
    if (displaySurface) {
        return dataset.GlNetworkPerReceivedPowerDLSurfaceData;
    }
    return dataset.GlNetworkPerReceivedPowerDLBuildingStatsData;
}

function getGlNetworkPerReceivedPowerULData() {
    if (displaySurface) {
        return dataset.GlNetworkPerReceivedPowerULSurfaceData;
    }
    return dataset.GlNetworkPerReceivedPowerULBuildingStatsData;
}

function getGlNetworkPerSINRWithMarginsDLData() {
    if (displaySurface) {
        return dataset.GlNetworkPerSINRWithMarginsDLSurfaceData;
    }
    return dataset.GlNetworkPerSINRWithMarginsDLBuildingStatsData;
}

function getGlNetworkPerSINRWithMarginsULData() {
    if (displaySurface) {
        return dataset.GlNetworkPerSINRWithMarginsULSurfaceData;
    }
    return dataset.GlNetworkPerSINRWithMarginsULBuildingStatsData;
}

function getPerHubPerformancesData() {
    if (displaySurface) {
        return dataset.PerHubPerformancesSurfaceData;
    }
    return dataset.PerHubPerformancesBuildingStatsData;
}

function getOpticalVisibilityPerformancesData() {
    if (displaySurface) {
        return dataset.OpticalVisibilityPerformancesSurfaceData;
    }
    return dataset.OpticalVisibilityPerformancesBuildingStatsData;
}

//function called on windows resize
$(window).resize(function () {

    //on resize you destroy the whole svg chart create before and recreate them to avoid ratio issues on chart
    globalDestroy();
    globalRefresh();
});

//function called when the page has been fully loaded
$(document).ready(function () {

    //load the whole data report
    //WARNING : loading an unvalid json won't pop any error. (thank you javascript)
    //don't forget to check if json is working with a json validator if the report is broken

    if (typeof dataset == 'object') {
        //preparing global legend by creating a map (it's kind of a dictionnary)
        dataset.RemoteClasses.legends.forEach(function (elmt) {
            legends.push(elmt.legendLabels.map(function (d) { return { name: d, id: elmt.legendId, enable: true }; }));
        });

        // }).done(function() {      
        //console.log( "success" );

        //when loading file is done we create legends and chart with d3
        (function (d3) {

            createOrUpdatePredictionSettings();
            createLeftPanel();
            createHubsSettings();
            createRemoteSettings();

            create_GNP_PerfCoverage(
				isDefined(getGlNetworkPerModulationDLData()),
				getGlNetworkPerModulationDLData(),
				'#GlNetworkPerfCoverageDLContainer',
				'#GlNetworkPerfCoverageDLChart',
				'#GlNetworkPerfCoverageDLTable',
				'#GlNetworkPerfCoverageDLTableContainer',
				'#GlNetworkPerfCoverageDLLegend',
				'#GlNetworkPerfCoverageDLMenuButton',
				'#GlNetworkPerfCoverageDLTitle');

            create_GNP_PerfCoverage(
				isDefined(getGlNetworkPerModulationULData()),
				getGlNetworkPerModulationULData(),
				'#GlNetworkPerfCoverageULContainer',
				'#GlNetworkPerfCoverageULChart',
				'#GlNetworkPerfCoverageULTable',
				'#GlNetworkPerfCoverageULTableContainer',
				'#GlNetworkPerfCoverageULLegend',
				'#GlNetworkPerfCoverageULMenuButton',
				'#GlNetworkPerfCoverageULTitle');

            create_GNP_PerfCoverage(
				isDefined(getGlNetworkPerReceivedPowerDLData()),
				getGlNetworkPerReceivedPowerDLData(),
				'#GlNetworkPerfReceivedPowerDLContainer',
				'#GlNetworkPerfReceivedPowerDLChart',
				'#GlNetworkPerfReceivedPowerDLTable',
				'#GlNetworkPerfReceivedPowerDLTableContainer',
				'#GlNetworkPerfReceivedPowerDLLegend',
				'#GlNetworkPerfReceivedPowerDLMenuButton',
				'#GlNetworkPerfReceivedPowerDLTitle');

            create_GNP_PerfCoverage(
				isDefined(getGlNetworkPerReceivedPowerULData()),
				getGlNetworkPerReceivedPowerULData(),
				'#GlNetworkPerfReceivedPowerULContainer',
				'#GlNetworkPerfReceivedPowerULChart',
				'#GlNetworkPerfReceivedPowerULTable',
				'#GlNetworkPerfReceivedPowerULTableContainer',
				'#GlNetworkPerfReceivedPowerULLegend',
				'#GlNetworkPerfReceivedPowerULMenuButton',
				'#GlNetworkPerfReceivedPowerULTitle');

            create_GNP_PerfCoverage(
				isDefined(getGlNetworkPerSINRWithMarginsDLData()),
				getGlNetworkPerSINRWithMarginsDLData(),
				'#GlNetworkPerfSINRWithMarginsDLContainer',
				'#GlNetworkPerfSINRWithMarginsDLChart',
				'#GlNetworkPerfSINRWithMarginsDLTable',
				'#GlNetworkPerfSINRWithMarginsDLTableContainer',
				'#GlNetworkPerfSINRWithMarginsDLLegend',
				'#GlNetworkPerfSINRWithMarginsDLMenuButton',
				'#GlNetworkPerfSINRWithMarginsDLTitle');

            create_GNP_PerfCoverage(
				isDefined(getGlNetworkPerSINRWithMarginsULData()),
				getGlNetworkPerSINRWithMarginsULData(),
				'#GlNetworkPerfSINRWithMarginsULContainer',
				'#GlNetworkPerfSINRWithMarginsULChart',
				'#GlNetworkPerfSINRWithMarginsULTable',
				'#GlNetworkPerfSINRWithMarginsULTableContainer',
				'#GlNetworkPerfSINRWithMarginsULLegend',
				'#GlNetworkPerfSINRWithMarginsULMenuButton',
				'#GlNetworkPerfSINRWithMarginsULTitle');

            create_PGP(
				getPerHubPerformancesData(),
				'#PerHubPerformanceTableContainer',
				isDefined(getPerHubPerformancesData()),
				'#PerHubPerformanceContent',
				'#PerHubPerformanceChart',
				'#PerHubPerformanceLegend',
				'#PerHubPerformanceTable',
				'#PerHubPerformanceMenuButton',
				'#PerHubPerformanceTitle',
				secondaryColors,
				true);

            create_PGP(
				getOpticalVisibilityPerformancesData(),
				'#OpticalVisibilityPerformanceTableContainer',
				isDefined(getOpticalVisibilityPerformancesData()),
				'#OpticalVisibilityPerformanceContent',
				'#OpticalVisibilityPerformanceChart',
				'#OpticalVisibilityPerformanceLegend',
				'#OpticalVisibilityPerformanceTable',
				'#OpticalVisibilityPerformanceMenuButton',
				'#OpticalVisibilityPerformanceTitle',
				opticalVisibilityColors,
				false);

            createSwitchSurfaceBuildingsButton();

            createCopyrightData();

        })(window.d3);
    }
    else {
        //console.log( "error" );
    }
});
function createCopyrightData() {
    var today = new Date();
    d3.select('#copyright').html("&copy; " + today.getFullYear() + " Siradel. All rights reserved.");
}

function sortByAlphabeticWay(a, b) {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
}


//fill left panel with prediction settings
function createOrUpdatePredictionSettings() {

    d3.select('#ReportName').text(dataset.ReportInformationsData.name);

    d3.select('#ReportDate').text(dataset.ReportInformationsData.date);

    d3.select('#ReportComputationTime').text(dataset.ReportInformationsData.computationTime);

    // d3.select('#ReportAuthor').text(dataset.ReportInformationsData.author);

    var ReportS_backhaulVersion = d3.select('#ReportS_backhaulVersion');
    ReportS_backhaulVersion.text("S_Backhaul " + dataset.ReportInformationsData.s_backhaulVersion);

    d3.select('#TotalSurface').text(dataset.PredictionSettingsCoverageData.totalSurface);

    if (!displaySurface && isDefined(dataset.PredictionSettingsCoverageData.numberOfHomes))
    {
        $('#PredictionContent .settingTitle, #PredictionContent .settingValue').parent().attr('class', 'col-md-2');
        $('.NumberOfHomes').parent().removeClass('disabled');
        d3.select('#NumberOfHomes').text(dataset.PredictionSettingsCoverageData.numberOfHomes);
    }
    else
    {
        $('#PredictionContent .settingTitle, #PredictionContent .settingValue').parent().attr('class', 'col-md-3');
        $('.NumberOfHomes').parent().addClass('disabled');
    }

    d3.select('#PredictionStep').text(dataset.PredictionSettingsCoverageData.predictionStep);

    d3.select('#HeightReference').text(dataset.PredictionSettingsCoverageData.heightReference);

    d3.select('#Standard').text(dataset.PredictionSettingsCoverageData.technology);


    //create donut charts of active Hubs and active end point
    createChartSettings();
}

//create the left panel information
function createLeftPanel() {
    if (dataset.PredictionSettingsCoverageData != undefined) {
        d3.select('#LActiveHubs').text(dataset.PredictionSettingsCoverageData.activeHubs);
        d3.select('#LTechnology').text(dataset.PredictionSettingsCoverageData.technology);
        d3.select('#LStudyArea').text(dataset.PredictionSettingsCoverageData.studyArea);
        d3.select('#LHeightReference').text(dataset.PredictionSettingsCoverageData.heightReference);
    }
}

//create charts on the left panel to represent active Hubs and active end points
function createChartSettings() {
    var ActiveHubs;
    var ActiveEP;

    //create color palette for the charts
    var settingsColor = d3.scaleOrdinal().range(["#0D6BB1", "#E1E6EF"]);

    //get chart container width to apply
    //charts won't be bigger than 200px to avoid big pie chart
    var settingsChartWidth = 160;
    var settingsChartHeight = 160;

    settingsChartWidth = settingsChartHeight;

    var totalHubValue;
    var activeHubValue;
    var totalEPValue;
    var activeEPValue;
    var activeEPLabel;
}

//create table for gatway settings in the input category
function createHubsSettings() {
    var HubsSettingsTable = d3.select('#HubsSettingsTable');
    var HubsSettingsTitleDiv = d3.select('#HubsSettingsTitle');

    //create table representation of the chart
    if (dataset.HubsSettingsData != undefined) {
        d3.select('#NoHub').attr("class", "disabled");
    }
    else {
        HubsSettingsTable.attr("class", "disabled");
        return;
    }

    // set table title
    HubsSettingsTitleDiv.text(dataset.HubsSettingsData.chartTitle);

    createTable(HubsSettingsTable, dataset.HubsSettingsData.tableHeader, dataset.HubsSettingsData.rows);

}

//create table for end point settings in the input category
function createRemoteSettings() {
    var RemoteSettingsTable = d3.select('#RemoteSettingsTable');
    var RemoteSettingsTitleDiv = d3.select('#RemoteSettingsTitle');

    //create table representation of the chart
    createTable(RemoteSettingsTable, dataset.RemoteSettingsData.tableHeader, dataset.RemoteSettingsData.rows);


    //set table title
    RemoteSettingsTitleDiv.text(dataset.RemoteSettingsData.chartTitle);
}

/*Global Network Performances - Macro diversity*/
//legend ID used is 0 as its described in the data.json file
function create_GNP_PerfCoverage(p_visible, p_datasetRoot, p_container, p_chart, p_table, p_tableContainer, p_legend, p_menu_button, p_title) {
    if (!p_visible) {
        d3.select(p_container).attr("class", "disabled");
        return;
    }

    d3.select(p_container).attr("class", "");

    //are we refreshing the current graph
    var refresh = false;

    //chart dimensions to create the svg space (canvas to draw chart)
    var chartWidth = $(p_container).width();
    var chartHeight = 327 + margin.top + margin.bottom;

    // x1DataAxis used in bar, this is the header for each column of the table
    var x1DataAxis = [];

    //contains svg to contains chart and legend of the chart
    var GlNetworkPerfChartSvg;

    //contains html for table of the chart
    var GlNetworkPerfTable;

    //contains the div chart title
    var GlNetworkPerfTitleDiv;

    //count how many group of data that you have
    //here it's the number of End point template
    var dataCount;

    dataCount = legends[p_datasetRoot.legendEntries[0]].length;

    //count how many data you have in each group
    //here there's only one data per group
    var subDataCount = 1;

    //create x1DataAxis used in bar, tooltip and legend parts
    //here it contains every end point template
    //we create objet for each end point template with its name and the enable property to be linked to the global legend
    legends[p_datasetRoot.legendEntries[0]].forEach(function (elmt) {
        x1DataAxis.push({ name: elmt.name, enable: elmt.enable });
    });

    //test if it's a refresh action or a rebuild all action
    var selectString = p_chart + '>*';
    if (d3.selectAll(selectString).empty()) {
        refresh = false;

		var height = chartHeight+coverageXAxisShift;
        //create svg for chart inside GlNetworkPerfChart div
        GlNetworkPerfChartSvg = d3.select(p_chart)
          .append('svg')
          .attr('viewBox', '0 0 ' + chartWidth + ' ' + height)
          .style('height', height+"px")
          .append('g')
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        //add menu of chart bar interaction to toggle between table and chart view
        var menuButton = d3.select(p_menu_button)
        .on('click', function () { toggleIntoTable(p_chart, p_tableContainer, p_legend, null); });

        GlNetworkPerfTable = d3.select(p_table);
        GlNetworkPerfTitleDiv = d3.select(p_title);

        //create table representation of the chart
        createTable(GlNetworkPerfTable, p_datasetRoot.tableHeader, p_datasetRoot.rows);

        //fill the chart title
        GlNetworkPerfTitleDiv.text(p_datasetRoot.chartTitle);
    }
    else {
        refresh = true;
        //if it's a refresh action, get the svg elements to modify
        selectString = p_chart + '>svg';
        GlNetworkPerfChartSvg = d3.select(selectString);
    }

    //if you are creating the page, use generic method to create bar chart with two entries table data
    //else refresh the chart
    if (!refresh) {
        createBarChart(GlNetworkPerfChartSvg, p_datasetRoot, x1DataAxis, p_datasetRoot.tableHeader, p_chart, chartWidth - margin.left - margin.right, chartHeight - margin.top - margin.bottom, color, opacity, dataCount, subDataCount, coverageXAxisTextRotationAngle, coverageXAxisTextHorizontalTranslationFactor, coverageXAxisTextVerticalTranslationFactor);
    }
    else {
        refreshBarChart(GlNetworkPerfChartSvg, p_datasetRoot, x1DataAxis, chartWidth - margin.left - margin.right);
    }
}

function create_PGP(p_data, p_container, p_is_visible, p_content, p_chart, p_legend, p_table, p_menu_button, p_title, p_colors, p_sort) {
    if (!p_is_visible) {
        d3.select(p_content).attr("class", "disabled");
        return;
    }

    //are we refreshing the current graph
    var refresh = false;

    //chart dimensions to create the svg space (canvas to draw chart)
    var chartWidth = $(p_content).width() / 2;
    var chartHeight = 200 + margin.top + margin.bottom;

    //sizes for one item of the legend
    var legendRectSize = 16;
    var legendSpacing = 10;

    //to have a readable legend, we considers that we have only 3 items on one row
    var legendStepOffset;

    //legend dimensions to create the svg space (canvas to draw chart)
    var legendHeight;

    //legendData of the graph. Here it's MSG, GEO and MSG&GEO. Remotes are contains in the common legend
    var legendData = legends[p_data.legendId];

    //contains svg to contains chart and legend of the chart
    var PerHubPerformanceChartSvg;
    var PerHubPerformanceLegendSvg;

    //contains html for table of the chart
    var PerHubPerformanceTable;

    //contains the div chart title
    var PerHubPerformanceTitleDiv;

    //on PGP chart we put 5 values
    // 4 best server Hubs and the uncovered area %
    //if uncovered data is null, we put 5 best server Hubs

    //uncovered data is always the last one on the data table
    //if it's active, its value is not zero
    //it's always represented as a grey slice

    //represents the scale of color to use on the graph
    var PGPColor;

    //represents the datas to use.
    //tmpDataset is the complete dataset with all best servers
    //PerHubPerformancesData contains the 5 values to show
    var PerHubPerformancesDataset = [];
    var tmpDataset = [];

    //we create tmpDataset with every datas in th PerHubPerformancesData rows in an object way.
    //label is the name of the data, enable is to be able to activate or desactivate a slice, dataValues is the value of the data

    p_data.rows.forEach(function (d) {
        tmpDataset.push({ label: d.label, enable: true, dataValues: parseFloat(d.dataValues[0]) });
    });

    //get the last value of the dataset which is the uncoveredData
    //if it's null we have to do some adjustement to the graph
    var uncoveredData = tmpDataset[tmpDataset.length - 1];
    var uncoveredDataIsVisible = parseFloat(uncoveredData.dataValues) != 0;

    //the sum of the char pie should be 100%
    //as we represented only maxHubs values, we need to set a slice with the rest of the data taht are not visible on the pie
    var nonRepresentedDataIsVisible = (uncoveredData == 0 && tmpDataset.length > (maxHubs + 1)) || (uncoveredData != 0 && tmpDataset.length > maxHubs);
    var nonRepresentedData;

    //we choose to show onfly maxHubs data maximum on the graph.
    //if there's less than tmpDataset we need to know when to stop
    var loopIndexEnded = Math.min(maxHubs - 1, tmpDataset.length - 1);

    //if uncovered data is null the loopIndex has to stop at maxHubs
    if (!uncoveredDataIsVisible && tmpDataset.length > (maxHubs - 1)) {
        loopIndexEnded++;
    }

    //remove uncovered data before sorting value to avoid bugs
    tmpDataset.splice(tmpDataset.length - 1, 1);

    //sort data by value to get the maxHubs-1 or maxHubs biggest value
    if (p_sort) {
        tmpDataset.sort(function (x, y) {
            return d3.descending(parseFloat(x.dataValues), parseFloat(y.dataValues));
        });
    }

    //if uncovered data is null loopIndexEnded is equal to maxHubs
    //we will create the table of data visible on the chart
    for (var i = 0; i < loopIndexEnded && i < tmpDataset.length; i++) {
        PerHubPerformancesDataset.push(tmpDataset[i]);
    }

    //add uncovered data if needed
    if (uncoveredDataIsVisible)
        PerHubPerformancesDataset.push(uncoveredData);

    //calculate the non represented data and add it if necessary
    if (nonRepresentedDataIsVisible) {
        nonRepresentedData = 100 - d3.sum(PerHubPerformancesDataset, function (d) {
            return parseFloat(d.dataValues);
        });

        if (nonRepresentedData > 0)
            PerHubPerformancesDataset.push({ label: "Other Hubs", enable: true, dataValues: nonRepresentedData });
        else
            nonRepresentedDataIsVisible = false;
    }

    //if there is uncovered data, we add the first colors and finish the table by the grey color 
    var tmpColor = [];
    for (var i = 0; i < loopIndexEnded && i < tmpDataset.length; i++) {
        tmpColor.push(p_colors[i]);
    }

    if (uncoveredDataIsVisible)
        tmpColor.push(disabledColor);

    if (nonRepresentedDataIsVisible) {
        tmpColor.push("#8f9aae");
    }

    PGPColor = d3.scaleOrdinal().range(tmpColor);

    //calculate the legend offset to show a readable legend
    legendStepOffset = Math.ceil(p_data.rows.length / 3);

    //calculate the height of the legend, depending on the number of elements
    legendHeight = (legendRectSize + 4) * legendStepOffset + margin.top + margin.bottom;

    //test if it's a refresh action or a rebuild all action
    var selectString = p_chart + '>*';
    if (d3.selectAll(selectString).empty()) {
        refresh = false;
        //create svg for chart inside PerHubPerformanceChart div
        PerHubPerformanceChartSvg = d3.select(p_chart)
          .append('svg')
          .attr('viewBox', '0 0 ' + chartWidth + ' ' + chartHeight)
          .append('g')
          .attr("transform", "translate(" + chartWidth / 2 + "," + chartHeight / 2 + ")");

        //create svg for legend inside GlNetworkPerfLegend div
        PerHubPerformanceLegendSvg = d3.select(p_legend)
          .append('svg')
          .attr('viewBox', '0 0 ' + chartWidth + ' ' + chartHeight)
          .append('g')
          .attr("transform", "translate(" + margin.left + "," + chartHeight / 2 + ")");

        //add menu of chart bar interaction to toggle between table and chart view
        var menuButton = d3.select(p_menu_button)
        .on('click', function () { toggleIntoTable(p_chart, p_container, p_legend, null); });

        PerHubPerformanceTable = d3.select(p_table);
        PerHubPerformanceTitleDiv = d3.select(p_title);

        createTable(PerHubPerformanceTable, p_data.tableHeader, p_data.rows);

        //fill the chart title
        PerHubPerformanceTitleDiv.text(p_data.chartTitle);
    }
    else {
        refresh = true;
        var selectString = p_chart + '>svg';
        PerHubPerformanceChartSvg = d3.select(selectString);
        var selectString = p_legend + '>svg';
        PerHubPerformanceLegendSvg = d3.select(selectString);
    }

    //if you are creating the page, use generic method to create pie chart
    if (!refresh) {
        createPieChart(PerHubPerformanceChartSvg, PerHubPerformanceLegendSvg, PerHubPerformancesDataset, p_chart, chartWidth, chartHeight - margin.bottom, PGPColor, legendRectSize, legendSpacing, 0);
    }
}

function createSwitchSurfaceBuildingsButton() {
    //if MP2MP, hide the switch button OR if there's surface and population data on one element, the following elements are concerned
    if (!isBuildingStatsDefined()) {
        d3.select("#switchSurfacePop").attr("class", "disabled");
        return;
    }

    //link button to the corresponding function
    d3.select("#surfaceBtn").on('click', function () { updateReportTo(true); });
    d3.select("#buildingStatsBtn").on('click', function () { updateReportTo(false); });

}

function updateReportTo(p_displaySurface) {
    displaySurface = p_displaySurface;

    //set button classes to show the selected option

    if (displaySurface) {
        d3.select("#surfaceBtn").attr("class", "btn-switch btn selected");
        d3.select("#buildingStatsBtn").attr("class", "btn-switch btn");
    }
    else {
        d3.select("#surfaceBtn").attr("class", "btn-switch btn");
        d3.select("#buildingStatsBtn").attr("class", "btn-switch btn selected");
    }
    //remove concerned element

    //d3.selectAll(".popSurface>*").remove();
    globalDestroy();
    globalRefresh();
}


/*
*
*   GENERIC METHODS TO GENERATE TYPICAL CHARTS
*
*/

//create bar chart with double entries
function createBarChart(p_svg, p_dataset, p_x1DataAxis, p_tableHeader, p_elmtId, p_width, p_height, p_color, p_opacity, p_dataCount, p_subDataCount, rotationAngle, horizontalTranslationFactor, verticalTranslationFactor) {
    //tooltip element to add to see the bar value
    var tooltip = d3.select(p_elmtId)
   .append('div')
   .attr('class', 'chartTooltip disabled');

    tooltip.append('div')
    .attr('class', 'chartCount');


    //create an operator to scale the x0 data
    var x0 = d3.scaleBand()
    .rangeRound([0, p_width])
    .round(.1);

    //create an operator to scale the y data
    var y = d3.scaleLinear()
        .range([p_height, 0]);

    //create x axis scale
    var xAxis = d3.axisBottom()
    .scale(x0);

    //create y axis scale 
    var yAxis = d3.axisLeft()
    .scale(y)
    .tickFormat(d3.format(".1s"));

    //get bar min with. Maximum bar width is defined earlier to avoid big bar chart
    //we consider that between each bar there's space to read easily
    var barGroupWidth = Math.floor(p_width / p_dataset.rows.length);
    var tmpbarWidth = Math.floor(p_width / (p_dataset.rows.length * p_x1DataAxis.length + p_dataset.rows.length));
    var barWidth = Math.min(tmpbarWidth, maxBarWidth);

    //offset between bars with the space desired
    var barOffset = (barGroupWidth - (barWidth * p_x1DataAxis.length)) / 2;

    //generate domain of value for x and y datas
    x0.domain(p_dataset.rows.map(function (d) { return d.label; }));
    y.domain([0, 100]);

    //create x axis and display all text vertically
    p_svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + p_height + ")")
    .call(xAxis)
	.selectAll("text")
    .attr("transform", "translate(" + horizontalTranslationFactor + "," + verticalTranslationFactor + ") rotate(" + rotationAngle + ")");
	
	//add the unit at the end of the x axis
	p_svg.select(".x")
	.filter(".axis")
	.append("text")
    .attr("transform", "translate(" + p_width + ",25)")
    .attr("x", 6)
    .attr("dx", ".71em")
    .style("text-anchor", "end")
    .text(p_dataset.unit);

    //create y axis
    p_svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "translate(5,-20)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("%");

    //create every bar group of the graph
    // for example for the global UL coverage per modulation
    // a bar group is a modulation
    var state = p_svg.selectAll(".barGroup")
    .data(p_dataset.rows)
    .enter().append("g")
    .attr("class", "barGroup")
    .attr("transform", function (d) { return "translate(" + x0(d.label) + ",0)"; });

    //create background to the groups to help reading
    state.append("rect")
    .attr("width", p_width / p_dataset.rows.length)
    .attr("height", p_height)
    .style("fill", function (d, i) { if (i % 2 == 0) return "#f4f4f8"; else return "#F9FAFC"; });

    //colorId for the current bar in a group
    var colorId = -1;

    //create every bar for each bar group
    var bar = state.selectAll("bar")
    .data(function (d) { return d.dataValues; })
    .enter().append("rect")
    .attr("width", barWidth - 2)
    .attr("class", function (d, i) { if (p_x1DataAxis[i].enable == false) return "bar disabled"; else return "bar"; })
    .attr("x", function (d, i) { return i * barWidth + barOffset + 1 })
    .attr("y", function (d) { return y(parseFloat(d)); })
    .attr("height", function (d) { if (d == 0) return 1; else return p_height - y(parseFloat(d)); })
    .style("fill", function (d, i) {
        // for example for the global UL coverage per modulation 
        // pick color of the good EP
        // pick the opacity of the good MGS/GEO or MSG&GEO
        // reset the colorId when you've done one modulation (SF7 for example) on p_subDataCount==colorId
        if (i % p_subDataCount == 0)
            colorId++;
        if (colorId >= p_dataCount)
            colorId = 0;

        return p_color[colorId];
    })
    .style("opacity", function (d, i) { return p_opacity[i % p_subDataCount] });


    //on mouseover on a bar of the chart you get the element value and it's legend that you get in tableheader.
    //the first element of tableheader is the name of the very first column, which is not reprenseted in bar
    //so we need to show i+1 element on the tooltip        
    bar.on('mouseover', function (d, i) {
        if (p_x1DataAxis[i].enable == false) return;
        tooltip.select('.chartCount').text(d + '%');
        tooltip.attr('class', 'chartTooltip');
    });

    //remove tooltip when you're not upon a bar
    bar.on('mouseout', function () {
        tooltip.attr('class', 'chartTooltip disabled');
    });

    //position tooltip when you move hover the chart

    //Special thanks to IE, absolute position is weird on it
    // Internet Explorer 6-11
    var isIE = /*@cc_on!@*/false || !!document.documentMode;

    bar.on('mousemove', function (d) {
        if (isIE) {
            tooltip.style('top', (d3.event.y + 10) + 'px');
        }
        else {
            tooltip.style('top', (d3.event.layerY + 10) + 'px');
        }

        tooltip.style('left', (d3.event.layerX + 10) + 'px');
    });
}

//create a bar chart legend
function createBarChartLegend(p_svg, p_legend_svg, p_width, p_legendData, p_color, p_opacity, p_legendRectSize, p_legendStep, p_nbLegendOnRow) {

    //var used to create the needed offset between each element of the legend
    var legendXOffset;

    //has the global legend is centered, we calculate the necessary margin to center everything
    var centerLegendMargin = (p_width - p_nbLegendOnRow * 180) / 2;

    //TODO : try to fix this, here it's only used for the global coverage per modulation chart
    //try to do it in a better way for generic method
    var colorId = 0;

    //create every legend that you need
    var legend = p_legend_svg.selectAll(".legend")
    .data(p_legendData)
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", function (d, i) { if (i % p_legendStep == 0) legendXOffset = centerLegendMargin + i * 180; return "translate(" + legendXOffset + "," + (i % p_legendStep) * 20 + ")"; });

    //create rectangle to color to represent the color of the legend
    legend.append("rect")
    .attr("class", function (d) { if (!d.enable) return "disabled"; else return ""; })
    .attr("x", 0)
    .attr("width", p_legendRectSize)
    .attr("height", p_legendRectSize)
    .style("fill", p_color[colorId])
    .style("opacity", function (d) { return p_opacity[p_legendData.indexOf(d)] })
    .style('stroke', p_color[colorId])
    .on('click', function (label, i) {
        var rect = d3.select(this);
        var enabled = true;
        var totalEnabled = d3.sum(p_legendData.map(function (d) {
            return (d.enable) ? 1 : 0;
        }));

        if (rect.attr('class') === 'disabledRect') {
            rect.attr('class', '');
        } else {
            if (totalEnabled < 2) return;
            rect.attr('class', 'disabledRect');
            enabled = false;
        }

        if (label.enable) label.enable = false;
        else label.enable = true;

        globalRefresh();

    });

    //TODO : end of dirty things

    //add the text for each legend
    legend.append("text")
    .attr("x", p_legendRectSize * 2)
    .attr("y", p_legendRectSize / 2)
    .attr("dy", ".35em")
    .style("text-anchor", "start")
    .text(function (d) { return d.name; });
}

//refresh bar chart by update the width and the visibility for each bar 
function refreshBarChart(p_svg, p_dataset, p_x1DataAxis, p_width) {
    var totalEnabled = d3.sum(p_x1DataAxis.map(function (d) {
        return (d.enable) ? 1 : 0;
    }));

    //get bar min with. Maximum bar width is defined earlier to avoid big bar chart
    var barGroupWidth = Math.floor(p_width / p_dataset.rows.length);
    var tmpbarWidth = Math.floor(p_width / (p_dataset.rows.length * totalEnabled + p_dataset.rows.length));
    var barWidth = Math.min(tmpbarWidth, maxBarWidth);

    //offset between bars with the space desired
    var barOffset = (barGroupWidth - (barWidth * totalEnabled)) / 2;

    var barOffsetIdx = -1;

    var tooltip = p_svg.select(function () { return this.parentNode; }).selectAll(".chartTooltip");

    //IMPORTANT : when a bar is disabled you have to set it's with to 0 to avoid tooltip to get the element on mouse over.
    //note : onclick or mouseover action are considering the last element in the hierarchy at this position
    var newBars = p_svg.selectAll(".barGroup")
    .selectAll(".bar")
    .attr("width", function (d, i) { if (p_x1DataAxis[i].enable == false) return 0; else return barWidth - 2; })
    .attr("class", function (d, i) { if (p_x1DataAxis[i].enable == false) return "bar disabled"; else return "bar"; })
    .attr("x", function (d, i) {
        if (p_x1DataAxis[i].enable) {
            barOffsetIdx++;
            return barWidth * (barOffsetIdx % totalEnabled) + barOffset;
        }
        else return 0;
    });
}

//refresh bar chart legend by update fill of the rectangle for each element of the legend
function refreshBarChartLegend(p_legend_svg, p_chartWidth, p_legendData, p_legendStepOffset) {
    var mapLegendData = d3.map(p_legendData, function (d) { return d.name });

    var newBars = p_legend_svg.selectAll(".legend")
    .selectAll("rect")
    .attr("class", function (d) { var i = p_legendData.indexOf(mapLegendData.get(d.name)); if (!p_legendData[i].enable) return "disabledRect"; else return ""; })

}

//create a generic pie chart with it's legend
function createPieChart(p_svg, p_legendSvg, p_dataset, p_elmtId, p_width, p_height, p_color, p_legendRectSize, p_legendSpacing, p_DonutRadius) {

    //calculate the radius of the circle by fouding the minimum size
    var radius = Math.min(p_width, p_height) / 2;

    //method to create pie chart implemented directly in d3
    var pie = d3.pie()
      .value(function (d) { return d.dataValues; })
      .sort(null);

    //create the inner and outer circle
    var arc = d3.arc()
        .innerRadius(p_DonutRadius)
        .outerRadius(radius);

    //add a tooltip to show the value on the tooltip of the current element
    var tooltip;
    if (p_elmtId != null) {
        tooltip = d3.select(p_elmtId)
        .append('div')
        .attr('class', 'chartTooltip disabled');

        tooltip.append('div')
        .attr('class', 'chartLabel');

        tooltip.append('div')
        .attr('class', 'chartCount');

        tooltip.append('div')
        .attr('class', 'chartPercent');
    }

    //create each slice of the pie
    var path = p_svg.selectAll('path')
      .data(pie(p_dataset))
      .enter()
      .append('path')
      .attr('d', arc)
      .style('fill', function (d) {
          return p_color(d.data.label);
      }).each(function (d) { this._current = d; });

    //fill the tooltip with the label and value of the current data
    if (tooltip != null) {
        path.on('mouseover', function (d) {
            tooltip.select('.chartLabel').text(d.data.label);
            tooltip.select('.chartPercent').text(d.data.dataValues.toFixed(2) + '%');
            tooltip.attr('class', 'chartTooltip');
        });

        path.on('mouseout', function () {
            tooltip.attr('class', 'chartTooltip disabled');
        });

        //Special thanks to IE, absolute position is weird on it
        // Internet Explorer 6-11
        var isIE = /*@cc_on!@*/false || !!document.documentMode;
        path.on('mousemove', function (d) {

            if (isIE) {
                var topValue = Math.min(d3.event.y + 10, p_height / 2 - 30);
                tooltip.style('top', topValue + 'px');
            }
            else {
                tooltip.style('top', (d3.event.layerY + 10) + 'px');
            }

            tooltip.style('left', (d3.event.layerX + 10) + 'px');
        });
    }

    //add legend for each element of the pie
    if (p_legendSvg != null || p_legendSvg != undefined) {
        var legend = p_legendSvg.selectAll('.legend')
      .data(p_color.domain())
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', function (d, i) {
          var height = p_legendRectSize + p_legendSpacing;
          var offset = height * p_dataset.length / 2;
          var horz = -2 * p_legendRectSize;
          var vert = i * height - offset;
          return 'translate(' + horz + ',' + vert + ')';
      });

        //create colored rectangle and add the behaviour when you enable/disable one of them
        legend.append('rect')
      .attr('width', p_legendRectSize)
      .attr('height', p_legendRectSize)
      .style('fill', p_color)
      .style('stroke', p_color)
      .on('click', function (label) {
          var rect = d3.select(this);
          var enabled = true;
          var totalEnabled = d3.sum(p_dataset.map(function (d) {
              return (d.enable) ? 1 : 0;
          }));

          if (rect.attr('class') === 'disabledRect') {
              rect.attr('class', '');
          } else {
              if (totalEnabled < 2) return;
              rect.attr('class', 'disabledRect');
              enabled = false;
          }

          pie.value(function (d) {
              if (d.label === label) d.enable = enabled;
              return (d.enable) ? d.dataValues : 0;
          });

          //redraw pie with the available elements
          path = path.data(pie(p_dataset));

          //do an arc transition to add or remove a slice of the pie chart
          path.transition()
          .duration(750)
          .attrTween('d', function (d) {
              var interpolate = d3.interpolate(this._current, d);
              this._current = interpolate(0);
              return function (t) {
                  return arc(interpolate(t));
              };
          });
      });

        //add the text of each legend
        legend.append('text')
      .attr('x', p_legendRectSize + p_legendSpacing)
      .attr('y', p_legendRectSize / 2 + p_legendSpacing / 2)
      .text(function (d) { return d; });
    }
}

//create a simple gauge bar (similar to a chart bar without axis)
function createGaugeBar(p_svg, p_dataset, p_x1DataAxis, p_tableHeader, p_elmtId, p_width, p_height, p_color) {
    //create an operator to scale the x0 data
    var x0 = d3.scaleBand()
    .rangeRound([0, p_width])
    .round(.1);

    //create an operator to scale the y data
    var y = d3.scaleLinear()
        .range([p_height, 0]);

    //create x axis scale
    var xAxis = d3.axisBottom()
    .scale(x0);

    //create y axis scale 
    var yAxis = d3.axisLeft()
    .scale(y)
    .tickFormat(d3.format(".1s"));

    //create table with data to use it for graph
    //on gauge bar there's only one row with data
    var x0AxisData = p_dataset.rows[0].dataValues;

    //get bar width in % value to have a flexible bar
    var barWidthMargin = Math.floor(p_width / (x0AxisData.length));
    var barWidth = Math.min(p_width / (x0AxisData.length + 0.5 * (x0AxisData.length - 1)), maxBarWidth);

    x0.domain(legends[p_dataset.legendId].map(function (d) { return d.name; }));
    y.domain([0, 100]);

    //first create grey background to show the filling value
    var gaugeBakcground = p_svg.selectAll(".gaugeBackground")
    .data(legends[p_dataset.legendId])
    .enter().append("g")
    .attr("class", "gaugeBackground");

    gaugeBakcground.append("rect")
    .attr("width", barWidth)
    .attr("class", function (d) { if (d.enable == false) return "disabled"; else return ""; })
    .attr("x", function (d, i) { return barWidthMargin * i + 0.5 * (barWidthMargin - barWidth); })
    .attr("y", 0)
    .attr("height", function (d, i) { return p_height; })
    .style("fill", "#F0F3F7")
    .style('stroke', function (d) { return "#B6C7E4"; })

    //then create rect for the real value of the element
    var state = p_svg.selectAll(".barGroup")
    .data(legends[p_dataset.legendId])
    .enter().append("g")
    .attr("class", "barGroup");

    state.append("rect")
    .attr("width", barWidth)
    .attr("class", function (d) { if (d.enable == false) return "disabled"; else return ""; })
    .attr("x", function (d, i) { return barWidthMargin * i + 0.5 * (barWidthMargin - barWidth); })
    .attr("y", function (d, i) { return y(parseFloat(x0AxisData[i])); })
    .attr("height", function (d, i) { return p_height - y(parseFloat(x0AxisData[i])); })
    .style("fill", function (d, i) { return p_color[i]; });

    //add the value in percent upon the bar
    state.append("text")
   .attr("class", "gaugeValue")
   .attr("x", function (d, i) { return barWidthMargin * i + 0.5 * (barWidthMargin - barWidth) + barWidth / 2; })
   .attr("y", function (d, i) { return y(parseFloat(x0AxisData[i])) - 10; })
   .attr("dy", ".35em")
   .style("text-anchor", "middle")
   .style("font-weight", "bold")
   .style("font-size", "14px")
   .text(function (d, i) { return x0AxisData[i] + " %"; });
}

//refresh gauge chart if needed by modifying the width of elements
function refreshGaugeChart(p_svg, p_dataset, p_width) {
    var totalEnabled = d3.sum(legends[p_dataset.legendId].map(function (d) {
        return (d.enable) ? 1 : 0;
    }));


    var barWidthMargin = Math.floor(p_width / (legends[p_dataset.legendId].length));
    var barWidth = Math.min(p_width / (legends[p_dataset.legendId].length + 0.5 * (legends[p_dataset.legendId].length - 1)), maxBarWidth);

    var barOffset = -1;


    //IMPORTANT : when a bar is disabled you have to set it's with to 0.
    //note : onclick or mouseover action are considering the last element in the hierarchy at this position

    //first layer to re-draw : grey background of the gauge
    p_svg.selectAll(".gaugeBackground")
    .selectAll("rect")
    .attr("width", function (d) { if (d.enable == false) return 0; else return barWidth; })
    .attr("class", function (d) { if (d.enable == false) return "disabled"; else return ""; })
    .attr("x", function (d, i) {
        if (d.enable) {
            barOffset++;
            return barWidthMargin * barOffset + 0.5 * (barWidthMargin - barWidth);
        }
        else return 0;
    });

    //reset barOffset each time to draw the different layer.
    barOffset = -1;

    //second layer to re-draw : element enabled
    p_svg.selectAll(".barGroup")
    .selectAll("rect")
    .attr("width", function (d) { if (d.enable == false) return 0; else return barWidth; })
    .attr("class", function (d) { if (d.enable == false) return "disabled"; else return ""; })
    .attr("x", function (d, i) {
        if (d.enable) {
            barOffset++;
            return barWidthMargin * barOffset + 0.5 * (barWidthMargin - barWidth);
        }
        else return 0;
    });

    barOffset = -1;

    //third layer to re-draw : text at the bottom of the bar
    p_svg.selectAll(".gaugeTitle")
   .attr("class", function (d) { if (d.enable == false) return "gaugeTitle disabled"; else return "gaugeTitle"; })
   .attr("x", function (d, i) {
       if (d.enable) {
           barOffset++;
           return barWidthMargin * barOffset + 0.5 * (barWidthMargin - barWidth) + barWidth / 2;
       }
       else return 0.5 * barWidth;
   });

    barOffset = -1;
    p_svg.selectAll(".gaugeValue")
   .attr("class", function (d) { if (d.enable == false) return "gaugeValue disabled"; else return "gaugeValue"; })
   .attr("x", function (d, i) {
       if (d.enable) {
           barOffset++;
           return barWidthMargin * barOffset + 0.5 * (barWidthMargin - barWidth) + barWidth / 2;
       }
       else return 0.5 * barWidth;
   });
}

function createTable(p_tableRoot, p_tableHeader, p_dataset) {
    //remove thead if it exists
    p_tableRoot.select("thead").remove();

    //create headers of each colum
    var header = p_tableRoot.append("thead").append("tr");

    header.selectAll("th")
    .data(p_tableHeader)
    .enter().append("th")
    .text(function (d) { return d; })

    updateTable(p_tableRoot, p_dataset);

}

function createDoubleHeaderTable(p_tableRoot, p_tableFirstHeader, p_tableSecondHeader, p_dataset) {
    //first header is a group of multiple columns. We have to give the number of column that each of them takes
    //create headers of each colum
    var header = p_tableRoot.append("thead");

    header.append("tr")
    .selectAll("th")
    .data(p_tableFirstHeader)
    .enter().append("th")
    .attr("colspan", function (d) { return d.colspan; })
    .attr("rowspan", function (d) { return d.rowspan; })
    .text(function (d) { return d.label; })

    header.append("tr")
    .selectAll("th")
    .data(p_tableSecondHeader)
    .enter().append("th")
    .text(function (d) { return d; })

    updateTable(p_tableRoot, p_dataset);

}

function updateTable(p_tableRoot, p_dataset) {
    //get tbody element and remove the content if it's exist to update it
    p_tableRoot.select("tbody").remove();

    var body = p_tableRoot.append("tbody");

    //add rows of the table without content
    var rows = body.selectAll(".rows")
    .data(p_dataset)
    .enter().append("tr")
    .attr('class', "rows");

    //add first element of each row
    var rowHeader = rows.append("th")
    .text(function (d) { return d.label; });

    var columns = rows.selectAll('.columns')
    .data(function (d) { return d.dataValues; })
    .enter().append("td")
    .attr("class", "columns")
    .text(function (d) { return d; });
}

//toggle a chart and a table with the right button
function toggleIntoTable(p_chartElmtId, p_tableElmtId, p_legendElmtId, p_TableLegendElmtId) {
    if ($(p_chartElmtId).hasClass("disabled")) {
        $(p_chartElmtId).removeClass("disabled");

        if (p_legendElmtId != null)
            $(p_legendElmtId).removeClass("disabled");

        if (p_TableLegendElmtId != null)
            $(p_TableLegendElmtId).addClass("disabled");

        $(p_tableElmtId).addClass("disabled");
    }

    else if ($(p_tableElmtId).hasClass("disabled")) {
        $(p_tableElmtId).removeClass("disabled");

        if (p_legendElmtId != null)
            $(p_legendElmtId).addClass("disabled");

        if (p_TableLegendElmtId != null)
            $(p_TableLegendElmtId).removeClass("disabled");

        $(p_chartElmtId).addClass("disabled");
    }
}

//remove all chart and table data when you resize your window to avoid weird artefacts
function globalDestroy() {
    var svgs = document.getElementsByTagName('svg');
    for (var i = svgs.length - 1; i >= 0; i--) {
        if (svgs[i] != undefined)
            svgs[i].parentNode.removeChild(svgs[i]);
    }

    var chartTooltips = document.getElementsByClassName('chartTooltip');
    for (var i = chartTooltips.length - 1; i >= 0; i--) {
        if (chartTooltips[i] != undefined)
            chartTooltips[i].parentNode.removeChild(chartTooltips[i]);
    }

    var chartTables = document.getElementsByClassName('chartTable');
    for (var i = chartTables.length - 1; i >= 0; i--) {
        while (chartTables[i].hasChildNodes()) {
            chartTables[i].removeChild(chartTables[i].lastChild);
        }
    }

}

//refresh charts when you enable/disable a global legend element or when you resize the page
function globalRefresh() {
    createOrUpdatePredictionSettings();

    create_GNP_PerfCoverage(
        isDefined(getGlNetworkPerModulationDLData()),
        getGlNetworkPerModulationDLData(),
        '#GlNetworkPerfCoverageDLContainer',
        '#GlNetworkPerfCoverageDLChart',
        '#GlNetworkPerfCoverageDLTable',
        '#GlNetworkPerfCoverageDLTableContainer',
        '#GlNetworkPerfCoverageDLLegend',
        '#GlNetworkPerfCoverageDLMenuButton',
        '#GlNetworkPerfCoverageDLTitle');

    create_GNP_PerfCoverage(
        isDefined(getGlNetworkPerModulationULData()),
        getGlNetworkPerModulationULData(),
        '#GlNetworkPerfCoverageULContainer',
        '#GlNetworkPerfCoverageULChart',
        '#GlNetworkPerfCoverageULTable',
        '#GlNetworkPerfCoverageULTableContainer',
        '#GlNetworkPerfCoverageULLegend',
        '#GlNetworkPerfCoverageULMenuButton',
        '#GlNetworkPerfCoverageULTitle');

    create_GNP_PerfCoverage(
        isDefined(getGlNetworkPerReceivedPowerDLData()),
        getGlNetworkPerReceivedPowerDLData(),
        '#GlNetworkPerfReceivedPowerDLContainer',
        '#GlNetworkPerfReceivedPowerDLChart',
        '#GlNetworkPerfReceivedPowerDLTable',
        '#GlNetworkPerfReceivedPowerDLTableContainer',
        '#GlNetworkPerfReceivedPowerDLLegend',
        '#GlNetworkPerfReceivedPowerDLMenuButton',
        '#GlNetworkPerfReceivedPowerDLTitle');

    create_GNP_PerfCoverage(
        isDefined(getGlNetworkPerReceivedPowerULData()),
        getGlNetworkPerReceivedPowerULData(),
        '#GlNetworkPerfReceivedPowerULContainer',
        '#GlNetworkPerfReceivedPowerULChart',
        '#GlNetworkPerfReceivedPowerULTable',
        '#GlNetworkPerfReceivedPowerULTableContainer',
        '#GlNetworkPerfReceivedPowerULLegend',
        '#GlNetworkPerfReceivedPowerULMenuButton',
        '#GlNetworkPerfReceivedPowerULTitle');

    create_GNP_PerfCoverage(
        isDefined(getGlNetworkPerSINRWithMarginsDLData()),
        getGlNetworkPerSINRWithMarginsDLData(),
        '#GlNetworkPerfSINRWithMarginsDLContainer',
        '#GlNetworkPerfSINRWithMarginsDLChart',
        '#GlNetworkPerfSINRWithMarginsDLTable',
        '#GlNetworkPerfSINRWithMarginsDLTableContainer',
        '#GlNetworkPerfSINRWithMarginsDLLegend',
        '#GlNetworkPerfSINRWithMarginsDLMenuButton',
        '#GlNetworkPerfSINRWithMarginsDLTitle');

    create_GNP_PerfCoverage(
        isDefined(getGlNetworkPerSINRWithMarginsULData()),
        getGlNetworkPerSINRWithMarginsULData(),
        '#GlNetworkPerfSINRWithMarginsULContainer',
        '#GlNetworkPerfSINRWithMarginsULChart',
        '#GlNetworkPerfSINRWithMarginsULTable',
        '#GlNetworkPerfSINRWithMarginsULTableContainer',
        '#GlNetworkPerfSINRWithMarginsULLegend',
        '#GlNetworkPerfSINRWithMarginsULMenuButton',
        '#GlNetworkPerfSINRWithMarginsULTitle');

    create_PGP(
        getPerHubPerformancesData(),
        '#PerHubPerformanceTableContainer',
        isDefined(getPerHubPerformancesData()),
        '#PerHubPerformanceContent',
        '#PerHubPerformanceChart',
        '#PerHubPerformanceLegend',
        '#PerHubPerformanceTable',
        '#PerHubPerformanceMenuButton',
        '#PerHubPerformanceTitle',
        secondaryColors,
        true);

    create_PGP(
        getOpticalVisibilityPerformancesData(),
        '#OpticalVisibilityPerformanceTableContainer',
        isDefined(getOpticalVisibilityPerformancesData()),
        '#OpticalVisibilityPerformanceContent',
        '#OpticalVisibilityPerformanceChart',
        '#OpticalVisibilityPerformanceLegend',
        '#OpticalVisibilityPerformanceTable',
        '#OpticalVisibilityPerformanceMenuButton',
        '#OpticalVisibilityPerformanceTitle',
        opticalVisibilityColors,
        false);


    createChartSettings();
}
