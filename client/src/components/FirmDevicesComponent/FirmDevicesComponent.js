import React from "react";
import * as PropTypes from 'prop-types';

import classNames from 'classnames';
import {lighten} from '@material-ui/core/styles/colorManipulator';
import {withStyles} from '@material-ui/core/styles';
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import Tooltip from "@material-ui/core/Tooltip";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from '@material-ui/icons/Delete';
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import FilterListIcon from '@material-ui/icons/FilterList';

import {createData, desc, stableSort, getSorting, rows} from "./firm_devices.service";
import Table from "@material-ui/core/Table";
import Paper from "@material-ui/core/Paper";
import TableBody from "@material-ui/core/TableBody";
import TablePagination from "@material-ui/core/TablePagination";

import store from "../../redux/store";
import {connect} from "react-redux";
import {firmDevicesRequest} from "../../redux/actions";

import Checkbox from "@material-ui/core/Checkbox";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import TextField from "@material-ui/core/TextField";
import LinearProgress from "@material-ui/core/LinearProgress";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import {tokenService} from "../../redux/services/token";
import * as _ from "lodash";
import {firmService} from "../../redux/services/firm";
import * as d3 from "d3";

const mapDispatchToProps = (dispatch) => {
    return {
        firmDevicesRequest: (payload) => dispatch(firmDevicesRequest(payload)),
    };
};

const mapStateToProps = state => {
    return {devices: state.devicesReducer.devices};
};

//todo: TESTS

const unflatten = ( array, parent, tree )=>{
    console.log('top')
    tree = typeof tree !== 'undefined' ? tree : [];
    parent = typeof parent !== 'undefined' ? parent : { sid: 0 };

    var children = _.filter( array, function(child){ return child.parent_id == parent.sid; });

    if( !_.isEmpty( children )  ){
        if( parent.sid == 0 ){
            tree = children;
        }else{
            parent['children'] = children
        }
        _.each( children, function( child ){ unflatten( array, child ) } );
    }

    return tree;
};

// ---------------------------------------------------------------------------------------------------




