import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";


const createPiePhyid = (data) => {
    let parsedData = [];
    let chartdata  = [];
    let phyidSet = new Set();
    data.forEach(el => {
        phyidSet.add(el.phyid);
    });
    phyidSet.forEach(phyid=>{
        parsedData[phyid] = 0;
        data.forEach(el => {
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
            chartdata.push(objToChart);
    }
    am4core.useTheme(am4themes_animated);
    const chart = am4core.create("pie-phyid", am4charts.PieChart);
    const pieSeries = chart.series.push(new am4charts.PieSeries());
    pieSeries.dataFields.value = "count";
    pieSeries.dataFields.category = "type";

    chart.innerRadius = am4core.percent(30);

    // Put a thick white border around each Slice
    pieSeries.slices.template.stroke = am4core.color("#fff");
    pieSeries.slices.template.strokeWidth = 2;
    pieSeries.slices.template.strokeOpacity = 1;
    pieSeries.slices.template
        // change the cursor on hover to make it apparent the object can be interacted with
        .cursorOverStyle = [
        {
            "property": "cursor",
            "value": "pointer"
        }
    ];

    pieSeries.alignLabels = false;
    pieSeries.labels.template.bent = true;
    pieSeries.labels.template.radius = 5;
    pieSeries.labels.template.padding(0, 0, 0, 0);
    pieSeries.labels.template.text = '{category}';

    pieSeries.ticks.template.disabled = true;
    pieSeries.slices.template.tooltipText = "{category}: {value.value}";
    const shadow = pieSeries.slices.template.filters.push(new am4core.DropShadowFilter());
    shadow.opacity = 0;

    const hoverState = pieSeries.slices.template.states.getKey("hover");
    const hoverShadow = hoverState.filters.push(new am4core.DropShadowFilter());
    // const activeState =
    hoverShadow.opacity = 0.7;
    hoverShadow.blur = 5;

    // todo: change table filters onHit
    pieSeries.slices.template.events.on("hit", function (ev) {
        // console.log(ev.target.dataItem.dataContext.type);
    }, this);

    chart.legend = new am4charts.Legend();
    chart.data = chartdata;

};
