import React from "react";
import * as PropTypes from 'prop-types';
import * as dotenv from 'dotenv';
import DateFnsUtils from "@date-io/date-fns";
import _ from "lodash";
import * as d3 from "d3";

//Material
import {theme} from "../material.theme";
import Paper from "@material-ui/core/Paper";
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from "@material-ui/core/IconButton";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import Menu from "@material-ui/core/Menu";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import Checkbox from "@material-ui/core/Checkbox";
import ListItemText from "@material-ui/core/ListItemText";
import ViewColumnIcon from '@material-ui/icons/ViewColumn';
import TimelineIcon from '@material-ui/icons/Timeline';
import {Grid, MuiThemeProvider} from '@material-ui/core';
import MaterialTable from 'material-table';
import {DatePicker, MuiPickersUtilsProvider} from "material-ui-pickers";

// Redux
import {connect} from "react-redux";

import store from "../../redux/store";
import {getMinMaxTimeRequest, getDataRequest} from "../../redux/actions";
import {dataService} from "../../redux/services/data";

// Components
import './visualisation.scss';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapGL, {Marker} from 'react-map-gl';
import Pin from '../UI/map/pin/PinComponent';

//Services
import {createLineChart, createDragPhyidPie} from "./chart.service";
/* eslint-disable import/first */
dotenv.config({path: '../../../.env.local'});

const mapDispatchToProps = (dispatch) => {
    return {
        getMinMaxTimeRequest: (sids) => dispatch(getMinMaxTimeRequest(sids)),
        getDataRequest: (minSelectedDate, maxSelectedDate, sids) => dispatch(getDataRequest(minSelectedDate, maxSelectedDate, sids))
    };
};

const mapStateToProps = state => {
    return {devices: state.devicesReducer.devices};
};

