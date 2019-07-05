import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

export const buildFirmsInfo = (firmsInfo) => {
    // Themes begin
    am4core.useTheme(am4themes_animated);
// Themes end

// Create chart instance
    const chart = am4core.create("firms-info", am4charts.XYChart3D);

// Add data
    chart.data = firmsInfo;

// Create axes
    const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "firm_name";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 20;
    categoryAxis.renderer.labels.template.rotation = 270;
    categoryAxis.renderer.labels.template.hideOversized = false;
    categoryAxis.renderer.labels.template.horizontalCenter = "right";
    categoryAxis.renderer.labels.template.verticalCenter = "middle";
    categoryAxis.tooltip.label.rotation = 270;
    categoryAxis.tooltip.label.horizontalCenter = "right";
    categoryAxis.tooltip.label.verticalCenter = "middle";

    const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());


// Create series
    const series = chart.series.push(new am4charts.ColumnSeries3D());
    series.dataFields.valueY = "coids";
    series.dataFields.categoryX = "firm_name";
    series.name = "Users";
    series.clustered = false;
    series.columns.template.tooltipText = "Users in {firm_name}: [bold]{valueY}[/]";
    series.columns.template.fillOpacity = 0.9;

    const series2 = chart.series.push(new am4charts.ColumnSeries3D());
    series2.dataFields.valueY = "firmDevices";
    series2.dataFields.categoryX = "firm_name";
    series2.name = "Devices";
    series2.clustered = false;
    series2.columns.template.tooltipText = "Devices in {firm_name}: [bold]{valueY}[/]";

    chart.cursor = new am4charts.XYCursor();
    chart.cursor.lineX.strokeOpacity = 0;
    chart.cursor.lineY.strokeOpacity = 0;

    chart.scrollbarX = new am4core.Scrollbar();

    chart.legend = new am4charts.Legend();

    chart.colors.step = 2;
};
