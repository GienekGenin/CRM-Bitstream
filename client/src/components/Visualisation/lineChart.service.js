import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

const getColorFromPalete = (i) => {
    const colors = [
        '#9660CB',
        '#DC6788',
        '#6169CD',
        '#D765CA',
        '#8DADE1',
        '#D78965',
        '#68B7DC',
    ];
    if(colors[i]){
        return colors[i];
    } else {
        return '#6169CD';
    }
};

export const createLineChart = (data, selectedDevices) => {
    am4core.useTheme(am4themes_animated);

    const chart = am4core.create("lineChart", am4charts.XYChart);

    const chartData = [];
    let max, len = [];
    data.forEach((dev, i) => {
        len.push(dev.data.length);
    });
    max = Math.max(...len);
    data.forEach((dev, i) => {
        dev.data.forEach(mes=>{
            let value = mes.value;
            if(value === 'ONLINE'){
                value = 1;
            }
            if(value === 'OFFLINE'){
                value = 0;
            }
            chartData.push({['date'+i]: new Date(mes.ts), ['value'+i]: value});
        });

        let color = getColorFromPalete(i);

        let dateAxis = chart.xAxes.push(new am4charts.DateAxis());
        dateAxis.renderer.grid.template.location = 0;
        dateAxis.renderer.minGridDistance = 350;
        dateAxis.renderer.labels.template.fill = am4core.color(color);

        let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.tooltip.disabled = true;
        // valueAxis.renderer.grid.template.strokeDasharray = "2,3";
        valueAxis.renderer.labels.template.fill = am4core.color(color);
        valueAxis.renderer.line.stroke = am4core.color(color);
        valueAxis.renderer.minWidth = 60;
        valueAxis.renderer.line.strokeOpacity = 1;
        // valueAxis.renderer.line.strokeWidth = 2;

        let series = chart.series.push(new am4charts.LineSeries());
        series.name = selectedDevices.filter(el=> el.sid === dev._id.sid)[0].name;
        series.dataFields.dateX = 'date'+i;
        series.dataFields.valueY = 'value'+i;
        series.yAxis = valueAxis;
        series.xAxis = dateAxis;
        series.tooltipText = "{dateX.formatDate('yyyy-MM-dd hh:mm')}: [bold]{valueY}[/]";
        series.fill = am4core.color(color);
        series.stroke = am4core.color(color);
        // series.strokeWidth = 2;

        dateAxis.renderer.grid.template.strokeOpacity = 0.07;
        valueAxis.renderer.grid.template.strokeOpacity = 0.07;

        if(dev.data.length === max){
            let scrollbarX = new am4charts.XYChartScrollbar();
            scrollbarX.series.push(series);
            chart.scrollbarX = scrollbarX;
        }

    });

    chart.data = chartData;

    chart.cursor = new am4charts.XYCursor();

    chart.legend = new am4charts.Legend();

    chart.colors.step = 2;
};

