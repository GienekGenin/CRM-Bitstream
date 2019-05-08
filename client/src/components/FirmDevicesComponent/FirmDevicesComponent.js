import React from "react";
import * as PropTypes from 'prop-types';
import _ from "lodash";
import * as d3 from "d3";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

// Material
import {withStyles} from '@material-ui/core/styles';
import Checkbox from "@material-ui/core/Checkbox";
import {styles} from '../UI/material/table-styles';
import {Grid, MuiThemeProvider} from '@material-ui/core';
import Paper from '@material-ui/core/Paper';

// Redux
import store from "../../redux/store";
import {connect} from "react-redux";
import {userDevicesRequest} from "../../redux/actions";
import {tokenService} from "../../redux/services/token";

// Components
import FirmDevicesToolBarComponent from "./FirmDevicesToolBarComponent";
import MaterialTable from 'material-table';
import './firmDevices.scss';
import {theme} from "../material.theme";
import ReactDOM from "react-dom";

const mapDispatchToProps = (dispatch) => {
    return {
        userDevicesRequest: (payload) => dispatch(userDevicesRequest(payload)),
    };
};

const mapStateToProps = state => {
    return {devices: state.devicesReducer.devices};
};

class FirmDevicesComponent extends React.Component {

    _isMounted = false;


    constructor(props) {
        super(props);

        this.state = {
            page: 0,
            rowsPerPage: 5,
            loading: false,
            devices: [],
            selectedFirm: null,
            selectedDevices: [],
            selectedDeviceIds: [],
            columns: [
                {
                    title: 'Select',
                    field: 'action',
                    filtering: false,
                    sorting: false,
                    hidden: false,
                },
                {
                    title: 'Name',
                    field: 'name',
                    hidden: false,
                },
                {title: 'phyid', field: 'phyid', hidden: false,},
                {title: 'sn', field: 'sn', hidden: true,},
                {title: 'soft', field: 'soft', hidden: true,},
                {title: 'status', field: 'status', hidden: false,},
                {title: 'description', field: 'description', hidden: true,},
            ],
            selectedTypes: new Set(),
            selectedPhyids: new Set()
        };

        this.resetSelected = this.resetSelected.bind(this);
        this.addRemoveColumn = this.addRemoveColumn.bind(this);
        this.buildChart = this.buildChart.bind(this);
        this.selectAllDevices = this.selectAllDevices.bind(this);
    }


    componentDidMount() {
        this._isMounted = true;
        this.setState({loading: true});
        const {selectedFirm, selectedUsers, parentDevices, selectedDevices} = this.props;
        if (selectedUsers) {
            const selectedUserIds = selectedUsers.map(user => user._id);
            this.setState({selectedFirm, selectedUsers, selectedUserIds});
            if (!parentDevices) {
                this.setState({selectedUserIds});
                this.props.userDevicesRequest(selectedUserIds);
            } else {
                this.createPie(parentDevices);
                this.createPiePhyid(parentDevices);
                let checked = false;
                if(selectedDevices && selectedDevices.length === parentDevices.length){
                    checked = true;
                }
                this.setState({devices: parentDevices, selectedDevices, checked, loading: false});
            }
        } else {
            let selectedUser = tokenService.verifyToken().user;
            this.setState({selectedUsers: [selectedUser]});
            const {parentDevices} = this.props;
            if (!parentDevices) {
                this.props.userDevicesRequest(selectedUser._id);
            } else {
                this.createPie(parentDevices);
                this.createPiePhyid(parentDevices);
                this.setState({devices: parentDevices, loading: false});
            }
        }
        if (selectedDevices) {
            if (selectedDevices.length === 1) {
                this.buildChart(Object.assign({}, selectedDevices[0], {parent_id: '0'}), parentDevices);
            }
            const selectedDeviceIds = selectedDevices.map(device => device.sid);
            this.setState({selectedDevices, selectedDeviceIds});
        }

        this.unsubscribe = store.subscribe(() => {
            this.setState({loading: store.getState().devicesReducer.loading});
            if (store.getState().devicesReducer.devices) {
                const devices = store.getState().devicesReducer.devices;
                this.createPie(devices);
                this.createPiePhyid(devices);
                this.setState({devices, selectedTypes: new Set(), selectedPhyids: new Set()});
                this.props.handleSetDevices(devices);

            }
            return true;
        });
        this.renderSelectAllCheckBox(false);
    }

