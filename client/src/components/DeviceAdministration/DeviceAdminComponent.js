import * as d3 from "d3";
import * as _ from "lodash";
import React from "react";
import * as PropTypes from 'prop-types';

// Material
import {withStyles} from '@material-ui/core/styles';
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import Table from "@material-ui/core/Table";
import Paper from "@material-ui/core/Paper";
import TableBody from "@material-ui/core/TableBody";
import TablePagination from "@material-ui/core/TablePagination";
import Checkbox from "@material-ui/core/Checkbox";
import LinearProgress from "@material-ui/core/LinearProgress";

// Redux
import store from "../../redux/store";
import {connect} from "react-redux";
import {
    userDevicesRequest,
    addDeviceRequest,
    deleteDeviceRequest,
    updateDeviceUsersRequest,
} from "../../redux/actions";
import {tokenService} from "../../redux/services/token";

// Components
import './deviceAdmin.scss';
import DevicesToolBarComponent from './DevicesToolBar';
import DevicesTableHead from './DevicesTableHead'
import DevicesTableToolbar from './DevicesTableToolbar'

// Table service
import {createData, stableSort, getSorting} from "./user_devices_table.service";

const mapDispatchToProps = (dispatch) => {
    return {
        userDevicesRequest: (payload) => dispatch(userDevicesRequest(payload)),
        addDeviceRequest: (payload) => dispatch(addDeviceRequest(payload)),
        deleteDeviceRequest: (payload) => dispatch(deleteDeviceRequest(payload)),
        updateDeviceUsersRequest: (sid, coid) => dispatch(updateDeviceUsersRequest(sid, coid)),
    };
};

const mapStateToProps = state => {
    return {devices: state.devicesReducer.devices};
};

const styles = theme => ({
    root: {
        width: '100%',
        marginTop: theme.spacing.unit * 3,
    },
    table: {
        minWidth: 1020,
    },
    tableWrapper: {
        overflowX: 'auto',
        position: 'relative',
        top: 0,
        left: 0
    },
});

class UserDevicesComponent extends React.Component {

    _isMounted = false;


    constructor(props) {
        super(props);

        this.state = {
            order: 'asc',
            orderBy: 'id',
            selected: [],
            data: [],
            page: 0,
            rowsPerPage: 5,
            device: null,
            loading: false,
            selectedUser: null,
        };

        this.resetSelected = this.resetSelected.bind(this);
        this.buildChart = this.buildChart.bind(this)
    }


    componentDidMount() {
        this._isMounted = true;
        if (this.props.selectedUser) {
            this.setState({selectedUser: this.props.selectedUser});
            if (!this.props.parentUserDevices) {
                this.props.userDevicesRequest(this.props.selectedUser._id);
            } else this.setState({devices: this.props.parentUserDevices});
        } else {
            let selectedUser = tokenService.verifyToken().user;
            this.setState({selectedUser});
            if (!this.props.parentUserDevices) {
                this.props.userDevicesRequest(selectedUser._id);
            } else this.setState({devices: this.props.parentUserDevices});
        }

        let data = [];
        let selected = [];
        let device = null;
        if (this.props.selectedUserDevice) {
            selected.push(this.props.selectedUserDevice._id);
            device = this.props.selectedUserDevice;
            this.buildChart(Object.assign({}, this.props.selectedUserDevice, {parent_id: '0'}), this.props.parentUserDevices)
        }
        if (this.props.parentUserDevices) {
            this.props.parentUserDevices.map(record => {
                let row = [
                    record._id,
                    record.name,
                ];
                data.push(createData(...row));
                const obj = {
                    order: this.state.order,
                    orderBy: this.state.orderBy,
                    selected,
                    device,
                    data,
                    page: this.state.page,
                    rowsPerPage: this.state.rowsPerPage
                };
                this.setState(obj);
                return true;
            })
        }

        // todo: new
        this.unsubscribe = store.subscribe(() => {
            this.setState({loading: store.getState().devicesReducer.loading});
            if (!store.getState().devicesReducer.loading) {
                const devices = store.getState().devicesReducer.userDevices;
                this.setState({devices});
                this.props.handleSetUserDevices(devices);
                d3.select('#tree').remove();
                let data = [];
                if (devices.length > 0) {
                    devices.map(record => {
                        let row = [
                            record._id,
                            record.name,
                        ];
                        if (devices.length > 0) {
                            data.push(createData(...row));
                        }
                        const obj = {
                            order: this.state.order,
                            orderBy: this.state.orderBy,
                            selected: [],
                            data,
                            page: this.state.page,
                            rowsPerPage: this.state.rowsPerPage
                        };
                        this.setState(obj);
                        return true;
                    })
                }
            } else {
                const obj = {
                    order: this.state.order,
                    orderBy: this.state.orderBy,
                    selected: [],
                    data,
                    page: this.state.page,
                    rowsPerPage: this.state.rowsPerPage
                };
                this.setState(obj);
                return true;
            }
        });

    }

    componentWillUnmount() {
        this._isMounted = false;
        this.unsubscribe();
    }


    handleDeviceSelect(device) {
        this.buildChart(Object.assign({}, device, {parent_id: '0'}), this.state.devices);
        this.props.onUserDeviceSelect(device);
    }

    handleDeviceSelectNoBuild(device) {
        this.props.onUserDeviceSelect(device);
    }

    handleRequestSort = (event, property) => {
        const orderBy = property;
        let order = 'desc';

        if (this.state.orderBy === property && this.state.order === 'desc') {
            order = 'asc';
        }

        this.setState({order, orderBy});
    };

    resetSelected = () => {
        this.setState({selected: [], device: null});
    };

