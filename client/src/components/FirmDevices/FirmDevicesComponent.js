import React from "react";
import ReactDOM from "react-dom";
import * as PropTypes from 'prop-types';
import _ from "lodash";

// Material
import {withStyles} from '@material-ui/core/styles';
import Checkbox from "@material-ui/core/Checkbox";
import AddBoxIcon from '@material-ui/icons/AddBox';
import {styles} from '../UI/material/table-styles';
import {Grid, MuiThemeProvider} from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import MaterialTable from 'material-table';
import {theme} from "../material.theme";
import CircularProgress from '@material-ui/core/CircularProgress';
import IconButton from "@material-ui/core/IconButton";

// Redux
import store from "../../redux/store";
import {connect} from "react-redux";
import {userDevicesRequest} from "../../redux/actions";
import {tokenService} from "../../redux/services/token";

// Components
import './FirmDevices.scss';
import FirmDevicesToolBar from "./FirmDevicesToolBar";
import classes from 'classnames';
// Services
import {forcedTree, createPie, piePlaceHolder} from "./chart.service";

const mapDispatchToProps = (dispatch) => {
    return {
        userDevicesRequest: (payload) => dispatch(userDevicesRequest(payload)),
    };
};

const mapStateToProps = state => {
    return {devices: state.devicesReducer.devices};
};