    componentWillUnmount() {
        this._isMounted = false;
        this.unsubscribe();
    }

    resetSelected = () => {
        this.setState({selectedDeviceIds: [], selectedDevices: []});
    };

    onChangePage = (page) => {
        this.setState({page});
    };

    onChangeRowsPerPage = (rowsPerPage) => {
        this.setState({rowsPerPage});
    };

    onRowClick = (e, rowData) => {
        const {devices, selectedDeviceIds} = this.state;
        let selectedDevice = _.omit(devices.filter(el => (el.sid === rowData.sid) ? el : null)[0], 'action');
        let selectedDeviceIdsSet = new Set(selectedDeviceIds);
        let sid = selectedDevice.sid;
        selectedDeviceIdsSet.has(sid) ? selectedDeviceIdsSet.delete(sid) : selectedDeviceIdsSet.add(sid);
        let selectedDevices = [];
        [...selectedDeviceIdsSet].forEach(sid=>{
            devices.forEach(device=>{
                if(device.sid === sid){
                    selectedDevices.push(device);
                }
            })
        });
        let checked = false;
        if(selectedDevices.length === devices.length) checked = true;
        this.setState({selectedDevices, selectedDeviceIds: [...selectedDeviceIdsSet]});
        this.handleDeviceSelect(selectedDevices);
        this.renderSelectAllCheckBox(checked);
    };

    addRemoveColumn = (columns) => {
        this.setState({columns});
    };

    handleDeviceSelect(devices) {
        if(devices.length === 1)
            this.buildChart(Object.assign({}, devices[0], {parent_id: '0'}), this.state.devices);
        this.props.onDeviceSelect(devices);
    }

    // todo: possible bugs
    buildChart = (parent, stateDevices) => {

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
                    parent['children'] = children
                }
                _.each(children, function (child) {
                    unflatten(array, child)
                });
            }

            return tree;
        };

        d3.select('#tree').remove();
        d3.select('#parent').append('div').attr("id", 'tree');

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
        // todo: not building if arr of 1 element
        if (arr.length === 0 || arr.length === 1) {
            return false
        }
        let treeData = unflatten(arr)[0];
        let margin = {
                top: 200,
                right: 90,
                bottom: 30,
                left: 90
            },
            width = 560,
            height = 150;

// append the svg object to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
        let svg = d3.select("#tree")
            .append("svg")
            .attr("width", width)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" +
                margin.left + "," + margin.top + ")");

        let i = 0,
            duration = 750,
            root;

// declares a tree layout and assigns the size
        // todo: here change distance between nodes
        let treemap = d3.tree().nodeSize([20, width]);

// Assigns parent, children, height, depth
        root = d3.hierarchy(treeData, function (d) {
            return d.children;
        });
        root.x0 = height / 2;
        root.y0 = 0;

// Collapse after the second level
        root.children.forEach(collapse);