class FirmToolBar extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            editDialog: false,
            addDialog: false,
            confirmDeleteDialog: false,
            newFirm: {
                name: '',
                address: '',
                email: '',
                tel: '',
                nip: ''
            }
        };
    }

    handleClickOpen = (state) => {
        this.setState({[state]: true});
        if(state === 'editDialog'){
            this.setState({newFirm: this.props.selected})
        }
    };

    handleClose = (state) => {
        this.setState({
            [state]: false,
            newFirm: {
                name: '',
                address: '',
                email: '',
                tel: '',
                nip: ''
            }
        });
    };

    handleAddDevice = () => {
        this.props.addFirmRequest(this.state.newFirm);
        this.setState({
            addDialog: false,
            newFirm: {
                name: '',
                address: '',
                email: '',
                tel: '',
                nip: ''
            }
        });
    };

    updateNewFirm(e, param) {
        this.setState({newFirm:Object.assign({}, this.state.newFirm, {[param]: e.target.value})})
    }

    handleDeleteDevice() {
        this.props.deleteFirmRequest(this.props.selected._id);
        this.props.resetSelected();
        this.handleClose('confirmDeleteDialog');
    }

    handleUpdateFirm(){
        this.props.updateFirmRequest(this.state.newFirm);
        this.props.resetSelected();
        this.handleClose('editDialog');
    }

    handleRefresh() {
    }

    render() {
        return (
            <div className="device-controls">
                <div>
                    <Button disabled={!this.props.selected} variant="contained" color="primary"
                            onClick={() => this.handleClickOpen('editDialog')}>
                        editDialog
                    </Button>
                    <Dialog
                        open={this.state.editDialog}
                        onClose={() => this.handleClose('editDialog')}
                        aria-labelledby="key-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                        <DialogTitle id="alert-dialog-title">editDialog</DialogTitle>
                        <DialogContent>
                            <TextField
                                autoFocus
                                margin="dense"
                                id="firm-name"
                                label="Firm name"
                                type="text"
                                required={true}
                                value={this.state.newFirm.name}
                                onChange={(e) => this.updateNewFirm(e,'name')}
                                fullWidth
                            />
                            <TextField
                                autoFocus
                                margin="dense"
                                id="firm-address"
                                label="Firms address"
                                type="text"
                                required={true}
                                value={this.state.newFirm.address}
                                onChange={(e) => this.updateNewFirm(e, 'address')}
                                fullWidth
                            />
                            <TextField
                                autoFocus
                                margin="dense"
                                id="firm-email"
                                label="Firm email"
                                type="text"
                                required={true}
                                value={this.state.newFirm.email}
                                onChange={(e) => this.updateNewFirm(e, 'email')}
                                fullWidth
                            />
                            <TextField
                                autoFocus
                                margin="dense"
                                id="firm-tel"
                                label="Firm contact number"
                                type="text"
                                required={true}
                                value={this.state.newFirm.tel}
                                onChange={(e) => this.updateNewFirm(e, 'tel')}
                                fullWidth
                            />
                            <TextField
                                autoFocus
                                margin="dense"
                                id="firm-nip"
                                label="NIP"
                                type="text"
                                required={true}
                                value={this.state.newFirm.nip}
                                onChange={(e) => this.updateNewFirm(e, 'nip')}
                                fullWidth
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button  variant="outlined" color="primary"
                                     onClick={() => this.handleUpdateFirm()}>
                                Update
                            </Button>
                            <Button onClick={() => this.handleClose('editDialog')} color="primary">
                                Close
                            </Button>
                        </DialogActions>
                    </Dialog>
                </div>
                <div>
                    <Button variant="outlined" color="primary" disabled={this.props.loading}
                            onClick={() => this.handleClickOpen('addDialog')}>
                        Add
                    </Button>
                    <Dialog
                        open={this.state.addDialog}
                        onClose={() => this.handleClose('addDialog')}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                        <DialogTitle id="alert-dialog-title-">Add new device</DialogTitle>
                        <DialogContent>
                            <TextField
                                autoFocus
                                margin="dense"
                                id="firm-name"
                                label="Firm name"
                                type="text"
                                required={true}
                                value={this.state.newFirm.name}
                                onChange={(e) => this.updateNewFirm(e,'name')}
                                fullWidth
                            />
                            <TextField
                                autoFocus
                                margin="dense"
                                id="firm-address"
                                label="Firms address"
                                type="text"
                                required={true}
                                value={this.state.newFirm.address}
                                onChange={(e) => this.updateNewFirm(e, 'address')}
                                fullWidth
                            />
                            <TextField
                                autoFocus
                                margin="dense"
                                id="firm-email"
                                label="Firm email"
                                type="text"
                                required={true}
                                value={this.state.newFirm.email}
                                onChange={(e) => this.updateNewFirm(e, 'email')}
                                fullWidth
                            />
                            <TextField
                                autoFocus
                                margin="dense"
                                id="firm-tel"
                                label="Firm contact number"
                                type="text"
                                required={true}
                                value={this.state.newFirm.tel}
                                onChange={(e) => this.updateNewFirm(e, 'tel')}
                                fullWidth
                            />
                            <TextField
                                autoFocus
                                margin="dense"
                                id="firm-nip"
                                label="NIP"
                                type="text"
                                required={true}
                                value={this.state.newFirm.nip}
                                onChange={(e) => this.updateNewFirm(e, 'nip')}
                                fullWidth
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button  variant="outlined" color="primary"
                                     onClick={() => this.handleAddDevice()}>
                                Add
                            </Button>
                            <Button onClick={() => this.handleClose('addDialog')} color="primary">
                                Close
                            </Button>
                        </DialogActions>
                    </Dialog>
                </div>
                <div>
                    <Button variant="contained" color="primary" disabled={!this.props.selected}
                            onClick={() => this.handleClickOpen('confirmDeleteDialog')}>
                        Delete
                    </Button>
                    <Dialog
                        open={this.state.confirmDeleteDialog}
                        onClose={() => this.handleClose('confirmDeleteDialog')}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                        <DialogTitle id="alert-dialog-title-">Device properties</DialogTitle>
                        <DialogContent>
                            Confirm deletion of {this.props.selected ? this.props.selected._id : ''}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => this.handleClose('confirmDeleteDialog')} color="primary">
                                Close
                            </Button>
                            <Button disabled={!this.props.selected} variant="contained" color="secondary"
                                    onClick={() => this.handleDeleteDevice()}>
                                Confirm
                            </Button>
                        </DialogActions>
                    </Dialog>
                </div>
                <Button variant="contained" disabled={this.props.loading} onClick={() => this.handleRefresh()}>
                    Refresh
                </Button>
            </div>
        )
    }
}

FirmToolBar.propTypes = {selected: PropTypes.object, resetSelected: PropTypes.func, loading: PropTypes.bool};

const FirmToolBarComponent = connect(null, mapDispatchToProps)(FirmToolBar);

class FirmTableHead extends React.Component {
    createSortHandler = property => event => {
        this.props.onRequestSort(event, property);
    };

