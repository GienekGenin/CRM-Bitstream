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
import {firmDevicesRequest} from "../../redux/actions";
import {tokenService} from "../../redux/services/token";

// Components
import FirmDevicesToolBarComponent from './FirmDevicesToolBarComponent'
import FirmDevicesTableHead from './FirmDevicesTableHead'
import FirmDevicesTableToolbar from './FirmDevicesTableToolbar'

// Services
import {buildChart} from "./charts.service";
import {createData, stableSort, getSorting} from "./firm_devices_table.service";

const mapDispatchToProps = (dispatch) => {
    return {
        firmDevicesRequest: (payload) => dispatch(firmDevicesRequest(payload)),
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

class FirmDevicesComponent extends React.Component {

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
            selectedFirm: null,
        };

        this.resetSelected = this.resetSelected.bind(this);
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

        let data = [];
        let selected = [];
        let device = null;
        if(this.props.selectedDevice){
            selected.push(this.props.selectedDevice._id);
            device = this.props.selectedDevice;
            buildChart(Object.assign({},this.props.selectedDevice,{parent_id: '0'}), this.props.parentDevices)
        }
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
                    return true;
                })
            }
        });

    }

    componentWillUnmount() {
        this._isMounted = false;
        this.unsubscribe();
    }


    handleDeviceSelect(device) {
        buildChart(Object.assign({}, device, {parent_id: '0'}), this.state.devices);
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
                    <FirmDevicesTableToolbar numSelected={selected.length} firm={device}/>
                    <FirmDevicesToolBarComponent selected={device} loading={loading}
                                          resetSelected={() => this.resetSelected()}/>
                    {loading && <LinearProgress color="secondary"/>}
                    <div className={classes.tableWrapper}>
                        <Table className={classes.table} aria-labelledby="tableTitle">
                            <FirmDevicesTableHead
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