// Collapse the node and all it's children
        function collapse(d) {
            if (d.children) {
                d._children = d.children;
                d._children.forEach(collapse);
                d.children = null;
            }
        }

        const update = (source) => {

            // Assigns the x and y position for the nodes
            let treeData = treemap(root);

            // Compute the new tree layout.
            let nodes = treeData.descendants(),
                links = treeData.descendants().slice(1);

            // Normalize for fixed-depth.
            // todo: distance between nodes
            nodes.forEach(function (d) {
                d.y = d.depth * 100
            });

            // ****************** Nodes section ***************************

            // Update the nodes...
            let node = svg.selectAll('g.node')
                .data(nodes, function (d) {
                    return d.id || (d.id = ++i);
                });

            // Toggle children on click.
            function click(d) {
                // console.log('dataa---', d.data._id);
                if (d.children) {
                    d._children = d.children;
                    d.children = null;
                } else {
                    d.children = d._children;
                    d._children = null;
                }
                update(d);
            }

            const dbClick = (d) => {
                d3.select('#selected').attr("id", '');
                d3.select('#selected-circle').attr("id", '');
                nodeUpdate.select('circle.node')
                    .attr('id', (data) => {
                        if (d.data.name === data.data.name) {
                            this.handleClickNoBuild(null, d.data.sid);
                            return 'selected'
                        }
                    })
            };

            // Enter any new modes at the parent's previous position.
            let nodeEnter = node.enter().append('g')
                .attr('class', 'node')
                .attr("transform", function (d) {
                    return "translate(" + source.y0 + "," + source.x0 + ")";
                })
                // todo: handle click
                .on('mouseover', dbClick)
                .on('click', click)
                // todo: show info
                .on("dblclick", function (d) {
                    let g = d3.select(this); // The node
                    // The class is used to remove the additional text later
                    // let info = g.append('text')
                    g.append('text')
                        .classed('info', true)
                        .attr('x', 20)
                        .attr('y', 10)
                        .text('More info');
                })
                // todo: hide info
                .on("mouseout", function () {
                    // Remove the info text on mouse out.
                    d3.select(this).select('text.info').remove()
                });

            // Add Circle for the nodes
            nodeEnter.append('circle')
                .attr('class', 'node')
                .attr('r', 1e-6)
                .style("fill", function (d) {
                    return d._children ? "lightsteelblue" : "#888333";
                });


            // Add labels for the nodes
            nodeEnter.append('text')
                .attr("class", "label")
                .attr("dy", ".35em")
                .attr("x", function (d) {
                    return d.children || d._children ? -13 : 13;
                })
                .attr("text-anchor", function (d) {
                    return d.children || d._children ? "end" : "start";
                })
                .text(function (d) {
                    return d.data.name;
                })
                .style("fill", function (d) {
                    return d.type;
                })
                // todo: label width
                .call(wrap, 50);

            // todo: text inside node
            // nodeEnter.append('text')
            //     .attr("dy", ".4em")
            //     .attr("x", function (d) {
            //         return d.children || d._children ? 4 : -4;
            //     })
            //     .attr("text-anchor", function (d) {
            //         return d.children || d._children ? "end" : "start";
            //     })
            //     .text(function (d) {
            //         let children = d.children || d._children;
            //         return children ? children.length : null;
            //     });

            // UPDATE
            let nodeUpdate = nodeEnter.merge(node);

            // Transition to the proper position for the node
            nodeUpdate.transition()
                .duration(duration)
                .attr("transform", function (d) {
                    return "translate(" + d.y + "," + d.x + ")";
                });

            // Update the node attributes and style
            // todo: size of node
            nodeUpdate.select('circle.node')
                .attr('r', 5)
                .style("fill", function (d) {
                    //console.log("parentID",d.aspid);
                    // console.log(d)
                    let parentStatus = d.parent ? (d.parent.data.status ? d.parent.data.status : 'OFFLINE') : (d.data.status ? d.data.status : 'OFFLINE');
                    let childStatus = d.data.status ? d.data.status : 'OFFLINE';
                    if (d.parent) {
                        if (parentStatus === childStatus) {
                            if (childStatus === 'ONLINE') {
                                return '#76ff03';
                            } else {
                                return '#616161'
                            }
                        } else {
                            return '#616161'
                        }
                    } else {
                        if (parentStatus === 'ONLINE') {
                            return '#76ff03';
                        } else {
                            return '#76ff03'
                        }
                    }
                    // '#000' '#00FF00'
                })
                // .style("fill", "blue")
                .attr('cursor', 'pointer');


            // Remove any exiting nodes
            let nodeExit = node.exit().transition()
                .duration(duration)
                .attr("transform", function (d) {
                    return "translate(" + source.y + "," + source.x + ")";
                })
                .remove();

            // On exit reduce the node circles size to 0
            nodeExit.select('circle')
                .attr('r', 1e-6);

            // On exit reduce the opacity of text labels
            nodeExit.select('text')
                .style('fill-opacity', 1e-6);

            // ****************** links section ***************************

            // Update the links...
            let link = svg.selectAll('path.link')
                .data(links, function (d) {
                    return d.id;
                });

            // Enter any new links at the parent's previous position.
            let linkEnter = link.enter().insert('path', "g")
                .attr("class", "link")
                .attr('d', function (d) {
                    let o = {
                        x: source.x0,
                        y: source.y0
                    };
                    return diagonal(o, o)
                });

            // UPDATE
            let linkUpdate = linkEnter.merge(link);

            // Transition back to the parent element position
            linkUpdate.transition()
                .duration(duration)
                .attr('d', function (d) {
                    return diagonal(d, d.parent)
                });

            // Remove any exiting links
            // let linkExit = link.exit().transition()
            link.exit().transition()
                .duration(duration)
                .attr('d', function (d) {
                    let o = {
                        x: source.x,
                        y: source.y
                    };
                    return diagonal(o, o)
                })
                .remove();

            // Store the old positions for transition.
            nodes.forEach(function (d) {
                d.x0 = d.x;
                d.y0 = d.y;
            });

            // Creates a curved (diagonal) path from parent to the child nodes
            function diagonal(s, d) {

                let path = `M ${s.y} ${s.x}
            C ${(s.y + d.y) / 2} ${s.x},
              ${(s.y + d.y) / 2} ${d.x},
              ${d.y} ${d.x}`;

                return path
            }

            // function mousemove(d) {
            //     return d
            //         .text("Info about " + d.name)
            //         .style("left", (d3.event.pageX) + "px")
            //         .style("top", (d3.event.pageY) + "px");
            // }
            //
            // function mouseout(d) {
            //     d.transition()
            //         .duration(300)
            //         .style("opacity", 1e-6);
            // }


            // function zoom() {
            //     let scale = d3.event.scale,
            //         translation = d3.event.translate,
            //         tbound = -height * scale * 100,
            //         bbound = height * scale,
            //         lbound = (-width + margin.right) * scale,
            //         rbound = (width - margin.bottom) * scale;
            //     console.log("pre min/max" + translation);
            //     // limit translation to thresholds
            //     translation = [
            //         Math.max(Math.min(translation[0], rbound),
            //             lbound),
            //         Math.max(Math.min(translation[1], bbound),
            //             tbound)
            //     ];
            //     console.log("scale" + scale);
            //     console.log("translation" + translation);
            //
            //     svg.attr("transform", "translate(" + translation + ")" +
            //         " scale(" + scale + ")");
            // }
        };

        update(root);

        /* Word Wrap */
        function wrap(text, width) {
            text.each(function () {
                let text = d3.select(this),
                    words = text.text().split(/\s+/).reverse(),
                    word,
                    line = [],
                    lineNumber = 1,
                    lineHeight = 1, // ems
                    x = text.attr("x"),
                    y = text.attr("y"),
                    dy = 0, //parseFloat(text.attr("dy")),
                    tspan = text.text(null)
                        .append("tspan")
                        .attr("x", x)
                        .attr("y", y)
                        .attr("dy", dy + "em");
                while ((word = words.pop())) {
                    line.push(word);
                    tspan.text(line.join(" "));
                    if (tspan.node().getComputedTextLength() >
                        width) {
                        line.pop();
                        tspan.text(line.join(" "));
                        line = [word];
                        tspan = text.append("tspan")
                            .attr("x", x)
                            .attr("y", y)
                            .attr("dy", lineNumber *
                                lineHeight + dy + "em")
                            .text(word);
                    }
                }
            });
        }