    render() {
        const {order, orderBy} = this.props;

        return (
            <TableHead>
                <TableRow>
                    <TableCell>
                        Select
                    </TableCell>
                    {rows.map(
                        row => (
                            <TableCell
                                key={row.id}
                                align={row.numeric ? 'right' : 'left'}
                                padding={row.disablePadding ? 'none' : 'default'}
                                sortDirection={orderBy === row.id ? order : false}
                            >
                                <Tooltip
                                    title="Sort"
                                    placement={row.numeric ? 'bottom-end' : 'bottom-start'}
                                    enterDelay={300}
                                >
                                    <TableSortLabel
                                        active={orderBy === row.id}
                                        direction={order}
                                        onClick={this.createSortHandler(row.id)}
                                    >
                                        {row.label}
                                    </TableSortLabel>
                                </Tooltip>
                            </TableCell>
                        ),
                        this,
                    )}
                </TableRow>
            </TableHead>
        );
    }
}

FirmTableHead.propTypes = {
    numSelected: PropTypes.number.isRequired,
    onRequestSort: PropTypes.func.isRequired,
    order: PropTypes.string.isRequired,
    orderBy: PropTypes.string.isRequired,
    rowCount: PropTypes.number.isRequired,
};

const firmTableToolbarStyles = theme => ({
    root: {
        paddingRight: theme.spacing.unit,
    },
    highlight:
        theme.palette.type === 'light'
            ? {
                color: theme.palette.secondary.main,
                backgroundColor: lighten(theme.palette.secondary.light, 0.85),
            }
            : {
                color: theme.palette.text.primary,
                backgroundColor: theme.palette.secondary.dark,
            },
    spacer: {
        flex: '1 1 100%',
    },
    actions: {
        color: theme.palette.text.secondary,
    },
    title: {
        flex: '0 0 auto',
    },
});

let FirmTableToolbar = props => {
    const {numSelected, classes, firm} = props;

    return (
        <Toolbar
            className={classNames(classes.root, {
                [classes.highlight]: numSelected > 0,
            })}
        >
            <div className={classes.title}>
                {numSelected > 0 ? (
                    <Typography color="inherit" variant="subtitle1">
                        {firm.name} selected
                    </Typography>
                ) : (
                    <Typography variant="h6" id="tableTitle">
                        Firms
                    </Typography>
                )}
            </div>
            <div className={classes.spacer}/>
            <div className={classes.actions}>
                {numSelected > 0 ? (
                    <Tooltip title="Delete">
                        <IconButton aria-label="Delete">
                            <DeleteIcon/>
                        </IconButton>
                    </Tooltip>
                ) : (
                    <Tooltip title="Filter list">
                        <IconButton aria-label="Filter list">
                            <FilterListIcon/>
                        </IconButton>
                    </Tooltip>
                )}
            </div>
        </Toolbar>
    );
};

FirmTableToolbar.propTypes = {
    classes: PropTypes.object.isRequired,
    numSelected: PropTypes.number.isRequired,
    firm: PropTypes.object
};

FirmTableToolbar = withStyles(firmTableToolbarStyles)(FirmTableToolbar);

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














class FirmDevicesComponent extends React.Component {

    _isMounted = false;

