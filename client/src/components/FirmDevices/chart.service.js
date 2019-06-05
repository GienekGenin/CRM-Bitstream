import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import _ from "lodash";
import * as d3 from "d3";
import * as am4plugins_forceDirected from "@amcharts/amcharts4/plugins/forceDirected";
import store from "../../redux/store";

export const forcedTree = (parent, stateDevices) => {

    const unflatten = (array, parent, tree) => {
        tree = typeof tree !== 'undefined' ? tree : [];
        parent = typeof parent !== 'undefined' ? parent : {sid: '0'};

        let children = _.filter(array, function (child) {
            return child.parent_id === parent.sid;
        });

        if (!_.isEmpty(children)) {
            if (parent.sid === '0') {
                tree = children;
            } else {
                parent['children'] = children;
            }
            _.each(children, function (child) {
                unflatten(array, child)
            });
        }

        return tree;
    };

    d3.select('#forcedTree').remove();
    d3.select('#parent').append('div').attr("id", 'forcedTree');

    let Parent = Object.assign({}, parent);
    let devices = [...stateDevices];
    let arr = [];
    devices.forEach(el => {
        if (el.sid.includes(Parent.sid)) {
            if (el.sid === Parent.sid) {
                arr.push(Parent);
            } else arr.push(el);

        }
    });

    const getProps = (status) => {
        if (status === 'OFFLINE') {
            return {color: '#616161'};
        } else {
            return {color: '#257'};
        }
    };

    arr.forEach((el, i, arr) => {
        if (!el.status) {
            arr[i] = Object.assign(el, {status: 'OFFLINE'});
        }
    });

    // Needed to change radius size
    arr.forEach((parent, i, arr) => {
        parent = Object.assign(parent, getProps(parent.status), {value: 1});
        arr.forEach((child, c) => {
            if (child.parent_id.includes(parent.sid)) {
                parent = _.omit(parent, 'value');
                if (parent.status === 'OFFLINE') {
                    arr[c] = Object.assign(child, getProps('OFFLINE'), {status: 'OFFLINE'});
                }
            }
        });
        arr[i] = parent;
    });

    // todo: not building if arr of 1 element
    if (arr.length === 0 || arr.length === 1) {
        return false
    }
    let treeData = [unflatten(arr)[0]];
    // Themes begin
    am4core.useTheme(am4themes_animated);
// Themes end

    let chart = am4core.create("forcedTree", am4plugins_forceDirected.ForceDirectedTree);
    let networkSeries = chart.series.push(new am4plugins_forceDirected.ForceDirectedSeries());

    chart.data = treeData;

    networkSeries.dataFields.value = "value";
    networkSeries.dataFields.name = "name";
    networkSeries.dataFields.color = 'color';
    networkSeries.dataFields.children = "children";
    networkSeries.nodes.template.label.valign = "bottom";
    networkSeries.nodes.template.label.fill = am4core.color("#000");
    networkSeries.nodes.template.label.dy = 10;
    networkSeries.nodes.template.tooltipText = "{name} : Phyid - {phyid}";
    networkSeries.nodes.template.fillOpacity = 1;
    networkSeries.manyBodyStrength = -20;
    networkSeries.links.template.strength = 0.8;
    networkSeries.minRadius = 30;
    networkSeries.fontSize = 10;

    networkSeries.nodes.template.label.text = "{name}";

    let icon = networkSeries.nodes.template.createChild(am4core.Image);
    icon.href = "http://www.iconhot.com/icon/png/devine-icons-part-2/512/device-and-hardware-w.png";
    icon.horizontalCenter = "middle";
    icon.verticalCenter = "middle";
    icon.width = 40;
    icon.height = 40;

    chart.legend = new am4charts.Legend();
};