// Set the dimensions and margins of the diagram

    };

    // todo: possible bugs
    handleDeviceSelectNoBuild(device) {
        this.props.onDeviceSelect([device]);
    }

    // todo: possible bugs
    handleClickNoBuild = (event, sid) => {
        const {devices} = this.state;
        let device = devices.filter(el => el.sid === sid ? el : null)[0];
        this.setState({selectedDeviceIds: [sid], selectedDevices: [device]});
        this.handleDeviceSelectNoBuild(device);
    };

    createPie = (data) => {
        const types = this.props.deviceTypes;
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
            let selectedTypes = this.state.selectedTypes;
            let typeClicked = types.filter(el => el.name === ev.target.dataItem.dataContext.type)[0]._id;
            selectedTypes.has(typeClicked) ? selectedTypes.delete(typeClicked) : selectedTypes.add(typeClicked);
            this.setState({selectedTypes});
            this.chartSelect();
        }, this);

        chart.legend = new am4charts.Legend();
        chart.data = chartdata;
    };

    createPiePhyid = (data) => {
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
            let selectedPhyids = this.state.selectedPhyids;
            let phyidClicked = ev.target.dataItem.dataContext.type;
            selectedPhyids.has(phyidClicked) ? selectedPhyids.delete(phyidClicked) : selectedPhyids.add(phyidClicked);
            this.setState({selectedPhyids});
            this.chartSelect();
        }, this);

        chart.legend = new am4charts.Legend();
        chart.data = chartdata;
    };

    chartSelect() {
        this.renderSelectAllCheckBox(false);
        d3.select('#tree').remove();
        let reduxDevices = store.getState().devicesReducer.devices;
        let {selectedTypes, selectedPhyids} = this.state;
        let filteredDevicesParents = [];
        let filteredDevicesChildren = new Set();
        let filteredDevices = new Set();
        if (!selectedTypes.size && !selectedPhyids.size) {
            return this.setState({devices: reduxDevices});
        }
        if (selectedTypes.size && !selectedPhyids.size) {
            selectedTypes.forEach(typeId => {
                reduxDevices.forEach(device => {
                    if (device.type === typeId) {
                        filteredDevicesParents.push(device);
                    }
                })
            });
            let children = [];
            filteredDevicesParents.forEach(parent => {
                reduxDevices.forEach(device => {
                    if (device.parent_id && device.parent_id.includes(parent.sid)) {
                        children.push(device);
                    }
                })
            });
            filteredDevicesParents = filteredDevicesParents.concat(children);
            this.setState({devices: filteredDevicesParents});
        }
        if (selectedPhyids.size && !selectedTypes.size) {
            selectedPhyids.forEach(phyid => {
                reduxDevices.forEach(device => {
                    if (device.phyid === phyid) {
                        filteredDevicesChildren.add(device);
                    }
                })
            });
            this.setState({devices: [...filteredDevicesChildren]});
        }
        if (selectedTypes.size && selectedPhyids.size) {
            let trueParents = new Set();
            selectedTypes.forEach(typeId => {
                reduxDevices.forEach(device => {
                    if (device.type === typeId) {
                        filteredDevicesParents.push(device);
                    }
                })
            });
            selectedPhyids.forEach(phyid => {
                reduxDevices.forEach(device => {
                    if (device.phyid === 'status') {
                        filteredDevicesChildren.add(device);
                    }
                });
                if (phyid !== 'status') {
                    reduxDevices.forEach(device => {
                        if (device.phyid === phyid) {
                            filteredDevicesChildren.add(device);
                        }
                    })
                }
            });
            let result;
            filteredDevicesParents.forEach(parent => {
                filteredDevicesChildren.forEach(child => {
                    if (child.parent_id.includes(parent.sid)) {
                        trueParents.add(parent);
                        filteredDevices.add(child);
                    }
                })
            });
            result = [...trueParents].concat([...filteredDevices]);
            if (!trueParents.size) {
                this.setState({devices: []})
            } else {
                this.setState({devices: result});
            }
        }
        this.resetSelected();
        this.props.resetSelectedDeviceParent();
    }

    selectAllDevices(){
        const {devices, selectedDevices} = this.state;
        if(devices.length === selectedDevices.length){
            this.renderSelectAllCheckBox(false);
            this.resetSelected();
        } else {
            const selectedDeviceIds = devices.map(devices=>devices.sid);
            this.setState({selectedDevices: devices, selectedDeviceIds});
            this.renderSelectAllCheckBox(true);
            this.handleDeviceSelect(devices);
        }
    }

    renderSelectAllCheckBox(checked){
        const element = <div>
            <Checkbox value={'1'} checked={ checked } onChange={this.selectAllDevices}/>
        </div>;
        const container = document.querySelector('#root > div > main > div > div > div > div > div:nth-child(1) > div' +
            ' > div > div > div > div:nth-child(2) > div > div > table > tbody > tr:nth-child(1) > td:nth-child(2)');
        if(container)
            ReactDOM.render(element, container)
    }

    render() {
        const {loading, devices, selectedDevices, selectedDeviceIds, selectedUserIds, selectedFirm, columns, rowsPerPage, page} = this.state;
        const {deviceTypes} = this.props;
        devices && devices.map((el, i, arr) => arr[i] = Object.assign(el, {
            // status: el.status ? (
            //     <Chip
            //         label={el.status}
            //     />
            // ) : '',
            action: (
                <div>
                    <Checkbox value={el.sid} checked={selectedDeviceIds.includes(el.sid)}/>
                </div>
            )
        }));
        return (
            <div>
                <MuiThemeProvider theme={theme}>
                    <div style={{maxWidth: '100%'}}>
                        <Grid
                            container
                            spacing={40}

                        >
                            <Grid item xs={12} sm={12} md={12} lg={6}>
                                <Paper className={'chart-container'}>
                                    <div className={'chart-toolbar'}>
                                        <h3>
                                            Click to select devices
                                        </h3>
                                    </div>
                                    <div id={'device-types-chart'}>
                                    </div>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} sm={12} md={12} lg={6}>
                                <Paper className={'chart-container'}>
                                    <div className={'chart-toolbar'}>
                                        <h3>
                                            Device phyid types
                                        </h3>
                                    </div>
                                    <div id='pie-phyid'>
                                    </div>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} sm={12} md={12} lg={12}>
                                <div className={'table-container'}>
                                    <MaterialTable
                                        components={{
                                            Toolbar: props => (
                                                <div className={'custom-toolbar'}>
                                                    <FirmDevicesToolBarComponent
                                                        selected={selectedDevices && selectedDevices.length === 1 ? selectedDevices[0] : null}
                                                        resetSelected={this.resetSelected}
                                                        loading={loading}
                                                        addRemoveColumn={this.addRemoveColumn}
                                                        columns={columns}
                                                        selectedFirmId={selectedFirm ? selectedFirm._id : ''}
                                                        selectedUserIds={selectedUserIds}
                                                        deviceTypes={deviceTypes}
                                                    />
                                                </div>
                                            ),
                                        }}
                                        // isLoading={loading}
                                        data={devices}
                                        columns={columns}
                                        title="Devices"
                                        options={{
                                            filtering: true,
                                            columnsButton: false,
                                            header: true,
                                            initialPage: page,
                                            pageSize: rowsPerPage,
                                            search: false,
                                            toolbar: true,
                                            selection: false
                                        }}
                                        parentChildData={(row, rows) => rows.find(a => a.sid === row.parent_id)}
                                        onChangePage={(props, e) => this.onChangePage(props, e)}
                                        onChangeRowsPerPage={(props, e) => this.onChangeRowsPerPage(props, e)}
                                        onRowClick={this.onRowClick}
                                    />
                                </div>
                            </Grid>
                        </Grid>
                    </div>
                </MuiThemeProvider>
                <Paper>
                    <div id='parent'>
                    </div>
                </Paper>
            </div>
        )
    }
}

FirmDevicesComponent.propTypes = {
    selectedFirm: PropTypes.object,
    selectedDevices: PropTypes.array,
    classes: PropTypes.object.isRequired,
    onDeviceSelect: PropTypes.func.isRequired,
    resetSelectedDeviceParent: PropTypes.func,
    handleSetDevices: PropTypes.func,
    parentDevices: PropTypes.array,
    deviceTypes: PropTypes.array,
    selectedUsers: PropTypes.array
};

const FirmDevicesWithProps = connect(mapStateToProps, mapDispatchToProps)(FirmDevicesComponent);

const FirmDevicesStyles = withStyles(styles)(FirmDevicesWithProps);

export default FirmDevicesStyles;
