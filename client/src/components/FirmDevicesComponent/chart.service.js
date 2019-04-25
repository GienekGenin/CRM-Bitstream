import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import {deviceTypesService} from '../../redux/services/device_types';


const createPie = (data) => {
    deviceTypesService.getDeviceTypes().then(types=>{
        let parsedData = [];
        let chartdata = [];
        types.forEach(el=>{
            parsedData[el.name] = 0;
           data.forEach(device=>{
               if(device.type === el._id){
                   parsedData[el.name]++;
               }
           })
        });
        for(let key in parsedData){
            let objToChart = {
                type: key,
                count: parsedData[key]
            };
            if(objToChart.count > 0)
            chartdata.push(objToChart);
        }
        am4core.useTheme(am4themes_animated);
        const chart = am4core.create("device-types-chart", am4charts.PieChart);
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
        pieSeries.labels.template.radius = 3;
        pieSeries.labels.template.padding(0, 0, 0, 0);

        pieSeries.ticks.template.disabled = true;
        const shadow = pieSeries.slices.template.filters.push(new am4core.DropShadowFilter);
        shadow.opacity = 0;

        const hoverState = pieSeries.slices.template.states.getKey("hover");
        const hoverShadow = hoverState.filters.push(new am4core.DropShadowFilter);
        // const activeState =
        hoverShadow.opacity = 0.7;
        hoverShadow.blur = 5;

        // todo: change table filters onHit
        pieSeries.slices.template.events.on("hit", function(ev) {
            console.log(ev.target.dataItem.dataContext.type);
        }, this);

        chart.legend = new am4charts.Legend();
        chart.data = chartdata;
    });
};
