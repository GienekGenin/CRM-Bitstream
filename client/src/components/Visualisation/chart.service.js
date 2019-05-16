import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

const getColorFromPalette = (i) => {
    const colors = [
        '#9660CB',
        '#DC6788',
        '#6169CD',
        '#D765CA',
        '#8DADE1',
        '#D78965',
        '#68B7DC',
    ];
    if (colors[i]) {
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
        dev.data.forEach(mes => {
            let value = mes.value;
            if (value === 'ONLINE') {
                value = 1;
            }
            if (value === 'OFFLINE') {
                value = 0;
            }
            chartData.push({['date' + i]: new Date(mes.ts), ['value' + i]: value});
        });

        let color = getColorFromPalette(i);

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
        series.name = selectedDevices.filter(el => el.sid === dev._id.sid)[0].name;
        series.dataFields.dateX = 'date' + i;
        series.dataFields.valueY = 'value' + i;
        series.yAxis = valueAxis;
        series.xAxis = dateAxis;
        series.tooltipText = "{dateX.formatDate('yyyy-MM-dd hh:mm')}: [bold]{valueY}[/]";
        series.fill = am4core.color(color);
        series.stroke = am4core.color(color);
        // series.strokeWidth = 2;

        dateAxis.renderer.grid.template.strokeOpacity = 0.07;
        valueAxis.renderer.grid.template.strokeOpacity = 0.07;

        if (dev.data.length === max) {
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

export const createDragPhyidPie = (devicesToShow, _this) => {
    let {selectedPhyids} = _this.state;
    if (devicesToShow) {
        let parsedData = [];
        let data = [];
        data.push({
            "type": "Empty",
            "disabled": true,
            "count": 1,
            "color": am4core.color("#dadada"),
            "opacity": 0.3,
            "strokeDasharray": "4,4"
        });
        let phyidSet = new Set();
        devicesToShow.forEach(el => {
            phyidSet.add(el.phyid);
        });
        phyidSet.forEach(phyid => {
            parsedData[phyid] = 0;
            devicesToShow.forEach(el => {
                if (phyid === el.phyid) {
                    parsedData[phyid]++;
                }
            });
        });
        for (let key in parsedData) {
            let objToChart = {
                type: key,
                count: parsedData[key]
            };
            if (objToChart.count > 0)
                data.push(objToChart);
        }

        am4core.useTheme(am4themes_animated);

        // cointainer to hold both charts
        const container = am4core.create("pie-phyid-vis", am4core.Container);
        container.width = am4core.percent(100);
        container.height = am4core.percent(100);
        container.layout = "horizontal";

        container.events.on("maxsizechanged", function () {
            chart1.zIndex = 0;
            separatorLine.zIndex = 1;
            dragText.zIndex = 2;
            chart2.zIndex = 3;
        });

        const chart1 = container.createChild(am4charts.PieChart);
        chart1.fontSize = 11;
        chart1.hiddenState.properties.opacity = 0; // this makes initial fade in effect
        chart1.data = data;
        chart1.radius = am4core.percent(70);
        chart1.innerRadius = am4core.percent(40);
        chart1.zIndex = 1;

        // legend
        // chart1.legend = new am4charts.Legend();

        const series1 = chart1.series.push(new am4charts.PieSeries());
        series1.dataFields.value = "count";
        series1.dataFields.category = "type";
        series1.colors.step = 2;
        series1.alignLabels = false;
        series1.labels.template.bent = true;
        series1.labels.template.radius = 3;
        series1.labels.template.padding(0, 0, 0, 0);

        const sliceTemplate1 = series1.slices.template;
        sliceTemplate1.cornerRadius = 5;
        sliceTemplate1.draggable = true;
        sliceTemplate1.inert = true;
        sliceTemplate1.propertyFields.fill = "color";
        sliceTemplate1.propertyFields.fillOpacity = "opacity";
        sliceTemplate1.propertyFields.stroke = "color";
        sliceTemplate1.propertyFields.strokeDasharray = "strokeDasharray";
        sliceTemplate1.strokeWidth = 1;
        sliceTemplate1.strokeOpacity = 1;

        let zIndex = 5;

        sliceTemplate1.events.on("down", (event) => {
            event.target.toFront();
            // also put chart to front
            const series = event.target.dataItem.component;
            series.chart.zIndex = zIndex++;
        });

        series1.ticks.template.disabled = true;

        sliceTemplate1.states.getKey("active").properties.shiftRadius = 0;

        sliceTemplate1.events.on("dragstop", (event) => {
            handleDragStop(event);
        });

        // separator line and text
        const separatorLine = container.createChild(am4core.Line);
        separatorLine.x1 = 0;
        separatorLine.y2 = 300;
        separatorLine.strokeWidth = 3;
        separatorLine.stroke = am4core.color("#dadada");
        separatorLine.valign = "middle";
        separatorLine.strokeDasharray = "5,5";


        const dragText = container.createChild(am4core.Label);
        dragText.text = "Drag slices over the line";
        dragText.rotation = 90;
        dragText.valign = "middle";
        dragText.align = "center";
        dragText.paddingBottom = 5;

        // second chart
        const chart2 = container.createChild(am4charts.PieChart);
        chart2.hiddenState.properties.opacity = 0; // this makes initial fade in effect
        chart2.fontSize = 11;
        chart2.radius = am4core.percent(70);
        chart2.data = data;
        chart2.innerRadius = am4core.percent(40);
        chart2.zIndex = 1;

        const series2 = chart2.series.push(new am4charts.PieSeries());
        series2.dataFields.value = "count";
        series2.dataFields.category = "type";
        series2.colors.step = 2;

        series2.alignLabels = false;
        series2.labels.template.bent = true;
        series2.labels.template.radius = 3;
        series2.labels.template.padding(0, 0, 0, 0);
        series2.labels.template.propertyFields.disabled = "disabled";

        const sliceTemplate2 = series2.slices.template;
        sliceTemplate2.copyFrom(sliceTemplate1);

        series2.ticks.template.disabled = true;

        const handleDragStop = (event) => {
            let targetSlice = event.target;
            let dataItem1;
            let dataItem2;
            let slice1;
            let slice2;

            if (series1.slices.indexOf(targetSlice) !== -1) {
                slice1 = targetSlice;
                slice2 = series2.dataItems.getIndex(targetSlice.dataItem.index).slice;
            } else if (series2.slices.indexOf(targetSlice) !== -1) {
                slice1 = series1.dataItems.getIndex(targetSlice.dataItem.index).slice;
                slice2 = targetSlice;
            }

            dataItem1 = slice1.dataItem;
            dataItem2 = slice2.dataItem;
            const toggledType = dataItem2.dataContext.type;

            const series1Center = am4core.utils.spritePointToSvg({x: 0, y: 0}, series1.slicesContainer);
            const series2Center = am4core.utils.spritePointToSvg({x: 0, y: 0}, series2.slicesContainer);

            const series1CenterConverted = am4core.utils.svgPointToSprite(series1Center, series2.slicesContainer);
            const series2CenterConverted = am4core.utils.svgPointToSprite(series2Center, series1.slicesContainer);

            // tooltipY and tooltipY are in the middle of the slice, so we use them to avoid extra calculations
            const targetSlicePoint = am4core.utils.spritePointToSvg({
                x: targetSlice.tooltipX,
                y: targetSlice.tooltipY
            }, targetSlice);

            if (targetSlice === slice1) {
                if (targetSlicePoint.x > container.pixelWidth / 2) {
                    // const value = dataItem1.value;

                    dataItem1.hide();

                    const animation = slice1.animate([{property: "x", to: series2CenterConverted.x}, {
                        property: "y",
                        to: series2CenterConverted.y
                    }], 400);
                    animation.events.on("animationprogress", (event) => {
                        slice1.hideTooltip();
                    });

                    slice2.x = 0;
                    slice2.y = 0;

                    dataItem2.show();
                    selectedPhyids.add(toggledType);
                } else {
                    slice1.animate([{property: "x", to: 0}, {property: "y", to: 0}], 400);
                }
            }
            if (targetSlice === slice2) {
                if (targetSlicePoint.x < container.pixelWidth / 2) {

                    // const value = dataItem2.value;

                    dataItem2.hide();
                    selectedPhyids.delete(toggledType);

                    const animation = slice2.animate([{property: "x", to: series1CenterConverted.x}, {
                        property: "y",
                        to: series1CenterConverted.y
                    }], 400);
                    animation.events.on("animationprogress", (event) => {
                        slice2.hideTooltip();
                    });

                    slice1.x = 0;
                    slice1.y = 0;
                    dataItem1.show();
                } else {
                    slice2.animate([{property: "x", to: 0}, {property: "y", to: 0}], 400);
                }
            }

            // get all devices with matching phyids
            let devicesToVis = [];
            selectedPhyids.forEach(phyid => {
                devicesToShow.forEach(device => {
                    if (device.phyid === phyid) {
                        devicesToVis.push(device);
                    }
                });
            });
            _this.setState({selectedPhyids, devicesToVis});

            toggleDummySlice(series1);
            toggleDummySlice(series2);

            series1.hideTooltip();
            series2.hideTooltip();
        };

        const toggleDummySlice = (series) => {
            let show = true;
            for (let i = 1; i < series.dataItems.length; i++) {
                const dataItem = series.dataItems.getIndex(i);
                if (dataItem.slice.visible && !dataItem.slice.isHiding) {
                    show = false;
                }
            }

            const dummySlice = series.dataItems.getIndex(0);
            if (show) {
                dummySlice.show();
            } else {
                dummySlice.hide();
            }
        };

        series2.events.on("datavalidated", () => {
            const dummyDataItem = series2.dataItems.getIndex(0);
            dummyDataItem.show(0);
            dummyDataItem.slice.draggable = false;
            dummyDataItem.slice.tooltipText = undefined;

            for (let i = 1; i < series2.dataItems.length; i++) {
                series2.dataItems.getIndex(i).hide(0);
            }
        });

        series1.events.on("datavalidated", () => {
            const dummyDataItem = series1.dataItems.getIndex(0);
            dummyDataItem.hide(0);
            dummyDataItem.slice.draggable = false;
            dummyDataItem.slice.tooltipText = undefined;
        });

    }
};