    buildChart(parent) {
                let Parent = Object.assign({}, parent);
                let devices = [...this.state.devices];
                let arr = [];
                devices.forEach(el=>{
                    if(el.sid.includes(Parent.sid)){
                        if(el.sid === Parent.sid){
                            arr.push(Parent);
                        }else arr.push(el);

                    }
                });
                // todo: not building if arr of 1 element
                if(arr.length === 0 || arr.length === 1) {
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
                    .attr("width", width )
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
                        .on('click', click)
                        // todo: show info
                        .on("mouseover", function (d) {
                            let g = d3.select(this); // The node
                            // The class is used to remove the additional text later
                            let info = g.append('text')
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
                            return d._children ? "lightsteelblue" : "#fff";
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
                        .attr('r', 2)
                        .style("fill", function (d) {
                            //console.log("parentID",d.aspid);
                            return d._children ? "lightsteelblue" : "#fff";
                        })
                        // if(d._parentid !== null){
                        // .style("fill", "blue")
                        // }
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
                    let linkExit = link.exit().transition()
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

                    function mousemove(d) {
                        return d
                            .text("Info about " + d.name + ":" + d.info)
                            .style("left", (d3.event.pageX) + "px")
                            .style("top", (d3.event.pageY) + "px");
                    }

                    function mouseout(d) {
                        d.transition()
                            .duration(300)
                            .style("opacity", 1e-6);
                    }

                    // Toggle children on click.
                    function click(d) {
                        console.log('dataa---', d.data.parentid);
                        if (d.children) {
                            d._children = d.children;
                            d.children = null;
                        } else {
                            d.children = d._children;
                            d._children = null;
                        }
                        update(d);
                    }

                    function zoom() {
                        let scale = d3.event.scale,
                            translation = d3.event.translate,
                            tbound = -height * scale * 100,
                            bbound = height * scale,
                            lbound = (-width + margin.right) * scale,
                            rbound = (width - margin.bottom) * scale;
                        console.log("pre min/max" + translation);
                        // limit translation to thresholds
                        translation = [
                            Math.max(Math.min(translation[0], rbound),
                                lbound),
                            Math.max(Math.min(translation[1], bbound),
                                tbound)
                        ];
                        console.log("scale" + scale);
                        console.log("translation" + translation);

                        svg.attr("transform", "translate(" + translation + ")" +
                            " scale(" + scale + ")");
                    }
                }

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
                        while (word = words.pop()) {
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

    }

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
            loading: false
        };

        this.resetSelected = this.resetSelected.bind(this);
    }

    //todo: new
    componentWillMount() {
        let data = [];
        if (this.props.parentDevices) {
            this.props.parentDevices.map(record => {
                let row = [
                    record._id,
                    record.name,
                ];
                data.push(createData(...row));
                const obj = {
                    order: this.state.order,
                    orderBy: this.state.orderBy,
                    selected: [],
                    data,
                    page: this.state.page,
                    rowsPerPage: this.state.rowsPerPage
                };
                this.setState(obj);
            })
        }
    }


    componentDidMount() {
        this._isMounted = true;
        if (this.props.selectedFirm) {
            this.setState({selectedFirm: this.props.selectedFirm});
            if (!this.props.parentDevices) {
                this.props.firmDevicesRequest(this.props.selectedFirm._id);
            } else this.setState({devices: this.props.parentDevices});
        } else {
            let selectedFirm = tokenService.verifyToken().firm;
            this.setState({selectedFirm});
            if (!this.props.parentDevices) {
                this.props.firmDevicesRequest(selectedFirm._id);
            } else this.setState({devices: this.props.parentDevices});
        }



        // todo: new
        this.unsubscribe = store.subscribe(() => {
            this.setState({loading: store.getState().devicesReducer.loading});
            if (store.getState().devicesReducer.devices) {
                const devices = store.getState().devicesReducer.devices;
                this.setState({devices});
                this.props.handleSetDevices(devices);
                let data = [];
                devices.map(record => {
                    let row = [
                        record._id,
                        record.name,
                    ];
                    data.push(createData(...row));
                    const obj = {
                        order: this.state.order,
                        orderBy: this.state.orderBy,
                        selected: [],
                        data,
                        page: this.state.page,
                        rowsPerPage: this.state.rowsPerPage
                    };
                    this.setState(obj);
                })
            }
        });

    }

    componentWillUnmount() {
        this._isMounted = false;
        this.unsubscribe();
    }


    handleDeviceSelect(device) {
        d3.select('#tree').remove();
        d3.select('#parent').append('div').attr("id", 'tree');

        this.buildChart(Object.assign({},device,{parent_id: '0'}));
        this.props.onDeviceSelect(device);
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

    handleChangePage = (event, page) => {
        this.setState({page});
    };

    handleChangeRowsPerPage = event => {
        this.setState({rowsPerPage: event.target.value});
    };

    isSelected = id => this.state.selected.indexOf(id) !== -1;




    render() {
        const {classes} = this.props;
        const {data, order, orderBy, selected, rowsPerPage, page, device, loading} = this.state;
        const emptyRows = rowsPerPage - Math.min(rowsPerPage, data.length - page * rowsPerPage);
        return (
            <div>
                <Paper className={classes.root}>
                    <FirmTableToolbar numSelected={selected.length} firm={device}/>
                    <FirmToolBarComponent selected={device} loading={loading} resetSelected={() => this.resetSelected()}/>
                    {loading && <LinearProgress color="secondary"/>}
                    <div className={classes.tableWrapper}>
                        <Table className={classes.table} aria-labelledby="tableTitle">
                            <FirmTableHead
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

FirmDevicesComponent.propTypes = {
    selectedFirm: PropTypes.object,
    classes: PropTypes.object.isRequired,
    onDeviceSelect: PropTypes.func.isRequired,
    resetSelectedDeviceParent: PropTypes.func,
    handleSetDevices: PropTypes.func,
    parentDevices: PropTypes.array
};

const FirmDevicesWithProps =  connect(mapStateToProps, mapDispatchToProps)(FirmDevicesComponent);

const FirmDevicesStyles = withStyles(styles)(FirmDevicesWithProps);

export default FirmDevicesStyles;
