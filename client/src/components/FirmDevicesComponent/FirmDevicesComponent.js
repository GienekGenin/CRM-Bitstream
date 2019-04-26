import React from "react";
import * as PropTypes from 'prop-types';
import _ from "lodash";
import * as d3 from "d3";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import {deviceTypesService} from '../../redux/services/device_types';

// Material
import {withStyles} from '@material-ui/core/styles';
import Checkbox from "@material-ui/core/Checkbox";
import {styles} from '../material/table-styles';
import {Grid, MuiThemeProvider} from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
// Redux
import store from "../../redux/store";
import {connect} from "react-redux";
import {firmDevicesRequest} from "../../redux/actions";
import {tokenService} from "../../redux/services/token";

// Components
import FirmDevicesToolBarComponent from "./FirmDevicesToolBarComponent";
import MaterialTable from '../material/MaterialTable/material-table';
import './firmDevices.scss';
import {theme} from "../material.theme";
import {createPiePhyid} from "./chart.service";

const mapDispatchToProps = (dispatch) => {
    return {
        firmDevicesRequest: (payload) => dispatch(firmDevicesRequest(payload)),
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
            selectedFirm: null,
            selectedDevice: null,
            selectedDeviceId: '',
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
                {title: 'phyid', field: 'phyid', hidden: true,},
                {title: 'sn', field: 'sn', hidden: true,},
                {title: 'soft', field: 'soft', hidden: true,},
                {title: 'status', field: 'status', hidden: false,},
                {title: 'description', field: 'description', hidden: true,},
            ],
            selectedTypes: []
        };

        this.resetSelected = this.resetSelected.bind(this);
        this.addRemoveColumn = this.addRemoveColumn.bind(this);
        this.buildChart = this.buildChart.bind(this)
    }


    componentDidMount() {
        this._isMounted = true;
        this.setState({loading: true});
        if (this.props.selectedFirm) {
            this.setState({selectedFirm: this.props.selectedFirm});
            if (!this.props.parentDevices) {
                this.props.firmDevicesRequest(this.props.selectedFirm._id);
            } else {
                this.createPie(this.props.parentDevices);
                createPiePhyid(this.props.parentDevices);
                this.setState({devices: this.props.parentDevices, loading: false});
            }
        } else {
            let selectedFirm = tokenService.verifyToken().firm;
            this.setState({selectedFirm});
            if (!this.props.parentDevices) {
                this.props.firmDevicesRequest(selectedFirm._id);
            } else this.setState({devices: this.props.parentDevices, loading: false});
        }

        let device = null;
        if (this.props.selectedDevice) {
            device = this.props.selectedDevice;
            this.buildChart(Object.assign({}, this.props.selectedDevice, {parent_id: '0'}), this.props.parentDevices);
            this.setState({selectedDevice: device, selectedDeviceId: device._id});
        }

        this.unsubscribe = store.subscribe(() => {
            this.setState({loading: store.getState().devicesReducer.loading});
            if (store.getState().devicesReducer.devices) {
                const devices = store.getState().devicesReducer.devices;
                this.createPie(devices);
                createPiePhyid(devices);
                this.setState({devices, selectedTypes: []});
                this.props.handleSetDevices(devices);

            }
            return true;
        });

    }

    componentWillUnmount() {
        this._isMounted = false;
        this.unsubscribe();
    }

    resetSelected = () => {
        this.setState({selectedDeviceId: null, selectedDevice: null});
    };

    onChangePage = (page) => {
        this.setState({page});
    };

    onChangeRowsPerPage = (rowsPerPage) => {
        this.setState({rowsPerPage});
    };

    onRowClick = (e, rowData) => {
        let selectedDevice = _.omit(this.state.devices.filter(el => (el._id === rowData._id) ? el : null)[0], 'action');
        if (this.state.selectedDevice && this.state.selectedDevice._id === selectedDevice._id) {
            this.setState({selectedDevice: null, selectedDeviceId: ''});
            this.props.onDeviceSelect(null);
        } else {
            this.setState({selectedDevice, selectedDeviceId: selectedDevice._id});
            this.props.onDeviceSelect(selectedDevice);
        }
        this.handleDeviceSelect(selectedDevice);
    };

    addRemoveColumn = (columns) => {
        this.setState({columns});
    };

    handleDeviceSelect(device) {
        this.buildChart(Object.assign({}, device, {parent_id: '0'}), this.state.devices);
        this.props.onDeviceSelect(device);
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
                top: 60,
                right: 90,
                bottom: 30,
                left: 90
            },
            width = 560,
            height = 10;

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
                            this.handleClickNoBuild(null, d.data._id);
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
        this.props.onDeviceSelect(device);
    }

    // todo: possible bugs
    handleClickNoBuild = (event, id) => {
        const {devices} = this.state;
        let device = devices.filter(el => el._id === id ? el : null)[0];
        this.setState({selectedDeviceId: id, selectedDevice: device});
        this.handleDeviceSelectNoBuild(device);
    };

    createPie = (data) => {
        deviceTypesService.getDeviceTypes().then(types => {
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
                if (selectedTypes && selectedTypes.includes(typeClicked)) {
                    selectedTypes = selectedTypes.filter(el => el !== typeClicked);
                } else selectedTypes.push(typeClicked);
                this.setState({selectedTypes});
                this.onTypeSelect();
            }, this);

            chart.legend = new am4charts.Legend();
            chart.data = chartdata;
        });
    };

    onTypeSelect = () => {
        let devices = store.getState().devicesReducer.devices;
        let filteredDevicesParents = [];
        if (!this.state.selectedTypes.length) {
            return this.setState({devices});
        }
        this.state.selectedTypes.forEach(typeId => {
            devices.forEach(device => {
                if (device.type === typeId) {
                    filteredDevicesParents.push(device);
                }
            })
        });
        let children = [];
        filteredDevicesParents.forEach(parent => {
            devices.forEach(device => {
                if (device.parent_id && device.parent_id.includes(parent.sid)) {
                    children.push(device);
                }
            })
        });
        filteredDevicesParents = filteredDevicesParents.concat(children);
        this.setState({devices: filteredDevicesParents});
        this.resetSelected();
        this.props.resetSelectedDeviceParent();
    };

    render() {
        const {loading, devices, selectedDevice, selectedDeviceId, selectedFirm, columns, rowsPerPage, page} = this.state;
        devices && devices.map((el, i, arr) => arr[i] = Object.assign(el, {
            // status: el.status ? (
            //     <Chip
            //         label={el.status}
            //     />
            // ) : '',
            action: (
                <div>
                    <Checkbox value={el._id} checked={selectedDeviceId === el._id}/>
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
                            <Grid item xs={12} sm={12} md={6} lg={6}>
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
                            <Grid item xs={12} sm={12} md={6} lg={6}>
                                <Paper className={'chart-container'}>
                                    <div className={'chart-toolbar'}>
                                        <h3>
                                            Device types
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
                                                        selected={selectedDevice}
                                                        resetSelected={this.resetSelected}
                                                        loading={loading}
                                                        addRemoveColumn={this.addRemoveColumn}
                                                        columns={columns}
                                                        selectedFirmId={selectedFirm ? selectedFirm._id : ''}
                                                    />
                                                </div>
                                            ),
                                        }}
                                        isLoading={loading}
                                        data={devices}
                                        columns={columns}
                                        title="Firm devices"
                                        options={{
                                            filtering: true,
                                            columnsButton: false,
                                            header: true,
                                            initialPage: page,
                                            pageSize: rowsPerPage,
                                            search: false,
                                            toolbar: true
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
    selectedDevice: PropTypes.object,
    classes: PropTypes.object.isRequired,
    onDeviceSelect: PropTypes.func.isRequired,
    resetSelectedDeviceParent: PropTypes.func,
    handleSetDevices: PropTypes.func,
    parentDevices: PropTypes.array
};

const FirmDevicesWithProps = connect(mapStateToProps, mapDispatchToProps)(FirmDevicesComponent);

const FirmDevicesStyles = withStyles(styles)(FirmDevicesWithProps);

export default FirmDevicesStyles;
