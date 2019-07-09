import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

export const buildFirmInfo = (firmInfo) => {
// Themes begin
    am4core.useTheme(am4themes_animated);
// Themes end

// Create chart instance
    const chart = am4core.create("firm-info-chart", am4charts.XYChart3D);

// Add data
    chart.data = firmInfo;

// Create axes
    let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "email";
    categoryAxis.renderer.labels.template.rotation = 270;
    categoryAxis.renderer.labels.template.hideOversized = false;
    categoryAxis.renderer.minGridDistance = 20;
    categoryAxis.renderer.labels.template.horizontalCenter = "right";
    categoryAxis.renderer.labels.template.verticalCenter = "middle";
    categoryAxis.tooltip.label.rotation = 270;
    categoryAxis.tooltip.label.horizontalCenter = "right";
    categoryAxis.tooltip.label.verticalCenter = "middle";

    let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.title.text = "Devices";
    valueAxis.title.fontWeight = "bold";

// Create series
    const series = chart.series.push(new am4charts.ColumnSeries3D());
    series.dataFields.valueY = "count";
    series.dataFields.categoryX = "email";
    series.name = "Records";
    series.tooltipText = "{categoryX}: [bold]{valueY}[/]";
    series.columns.template.fillOpacity = .8;

    const columnTemplate = series.columns.template;
    columnTemplate.strokeWidth = 2;
    columnTemplate.strokeOpacity = 1;
    columnTemplate.stroke = am4core.color("#FFFFFF");

    columnTemplate.adapter.add("fill", (fill, target) => {
        return chart.colors.getIndex(target.dataItem.index);
    });

    columnTemplate.adapter.add("stroke", (stroke, target) => {
        return chart.colors.getIndex(target.dataItem.index);
    });

    chart.cursor = new am4charts.XYCursor();
    chart.cursor.lineX.strokeOpacity = 0;
    chart.cursor.lineY.strokeOpacity = 0;

};
