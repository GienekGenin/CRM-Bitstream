import React from "react";
import ReactDOM from "react-dom";
import * as PropTypes from 'prop-types';
import _ from "lodash";
import * as d3 from "d3";

// Material
import {withStyles} from '@material-ui/core/styles';
import Checkbox from "@material-ui/core/Checkbox";
import {styles} from '../UI/material/table-styles';
import {Grid, MuiThemeProvider} from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import MaterialTable from 'material-table';
import {theme} from "../material.theme";

// Redux
import store from "../../redux/store";
import {connect} from "react-redux";
import {userDevicesRequest} from "../../redux/actions";
import {tokenService} from "../../redux/services/token";

// Components
import './firmDevices.scss';
import FirmDevicesToolBarComponent from "./FirmDevicesToolBarComponent";

// Services
import {forcedTree, createPie, createPiePhyid} from "./chart.service";

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
        this.selectAllDevices = this.selectAllDevices.bind(this);
        this.forcedTree = forcedTree.bind(this);
        this.createPie = createPie.bind(this);
        this.createPiePhyid = createPiePhyid.bind(this);
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
                this.createPie(parentDevices, this);
                this.createPiePhyid(parentDevices, this);
                let checked = false;
                if (selectedDevices && selectedDevices.length === parentDevices.length) {
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
                this.createPie(parentDevices, this);
                this.createPiePhyid(parentDevices, this);
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
                this.createPie(devices, this);
                this.createPiePhyid(devices, this);
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
        [...selectedDeviceIdsSet].forEach(sid => {
            devices.forEach(device => {
                if (device.sid === sid) {
                    selectedDevices.push(device);
                }
            })
        });
        let checked = false;
        if (selectedDevices.length === devices.length) checked = true;
        this.setState({selectedDevices, selectedDeviceIds: [...selectedDeviceIdsSet]});
        this.handleDeviceSelect(selectedDevices);
        this.renderSelectAllCheckBox(checked);
    };

    addRemoveColumn = (columns) => {
        this.setState({columns});
    };

    handleDeviceSelect(devices) {
        if (devices.length === 1)
            this.forcedTree(Object.assign({}, devices[0], {parent_id: '0'}), this.state.devices);
        this.props.onDeviceSelect(devices);
    }

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

    selectAllDevices() {
        const {devices, selectedDevices} = this.state;
        if (devices.length === selectedDevices.length) {
            this.renderSelectAllCheckBox(false);
            this.resetSelected();
        } else {
            const selectedDeviceIds = devices.map(devices => devices.sid);
            this.setState({selectedDevices: devices, selectedDeviceIds});
            this.renderSelectAllCheckBox(true);
            this.handleDeviceSelect(devices);
        }
    }

    renderSelectAllCheckBox(checked) {
        const element = <div>
            <Checkbox value={'1'} checked={checked} onChange={this.selectAllDevices}/>
        </div>;
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
    selectedUsers: PropTypes.array
};

const FirmDevicesWithProps = connect(mapStateToProps, mapDispatchToProps)(FirmDevicesComponent);

const FirmDevicesStyles = withStyles(styles)(FirmDevicesWithProps);

export default FirmDevicesStyles;