class Visualisation extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            page: 0,
            rowsPerPage: 5,
            loading: false,
            checked: false,
            selectedPhyids: new Set(),
            selectedDevices: [],
            selectedDeviceIds: [],
            devicesToVis: [],
            linearData: [],
            locationData: [],
            // table
            columns: [
                {title: 'Name', field: 'name', hidden: false,},
                {title: 'phyid', field: 'phyid', hidden: false,},
                {title: 'sn', field: 'sn', hidden: true,},
                {title: 'soft', field: 'soft', hidden: true,},
                {title: 'status', field: 'status', hidden: true,},
                {title: 'description', field: 'description', hidden: true},
            ],

            anchorEl: null,
            columnsDialog: false,
            timeDialog: false,
            minTime: '',
            maxTime: '',
            minSelectedDate: '',
            maxSelectedDate: '',

            viewport: {
                width: '100%',
                height: 700,
                latitude: 51.919438,
                longitude: 19.145136,
                zoom: 6,
                mapboxApiAccessToken: process.env.REACT_APP_MAP_BOX_TOKEN_PUBLIC
            }
        };

        this.createDragPhyidPie = createDragPhyidPie.bind(this);
        this.resetSelected = this.resetSelected.bind(this);
    }

    handleClickMenu = event => {
        this.setState({anchorEl: event.currentTarget, columnsDialog: true});
    };

    handleCloseMenu = () => {
        const columns = this.state.columns;
        this.addRemoveColumn(columns);
        this.setState({anchorEl: null, columnsDialog: false, columns});
    };

    handleColumnsChange = (title) => {
        let columns = this.state.columns.map((el, i, arr) => el.title === title ? arr[i] = Object.assign(el, {hidden: !el.hidden}) : el);
        this.addRemoveColumn(columns);
    };

    handleClickOpen = (state) => {
        this.setState({[state]: true});
        this.props.getMinMaxTimeRequest(this.state.selectedDeviceIds);
    };

    handleClose = (state) => {
        this.setState({
            [state]: false
        });
    };

    handleConfigTime() {
        const {minSelectedDate, maxSelectedDate, selectedDeviceIds} = this.state;
        this.props.getDataRequest(minSelectedDate, maxSelectedDate, selectedDeviceIds);
        this.handleClose('timeDialog');
    }

    handleTimeChange(state, time) {
        this.setState({[state]: time});
    }

    componentDidMount() {
        let {selectedDevices} = this.props;
        selectedDevices = selectedDevices.map(el => _.omit(el, ['action', 'tableData']));
        const sids = selectedDevices.map(el => el.sid);
        dataService.getDevicesWithData({sids}).then(d => {
            let sids = d.map(el => el._id.sid);
            const devicesWithData = selectedDevices.filter(el => sids.includes(el.sid));
            this.createDragPhyidPie(devicesWithData, this);
        }).catch(e => console.log(e));

        this.unsubscribe = store.subscribe(() => {

            const {linearData, locationData} = this.state;
            this.setState({loading: true});
            if (store.getState().dataReducer.data.length) {
                const reduxData = store.getState().dataReducer.data;
                const reduxLinearData = [];
                const reduxLocationData = [];
                reduxData.forEach(el => {
                    if (Array.isArray(el.data[0].value)) {
                        reduxLocationData.push(el)
                    } else {
                        reduxLinearData.push(el);
                    }
                });
                if(linearData[0] && reduxLinearData.length){
                    if(reduxLinearData[0].data.length !== linearData[0].data.length){
                        d3.select('#lineChart').remove();
                        d3.select('#parent-line-chart').append('div').attr("id", 'lineChart');
                        createLineChart(reduxLinearData, selectedDevices);
                        this.setState({linearData: reduxLinearData})
                    }
                } else {
                    d3.select('#lineChart').remove();
                    d3.select('#parent-line-chart').append('div').attr("id", 'lineChart');
                    createLineChart(reduxLinearData, selectedDevices);
                    this.setState({linearData: reduxLinearData})
                }
                if (reduxLocationData.length) {
                    this.setState({locationData: reduxLocationData})
                }
            }
            if (store.getState().dataReducer.time) {
                const time = store.getState().dataReducer.time;
                this.setState({
                    minSelectedDate: time.minSelectedDate,
                    maxSelectedDate: time.maxSelectedDate,
                    loading: false
                })
            }
            return true;
        });
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    onSelectionChange = (rows) => {
        const selectedDeviceIds = rows.map(el => el.sid);
        this.setState({selectedDevices: rows, selectedDeviceIds});
    };

    resetSelected = () => {
        this.setState({selectedDeviceIds: [], selectedDevices: []});
    };

    addRemoveColumn = (columns) => {
        this.setState({columns});
    };

    showInfo(sid) {
        let device = this.props.selectedDevices.filter(el => el.sid === sid)[0];
        alert(`Device name: ${device.name} \nsid: ${device.sid}`);
    }

    render() {
        const {
            devicesToVis, columns, page, rowsPerPage, selectedDevices, columnsDialog, anchorEl,
            loading, minTime, maxTime, minSelectedDate, maxSelectedDate, locationData, linearData
        } = this.state;
        return (
            <div style={{maxWidth: '100%'}}>
                <MuiThemeProvider theme={theme}>
                    <Grid
                        container
                        spacing={40}
                    >
                        <Grid item xs={12} sm={12} md={12} lg={12}>
                            <Paper>
                                <div className={'chart-toolbar'}>
                                    <h3>
                                        Drag to select devices
                                    </h3>
                                </div>
                                <div id={'pie-phyid-vis'}>
                                </div>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={12} md={12} lg={12}>
                            <Paper>
                                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                    <div className="device-toolbar">
                                        <div className={'title'}>
                                            {(selectedDevices && selectedDevices.length === 1) ? <h3>
                                                Selected {selectedDevices[0].name}
                                            </h3> : <h3>Devices</h3>}
                                        </div>
                                        <div className={'device-controls'}>
                                            <div>
                                                <Tooltip title={'Select time'}>
                                                    <div>
                                                        <IconButton
                                                            disabled={!selectedDevices.length}
                                                            variant="contained"
                                                            color="primary"
                                                            onClick={() => this.handleClickOpen('timeDialog')}>
                                                            <TimelineIcon/>
                                                        </IconButton>
                                                    </div>
                                                </Tooltip>
                                                <Dialog
                                                    open={this.state.timeDialog}
                                                    onClose={() => this.handleClose('timeDialog')}
                                                    aria-labelledby="key-dialog-title"
                                                    aria-describedby="alert-dialog-description"
                                                >
                                                    <DialogTitle id="alert-dialog-title">Config time for
                                                        devices</DialogTitle>
                                                    <DialogContent>
                                                        <DialogContent>
                                                            <div className="picker">
                                                                <DatePicker
                                                                    disabled={loading}
                                                                    autoOk
                                                                    value={minSelectedDate}
                                                                    minDate={minTime}
                                                                    maxDate={maxSelectedDate}
                                                                    onChange={(time) => this.handleTimeChange('minSelectedDate', time)}
                                                                    label="Min time"/>
                                                            </div>
                                                            <div className="picker">
                                                                <DatePicker
                                                                    autoOk
                                                                    disabled={loading}
                                                                    value={maxSelectedDate}
                                                                    maxDate={maxTime}
                                                                    minDate={minSelectedDate}
                                                                    onChange={(time) => this.handleTimeChange('maxSelectedDate', time)}
                                                                    label="Max time"/>
                                                            </div>
                                                        </DialogContent>
                                                    </DialogContent>
                                                    <DialogActions>
                                                        <Button
                                                            variant="outlined" color="primary"
                                                            onClick={() => this.handleConfigTime()}
                                                            disabled={loading}
                                                        >
                                                            Confirm
                                                        </Button>
                                                        <Button onClick={() => this.handleClose('timeDialog')}
                                                                color="primary">
                                                            Close
                                                        </Button>
                                                    </DialogActions>
                                                </Dialog>
                                            </div>
                                            <Tooltip title={'Show columns'}>
                                                <div>
                                                    <IconButton variant="outlined" color="primary"
                                                                disabled={loading}
                                                                onClick={this.handleClickMenu}>
                                                        <ViewColumnIcon/>
                                                    </IconButton>
                                                    <Menu
                                                        id="time-menu"
                                                        open={columnsDialog}
                                                        anchorEl={anchorEl}
                                                        onClose={this.handleCloseMenu}
                                                        PaperProps={{
                                                            style: {
                                                                maxHeight: 45 * 4.5,
                                                                width: 250,
                                                            },
                                                        }}
                                                    >
                                                        <List id={'column-list'}>
                                                            {columns && columns.map(el => (
                                                                <div key={el.title}>
                                                                    <Divider dark={'true'}/>
                                                                    <ListItem key={el.title} dense button
                                                                              disabled={el.field === 'action'}
                                                                              onClick={() => this.handleColumnsChange(el.title)}>
                                                                        <Checkbox checked={!el.hidden}/>
                                                                        <ListItemText primary={el.title}/>
                                                                    </ListItem>
                                                                </div>
                                                            ))}
                                                        </List>
                                                    </Menu>
                                                </div>
                                            </Tooltip>
                                        </div>
                                    </div>
                                </MuiPickersUtilsProvider>
                                <MaterialTable
                                    data={devicesToVis}
                                    columns={columns}
                                    title="Vis devices"
                                    options={{
                                        filtering: true,
                                        columnsButton: false,
                                        header: true,
                                        initialPage: page,
                                        pageSize: rowsPerPage,
                                        search: false,
                                        toolbar: false,
                                        selection: true
                                    }}
                                    parentChildData={(row, rows) => rows.find(a => a.sid === row.parent_id)}
                                    onSelectionChange={this.onSelectionChange}
                                />
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={12} md={12} lg={12}
                              className={'chart_' + (linearData.length ? 'show' : 'hide')}>
                            <Paper>
                                <div id={'parent-line-chart'}>

                                </div>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={12} md={12} lg={12}>
                            <Paper>
                                <div id={'map'}>
                                    <MapGL
                                        {...this.state.viewport}
                                        mapStyle='mapbox://styles/mapbox/outdoors-v10'
                                        onViewportChange={(viewport) => this.setState({viewport})}>
                                        {locationData.length && locationData.map(el => {
                                            return (<Marker
                                                key={el._id.sid}
                                                longitude={el.data[0].value[1]}
                                                latitude={el.data[0].value[0]}
                                                offsetTop={-20}
                                                offsetLeft={-10}>
                                                <Pin size={20} onClick={() => this.showInfo(el._id.sid)}/>
                                            </Marker>)
                                        })}
                                    </MapGL>
                                </div>
                            </Paper>
                        </Grid>
                    </Grid>
                </MuiThemeProvider>
            </div>
        )
    }
}

Visualisation.propTypes = {
    selectedDevices: PropTypes.array.isRequired,
    parentDevices: PropTypes.array
};

const VisualisationComponent = connect(mapStateToProps, mapDispatchToProps)(Visualisation);

export default VisualisationComponent;
