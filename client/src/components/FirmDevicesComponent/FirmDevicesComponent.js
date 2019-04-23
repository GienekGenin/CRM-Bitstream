import React from "react";
import * as PropTypes from 'prop-types';
import _ from "lodash";

// Material
import {withStyles} from '@material-ui/core/styles';
import Checkbox from "@material-ui/core/Checkbox";
import {styles} from '../material/table-styles';
import {Grid, MuiThemeProvider} from '@material-ui/core';
import {createMuiTheme} from '@material-ui/core/styles';

// Redux
import store from "../../redux/store";
import {connect} from "react-redux";
import {firmDevicesRequest} from "../../redux/actions";
import {tokenService} from "../../redux/services/token";

// Components
import FirmDevicesToolBarComponent from "./FirmDevicesToolBarComponent";
import MaterialTable from '../material/MaterialTable/material-table';
import './firmDevices.scss';

// Services
import {buildChart} from "./charts.service";

const mapDispatchToProps = (dispatch) => {
    return {
        firmDevicesRequest: (payload) => dispatch(firmDevicesRequest(payload)),
    };
};

const mapStateToProps = state => {
    return {devices: state.devicesReducer.devices};
};

const theme = createMuiTheme({
    palette: {
        type: 'light'
    }
});

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
                {title: 'phyid', field: 'phyid', hidden: false,},
                {title: 'sn', field: 'sn', hidden: false,},
                {title: 'soft', field: 'soft', hidden: false,},
                {title: 'status', field: 'status', hidden: false,},
                {title: 'description', field: 'description', hidden: false,},
            ]
        };

        this.resetSelected = this.resetSelected.bind(this);
        this.addRemoveColumn = this.addRemoveColumn.bind(this);
    }


    componentDidMount() {
        this._isMounted = true;
        this.setState({loading: true});
        if (this.props.selectedFirm) {
            this.setState({selectedFirm: this.props.selectedFirm});
            if (!this.props.parentDevices) {
                this.props.firmDevicesRequest(this.props.selectedFirm._id);
            } else this.setState({devices: this.props.parentDevices, loading: false});
        } else {
            let selectedFirm = tokenService.verifyToken().firm;
            this.setState({selectedFirm});
            if (!this.props.parentDevices) {
                this.props.firmDevicesRequest(selectedFirm._id);
            } else this.setState({devices: this.props.parentDevices, loading: false});
        }

        let device = null;
        if(this.props.selectedDevice){
            device = this.props.selectedDevice;
            buildChart(Object.assign({},this.props.selectedDevice,{parent_id: '0'}), this.props.parentDevices);
            this.setState({device});
        }

        this.unsubscribe = store.subscribe(() => {
            this.setState({loading: store.getState().devicesReducer.loading});
            if (store.getState().devicesReducer.devices) {
                const devices = store.getState().devicesReducer.devices;
                this.setState({devices});
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
        this.setState({selected: [], device: null});
    };

    onChangePage = (page) => {
        this.setState({page});
    };

    onChangeRowsPerPage = (rowsPerPage) => {
        this.setState({rowsPerPage});
    };

    onRowClick = (e) => {
        let selectedDevice = _.omit(this.state.devices.filter(el => (el._id === e.target.value) ? el : null)[0], 'action');
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
        buildChart(Object.assign({}, device, {parent_id: '0'}), this.state.devices);
        this.props.onDeviceSelect(device);
    }


    render() {
        const {loading, devices, selectedDevice, selectedDeviceId, selectedFirm, columns, rowsPerPage, page} = this.state;
        devices && devices.map((el, i, arr) => arr[i] = Object.assign(el, {
            action: (
                <div>
                    <Checkbox value={el._id} checked={selectedDeviceId === el._id}  onChange={this.onRowClick}/>
                </div>
            )
        }));
        return (
            <div>
                <MuiThemeProvider theme={theme}>
                    <div style={{maxWidth: '100%'}}>
                        <Grid container>
                            <Grid item xs={12}>
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
                                    parentChildData={(row,rows)=> rows.find(a=>a.sid === row.parent_id)}
                                    onChangePage={(props, e) => this.onChangePage(props, e)}
                                    onChangeRowsPerPage={(props, e) => this.onChangeRowsPerPage(props, e)}
                                />
                            </Grid>
                        </Grid>
                    </div>
                </MuiThemeProvider>
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