export const createPie = (data, _this) => {
    const types = _this.props.deviceTypes;
    let parsedData = [];
    let chartdata = [];
    types.forEach(el => {
        parsedData[el.name] = 0;
        data.forEach(device => {
            if (device.type === el._id) {
                parsedData[el.name]++;
            }
        })
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
    const shadow = pieSeries.slices.template.filters.push(new am4core.DropShadowFilter());
    shadow.opacity = 0;

    const hoverState = pieSeries.slices.template.states.getKey("hover");
    const hoverShadow = hoverState.filters.push(new am4core.DropShadowFilter());
    // const activeState =
    hoverShadow.opacity = 0.7;
    hoverShadow.blur = 5;

    // todo: change table filters onHit
    pieSeries.slices.template.events.on("hit", (ev) => {
        let selectedTypes = _this.state.selectedTypes;
        let typeClicked = types.filter(el => el.name === ev.target.dataItem.dataContext.type)[0]._id;
        selectedTypes.has(typeClicked) ? selectedTypes.delete(typeClicked) : selectedTypes.add(typeClicked);
        _this.setState({selectedTypes});
        chartSelectTypes(_this);
    }, _this);

    chart.legend = new am4charts.Legend();
    chart.data = chartdata;
};

export const createPiePhyid = (data, _this) => {
    let parsedData = [];
    let chartdata = [];
    let phyidSet = new Set();
    data.forEach(el => {
        phyidSet.add(el.phyid);
    });
    phyidSet.forEach(phyid => {
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

    // cointainer to hold both charts
    const container = am4core.create("pie-phyid", am4core.Container);
    container.width = am4core.percent(100);
    container.height = am4core.percent(100);
    container.layout = "horizontal";

    const chart = container.createChild(am4charts.PieChart);
    const pieSeries = chart.series.push(new am4charts.PieSeries());
    pieSeries.dataFields.value = "count";
    pieSeries.dataFields.category = "type";

    chart.innerRadius = am4core.percent(40);
    chart.radius = am4core.percent(70);

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
    pieSeries.slices.template.events.on("hit", (ev) => {
        let selectedPhyids = _this.state.selectedPhyids;
        let phyidClicked = ev.target.dataItem.dataContext.type;
        selectedPhyids.has(phyidClicked) ? selectedPhyids.delete(phyidClicked) : selectedPhyids.add(phyidClicked);
        _this.setState({selectedPhyids});
        chartSelectPhyid(_this);
    }, _this);

    chart.legend = new am4charts.Legend();
    chart.data = chartdata;
};

export const createPieGroup = (data, _this) => {
    let parsedData = [];
    let chartdata = [];
    let groupSet = new Set();
    data.forEach(el => {
        groupSet.add(el.groupid);
    });
    groupSet.forEach(groupid => {
        parsedData[groupid] = 0;
        data.forEach(el => {
            if (groupid === el.groupid) {
                parsedData[groupid]++;
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

    // cointainer to hold both charts
    const container = am4core.create("pie-group", am4core.Container);
    container.width = am4core.percent(100);
    container.height = am4core.percent(100);
    container.layout = "horizontal";

    const chart = container.createChild(am4charts.PieChart);
    const pieSeries = chart.series.push(new am4charts.PieSeries());
    pieSeries.dataFields.value = "count";
    pieSeries.dataFields.category = "type";

    chart.innerRadius = am4core.percent(40);
    chart.radius = am4core.percent(70);

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
    pieSeries.slices.template.events.on("hit", (ev) => {
        let selectedGroups = _this.state.selectedGroups;
        let groupClicked = ev.target.dataItem.dataContext.type;
        selectedGroups.has(groupClicked) ? selectedGroups.delete(groupClicked) : selectedGroups.add(groupClicked);
        _this.setState({selectedGroups});
        chartSelectGroup(_this);
    }, _this);

    chart.legend = new am4charts.Legend();
    chart.data = chartdata;
};

const sortByType = (reduxDevices, selectedTypes) => {
    let devices = [];
    const parentDevicesSids =
        reduxDevices
            .filter(device => device.parent_id === '0')
            .filter(parent => selectedTypes.has(parent.type))
            .map(parent => parent.sid);
    parentDevicesSids.forEach(sid => {
        reduxDevices.forEach(device => {
            if (device.sid.includes(sid)) {
                devices.push(device);
            }
        })
    });
    return devices;
};

const chartSelectTypes = (_this) => {
    _this.renderSelectAllCheckBox(false);
    d3.select('#tree').remove();
    let reduxDevices = store.getState().devicesReducer.devices;
    let {selectedTypes} = _this.state;
    if (selectedTypes.size === 0) {
        createPieGroup([], _this);
        createPiePhyid([], _this);
        _this.setState({devices: reduxDevices, selectedGroups: new Set(), selectedPhyids: new Set()});
    } else {
        let devices = sortByType(reduxDevices, selectedTypes);
        _this.setState({devices, selectedGroups: new Set(), selectedPhyids: new Set()});
        createPieGroup(devices, _this);
    }
    _this.resetSelected();
    _this.props.resetSelectedDeviceParent();
};

const sortByGroup = (renderedDevices, selectedGroups) => {
    return renderedDevices.filter(device => selectedGroups.has(device.groupid));
};

const chartSelectGroup = (_this) => {
    _this.renderSelectAllCheckBox(false);
    let reduxDevices = store.getState().devicesReducer.devices;
    d3.select('#tree').remove();
    let {selectedTypes, selectedGroups} = _this.state;
    if (selectedGroups.size === 0) {
        createPiePhyid([], _this);
        let renderedDevices = sortByType(reduxDevices, selectedTypes);
        _this.setState({devices: renderedDevices, selectedPhyids: new Set()});
    } else {
        let renderedByType = sortByType(reduxDevices, selectedTypes);
        let renderedByGroup = sortByGroup(renderedByType, selectedGroups);
        _this.setState({devices: renderedByGroup, selectedPhyids: new Set()});
        createPiePhyid(renderedByGroup, _this);
    }
    _this.resetSelected();
    _this.props.resetSelectedDeviceParent();
};

const sortByPhyid = (renderedDevices, selectedPhyids) => {
    return renderedDevices.filter(device => selectedPhyids.has(device.phyid));
};

const chartSelectPhyid = (_this) => {
    _this.renderSelectAllCheckBox(false);
    let reduxDevices = store.getState().devicesReducer.devices;
    d3.select('#tree').remove();
    let {selectedTypes, selectedGroups, selectedPhyids} = _this.state;
    if (selectedPhyids.size === 0) {
        let renderedByType = sortByType(reduxDevices, selectedTypes);
        let renderedByGroup = sortByGroup(renderedByType, selectedGroups);
        _this.setState({devices: renderedByGroup});
    } else {
        let renderedByType = sortByType(reduxDevices, selectedTypes);
        let renderedByGroup = sortByGroup(renderedByType, selectedGroups);
        let renderedByPhyid = sortByPhyid(renderedByGroup, selectedPhyids);
        _this.setState({devices: renderedByPhyid});
    }
    _this.resetSelected();
    _this.props.resetSelectedDeviceParent();
};