    handleClick = (event, id) => {
        const {selected} = this.state;
        const selectedIndex = selected.indexOf(id);
        let newSelected = [];
        let device = null;
        if (selectedIndex === -1) {
            newSelected.push(id);
            device = this.state.devices.filter(el => el._id === id ? el : null)[0];
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        }
        this.setState({selected: newSelected, device});
        this.handleDeviceSelect(device);
    };

    handleClickNoBuild = (event, id) => {
        const {selected} = this.state;
        const selectedIndex = selected.indexOf(id);
        let newSelected = [];
        let device = null;
        if (selectedIndex === -1) {
            newSelected.push(id);
            device = this.state.devices.filter(el => el._id === id ? el : null)[0];
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        }
        this.setState({selected: newSelected, device});
        this.handleDeviceSelectNoBuild(device);
    };

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
                top: 300,
                right: 90,
                bottom: 30,
                left: 90
            },
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

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

        update(root);

// Collapse the node and all it's children
        function collapse(d) {
            if (d.children) {
                d._children = d.children;
                d._children.forEach(collapse);
                d.children = null;
            }
        }

        function update(source) {

            // Assigns the x and y position for the nodes
            let treeData = treemap(root);

            // Compute the new tree layout.
            let nodes = treeData.descendants(),
                links = treeData.descendants().slice(1);

            // Normalize for fixed-depth.
            nodes.forEach(function (d) {
                d.y = d.depth * 100
            });

            // ****************** Nodes section ***************************

            // Update the nodes...
            let node = svg.selectAll('g.node')
                .data(nodes, function (d) {
                    return d.id || (d.id = ++i);
                });

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
                .call(wrap, 30);

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
                                return '#00FF00';
                            } else {
                                return '#000'
                            }
                        } else {
                            return '#000'
                        }
                    } else {
                        if (parentStatus === 'ONLINE') {
                            return '#00FF00';
                        } else {
                            return '#000'
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

            // Toggle children on click.
            function click(d) {
                console.log('dataa---', d.data._id);
                if (d.children) {
                    d._children = d.children;
                    d.children = null;
                } else {
                    d.children = d._children;
                    d._children = null;
                }
                update(d);
            }

            function dbClick(d) {
                d3.select('#selected').attr("id", '');
                d3.select('#selected-circle').attr("id", '');
                nodeUpdate.select('circle.node')
                    .attr('id', function (data) {
                        if (d.data.name === data.data.name) {
                            selectFromChart(d.data._id)
                            return 'selected'
                        }
                    })
            }


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
        }

        function selectFromChart(id) {
            this.handleClickNoBuild(null, id);
        }

        selectFromChart = selectFromChart.bind(this);

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

    handleChangePage = (event, page) => {
        this.setState({page});
    };

    handleChangeRowsPerPage = event => {
        this.setState({rowsPerPage: event.target.value});
    };

    isSelected = id => this.state.selected.indexOf(id) !== -1;


    render() {
        const {classes, selectedUser, parentUsers} = this.props;
        const {data, order, orderBy, selected, rowsPerPage, page, device, loading} = this.state;
        const emptyRows = rowsPerPage - Math.min(rowsPerPage, data.length - page * rowsPerPage);
        return (
            <div>
                <Paper className={classes.root}>
                    <DevicesTableToolbar numSelected={selected.length} firm={device}/>
                    <DevicesToolBarComponent selected={device} selectedUserId={selectedUser._id} loading={loading}
                                                 resetSelected={() => this.resetSelected()} parentUsers={parentUsers}/>
                    {loading && <LinearProgress color="secondary"/>}
                    <div className={classes.tableWrapper}>
                        <Table className={classes.table} aria-labelledby="tableTitle">
                            <DevicesTableHead
                                numSelected={selected.length}
                                order={order}
                                orderBy={orderBy}
                                onRequestSort={this.handleRequestSort}
                                rowCount={data.length}
                            />
                            <TableBody>
                                {stableSort(data, getSorting(order, orderBy))
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map(n => {
                                        const isSelected = this.isSelected(n._id);
                                        return (
                                            <TableRow
                                                hover
                                                onClick={event => this.handleClick(event, n._id)}
                                                role="checkbox"
                                                aria-checked={isSelected}
                                                tabIndex={-1}
                                                key={n._id}
                                                selected={isSelected}
                                            >
                                                <TableCell padding="checkbox">
                                                    <Checkbox checked={isSelected}/>
                                                </TableCell>
                                                <TableCell align="right" key={n._id}>{n._id}</TableCell>
                                                <TableCell align="right" key={n.name}>{n.name}</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                {emptyRows > 0 && (
                                    <TableRow style={{height: 49 * emptyRows}}>
                                        <TableCell colSpan={6}/>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={data.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        backIconButtonProps={{
                            'aria-label': 'Previous Page',
                        }}
                        nextIconButtonProps={{
                            'aria-label': 'Next Page',
                        }}
                        onChangePage={this.handleChangePage}
                        onChangeRowsPerPage={this.handleChangeRowsPerPage}
                    />
                </Paper>
                <div id='parent'>

                </div>
            </div>
        )
    }
}

UserDevicesComponent.propTypes = {
    selectedUser: PropTypes.object,
    selectedUserDevice: PropTypes.object,
    classes: PropTypes.object.isRequired,
    onUserDeviceSelect: PropTypes.func.isRequired,
    resetSelectedUserDeviceParent: PropTypes.func,
    handleSetUserDevices: PropTypes.func,
    parentUserDevices: PropTypes.array,
    parentUsers: PropTypes.array,
};

const UserDevicesWithProps = connect(mapStateToProps, mapDispatchToProps)(UserDevicesComponent);

const UserDevicesStyles = withStyles(styles)(UserDevicesWithProps);

export default UserDevicesStyles;