class FirmDevicesComponent extends React.Component {

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
                {title: 'Select', field: 'action', filtering: false, sorting: false, hidden: false,},
                {title: 'Name', field: 'name', hidden: false,},
                {title: 'phyid', field: 'phyid', sorting: false, hidden: false,},
                {title: 'sn', field: 'sn', hidden: true,},
                {title: 'soft', field: 'soft', hidden: true,},
                {title: 'status', field: 'status', hidden: false,},
                {title: 'azure', field: 'azure', hidden: false,},
                {title: 'group', field: 'groupid', sorting: false, hidden: false,},
                {title: 'auto_desc', field: 'auto_desc', hidden: false,},
                {title: 'user_desc', field: 'user_desc', hidden: false,},
                {title: 'time', field: 'time', hidden: false,},
                {title: 'value', field: 'value', hidden: false,},
                {title: 'sid', field: 'sid', hidden: false,},
            ],
            selectedTypes: new Set(),
            selectedPhyids: new Set(),
            selectedGroups: new Set()
        };

        this.resetSelected = this.resetSelected.bind(this);
        this.addRemoveColumn = this.addRemoveColumn.bind(this);
        this.selectAllDevices = this.selectAllDevices.bind(this);
        this.forcedTree = forcedTree.bind(this);
        this.createPie = createPie.bind(this);
    }

    componentDidMount() {
        this.renderSelectAllCheckBox(false);
        this.setState({loading: true});
        const {selectedFirm, selectedUsers, parentDevices, selectedDevices} = this.props;
        if (selectedUsers) {
            const selectedUserIds = selectedUsers.map(user => user._id);
            this.setState({selectedFirm, selectedUsers, selectedUserIds});
            if (!parentDevices) {
                this.setState({selectedUserIds});
                this.props.userDevicesRequest(selectedUserIds);
            } else {
                this.createPie(parentDevices, this);
                let checked = false;
                if (selectedDevices && selectedDevices.length === parentDevices.length) {
                    checked = true;
                    this.renderSelectAllCheckBox(checked);
                } else {
                    this.renderSelectAllCheckBox(checked);
                }
                this.setState({devices: parentDevices, selectedDevices, checked, loading: false});

            }
        } else {
            let selectedUser = tokenService.verifyToken().user;
            this.setState({selectedUsers: [selectedUser]});
            const {parentDevices} = this.props;
            if (!parentDevices) {
                this.props.userDevicesRequest([selectedUser._id]);
            } else {
                this.createPie(parentDevices, this);
                this.setState({devices: parentDevices, loading: false});
            }
        }
        if (selectedDevices) {
            if (selectedDevices.length === 1) {
                this.forcedTree(Object.assign({}, selectedDevices[0], {parent_id: '0'}), parentDevices);
            }
            const selectedDeviceIds = selectedDevices.map(device => device.sid);
            this.setState({selectedDevices, selectedDeviceIds});
        }

        this.unsubscribe = store.subscribe(() => {
            this.setState({loading: store.getState().devicesReducer.loading});
            if (store.getState().devicesReducer.devices) {
                const devices = store.getState().devicesReducer.devices;
                if (devices.length) {
                    this.createPie(devices, this);
                } else {
                    piePlaceHolder('device-types-chart', 'No devices available');
                    piePlaceHolder("pie-group", "No groups available");
                    piePlaceHolder("pie-phyid", "No types available");
                }
                this.setState({
                    devices,
                    selectedTypes: new Set(),
                    selectedPhyids: new Set(),
                    selectedGroups: new Set()
                });
                this.props.handleSetDevices(devices);
            }
            return true;
        });
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    resetSelected = () => {
        this.setState({selectedDeviceIds: [], selectedDevices: []});
        this.props.onDeviceSelect([]);
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
        [...selectedDeviceIdsSet].forEach(sid => {
            devices.forEach(device => {
                if (device.sid === sid) {
                    selectedDevices.push(device);
                }
            })
        });
        let checked = false;
        if (selectedDevices.length === devices.length) {
            checked = true;
            this.renderSelectAllCheckBox(checked);
        } else {
            this.renderSelectAllCheckBox(checked)
        }
        this.setState({selectedDevices, selectedDeviceIds: [...selectedDeviceIdsSet]});
        this.handleDeviceSelect(selectedDevices);
    };

    addRemoveColumn = (columns) => {
        this.setState({columns});
    };

    handleDeviceSelect(devices) {
        if (devices.length === 1)
            this.forcedTree(Object.assign({}, devices[0], {parent_id: '0'}), this.state.devices);
        this.props.onDeviceSelect(devices);
    }

    selectAllDevices() {
        const {devices, selectedDevices} = this.state;
        if (devices.length === selectedDevices.length) {
            this.renderSelectAllCheckBox(false);
            this.resetSelected();
        } else {
            const selectedDeviceIds = devices.map(device => device.sid);
            this.setState({selectedDevices: devices, selectedDeviceIds});
            this.renderSelectAllCheckBox(true);
            this.handleDeviceSelect(devices);
        }
    }

    renderSelectAllCheckBox(checked) {
        let element = <div>
            <Checkbox value={'1'} checked={checked} onChange={this.selectAllDevices}/>
        </div>;
        if(!checked){
            element = <IconButton onClick={this.selectAllDevices}>
                <AddBoxIcon />
            </IconButton>
        }
        const container = document.querySelector('#root > div > main > div > div > div > div > div:nth-child(1) > div' +
            ' > div > div > div > div:nth-child(2) > div > div > table > tbody > tr:nth-child(1) > td:nth-child(2)');
        if (container)
            ReactDOM.render(element, container)
    }

    render() {
        const {loading, devices, selectedDevices, selectedDeviceIds, selectedUserIds, selectedFirm, columns, rowsPerPage, page} = this.state;
        const {deviceTypes} = this.props;
        devices && devices.map((el, i, arr) => arr[i] = Object.assign(el, {
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
														spacing={5}														
                        >
                            <Grid item xs={12} sm={12} md={12} lg={4} >
                                <Paper className={'chart-container'}>
                                    <div className={'chart-toolbar'}>
                                        <h3>
                                            Device types
                                        </h3>
                                    </div>
                                    <div id={'device-types-chart'} style={{position: 'relative'}}>
                                        {loading && <CircularProgress
                                            style={{
                                                width: '250px',
                                                height: '250px',
                                                color: '#2196f3',
                                                position: "absolute",
                                                top: '20%',
                                                left: "18%"
                                            }}
                                            className={classes.progress}
                                        />}
                                    </div>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} sm={12} md={12} lg={4}>
                                <Paper className={'chart-container'}>
                                    <div className={'chart-toolbar'}>
                                        <h3>
                                            Phyid groups
                                        </h3>
                                    </div>
                                    <div id='pie-group' style={{position: 'relative'}}>
                                        {loading && <CircularProgress
                                            style={{
                                                width: '250px',
                                                height: '250px',
                                                color: '#2196f3',
                                                position: "absolute",
                                                top: '20%',
                                                left: "18%"
                                            }}
                                            className={classes.progress}
                                        />}
                                    </div>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} sm={12} md={12} lg={4}>
                                <Paper
                                    className={'chart-container'}
                                >
                                    <div className={'chart-toolbar'}>
                                        <h3>
                                            Phyid types
                                        </h3>
                                    </div>
                                    <div id='pie-phyid' style={{position: 'relative'}}>
                                        {loading && <CircularProgress
                                            style={{
                                                width: '250px',
                                                height: '250px',
                                                color: '#2196f3',
                                                position: "absolute",
                                                top: '20%',
                                                left: "18%"
                                            }}
                                            className={classes.progress}
                                        />}
                                    </div>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} sm={12} md={12} lg={12}>
                                <div className={'table-container'}>
                                    <MaterialTable
                                        components={{
                                            Toolbar: props => (
                                                <div className={'custom-toolbar'}>
                                                    <FirmDevicesToolBar
                                                        selected={selectedDevices && selectedDevices.length === 1 ? selectedDevices[0] : null}
                                                        selectedDevices={selectedDevices}
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
    selectedUsers: PropTypes.array,
};

const FirmDevicesWithProps = connect(mapStateToProps, mapDispatchToProps)(FirmDevicesComponent);

const FirmDevicesStyles = withStyles(styles)(FirmDevicesWithProps);

export default FirmDevicesStyles;
