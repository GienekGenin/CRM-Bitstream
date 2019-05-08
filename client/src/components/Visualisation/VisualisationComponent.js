import React from "react";
import * as PropTypes from 'prop-types';
import * as dotenv from 'dotenv';
import DateFnsUtils from "@date-io/date-fns";
import _ from "lodash";

// Viz
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
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
import MaterialTable from 'material-table';
import {DatePicker, MuiPickersUtilsProvider} from "material-ui-pickers";

//Services
import {createLineChart} from "./lineChart.service";
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

        this.createPhyidPie = this.createPhyidPie.bind(this);
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
        selectedDevices = selectedDevices.map(el=>_.omit(el, ['action', 'tableData']));
        const sids = selectedDevices.map(el => el.sid);
        dataService.getDevicesWithData({sids}).then(d => {
            let sids = d.map(el => el._id.sid);
            const devicesWithData = selectedDevices.filter(el => sids.includes(el.sid));
            this.createPhyidPie(devicesWithData);
        }).catch(e => console.log(e));

        this.unsubscribe = store.subscribe(() => {

            const {linearData, locationData} = this.state;
            this.setState({loading: true});
            if (store.getState().dataReducer.data.length) {
                const reduxData = store.getState().dataReducer.data;
                const reduxLinearData = [];
                const reduxLocationData = [];
                reduxData.forEach(el=>{
                    if(Array.isArray(el.data[0].value)){
                        reduxLocationData.push(el)
                    } else {
                        reduxLinearData.push(el);
                    }
                });
                if (reduxLinearData.length !== linearData.length) {
                    d3.select('#lineChart').remove();
                    d3.select('#parent-line-chart').append('div').attr("id", 'lineChart');
                    reduxLinearData.length && createLineChart(reduxLinearData, selectedDevices);
                    this.setState({linearData: reduxLinearData})
                }
                if(reduxLocationData.length !== locationData.length){
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

    componentWillMount() {

    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    createPhyidPie = (devicesToShow) => {
        let {selectedPhyids} = this.state;
        if (devicesToShow) {
            let parsedData = [];
            let data = [];
            data.push({
                "type": "Empty",
                "disabled": true,
                "count": 1,
                "color": am4core.color("#dadada"),
                "opacity": 0.3,
                "strokeDasharray": "4,4"
            });
            let phyidSet = new Set();
            devicesToShow.forEach(el => {
                phyidSet.add(el.phyid);
            });
            phyidSet.forEach(phyid => {
                parsedData[phyid] = 0;
                devicesToShow.forEach(el => {
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
                    data.push(objToChart);
            }

            am4core.useTheme(am4themes_animated);

            // cointainer to hold both charts
            const container = am4core.create("pie-phyid-vis", am4core.Container);
            container.width = am4core.percent(100);
            container.height = am4core.percent(100);
            container.layout = "horizontal";

            container.events.on("maxsizechanged", function () {
                chart1.zIndex = 0;
                separatorLine.zIndex = 1;
                dragText.zIndex = 2;
                chart2.zIndex = 3;
            });

            const chart1 = container.createChild(am4charts.PieChart);
            chart1.fontSize = 11;
            chart1.hiddenState.properties.opacity = 0; // this makes initial fade in effect
            chart1.data = data;
            chart1.radius = am4core.percent(70);
            chart1.innerRadius = am4core.percent(40);
            chart1.zIndex = 1;

            // legend
            // chart1.legend = new am4charts.Legend();

            const series1 = chart1.series.push(new am4charts.PieSeries());
            series1.dataFields.value = "count";
            series1.dataFields.category = "type";
            series1.colors.step = 2;
            series1.alignLabels = false;
            series1.labels.template.bent = true;
            series1.labels.template.radius = 3;
            series1.labels.template.padding(0, 0, 0, 0);

            const sliceTemplate1 = series1.slices.template;
            sliceTemplate1.cornerRadius = 5;
            sliceTemplate1.draggable = true;
            sliceTemplate1.inert = true;
            sliceTemplate1.propertyFields.fill = "color";
            sliceTemplate1.propertyFields.fillOpacity = "opacity";
            sliceTemplate1.propertyFields.stroke = "color";
            sliceTemplate1.propertyFields.strokeDasharray = "strokeDasharray";
            sliceTemplate1.strokeWidth = 1;
            sliceTemplate1.strokeOpacity = 1;

            let zIndex = 5;

            sliceTemplate1.events.on("down", (event) => {
                event.target.toFront();
                // also put chart to front
                const series = event.target.dataItem.component;
                series.chart.zIndex = zIndex++;
            });

            series1.ticks.template.disabled = true;

            sliceTemplate1.states.getKey("active").properties.shiftRadius = 0;

            sliceTemplate1.events.on("dragstop", (event) => {
                handleDragStop(event);
            });

            // separator line and text
            const separatorLine = container.createChild(am4core.Line);
            separatorLine.x1 = 0;
            separatorLine.y2 = 300;
            separatorLine.strokeWidth = 3;
            separatorLine.stroke = am4core.color("#dadada");
            separatorLine.valign = "middle";
            separatorLine.strokeDasharray = "5,5";


            const dragText = container.createChild(am4core.Label);
            dragText.text = "Drag slices over the line";
            dragText.rotation = 90;
            dragText.valign = "middle";
            dragText.align = "center";
            dragText.paddingBottom = 5;

            // second chart
            const chart2 = container.createChild(am4charts.PieChart);
            chart2.hiddenState.properties.opacity = 0; // this makes initial fade in effect
            chart2.fontSize = 11;
            chart2.radius = am4core.percent(70);
            chart2.data = data;
            chart2.innerRadius = am4core.percent(40);
            chart2.zIndex = 1;

            const series2 = chart2.series.push(new am4charts.PieSeries());
            series2.dataFields.value = "count";
            series2.dataFields.category = "type";
            series2.colors.step = 2;

            series2.alignLabels = false;
            series2.labels.template.bent = true;
            series2.labels.template.radius = 3;
            series2.labels.template.padding(0, 0, 0, 0);
            series2.labels.template.propertyFields.disabled = "disabled";

            const sliceTemplate2 = series2.slices.template;
            sliceTemplate2.copyFrom(sliceTemplate1);

            series2.ticks.template.disabled = true;

            const handleDragStop = (event) => {
                let targetSlice = event.target;
                let dataItem1;
                let dataItem2;
                let slice1;
                let slice2;

                if (series1.slices.indexOf(targetSlice) !== -1) {
                    slice1 = targetSlice;
                    slice2 = series2.dataItems.getIndex(targetSlice.dataItem.index).slice;
                } else if (series2.slices.indexOf(targetSlice) !== -1) {
                    slice1 = series1.dataItems.getIndex(targetSlice.dataItem.index).slice;
                    slice2 = targetSlice;
                }

                dataItem1 = slice1.dataItem;
                dataItem2 = slice2.dataItem;
                const toggledType = dataItem2.dataContext.type;

                const series1Center = am4core.utils.spritePointToSvg({x: 0, y: 0}, series1.slicesContainer);
                const series2Center = am4core.utils.spritePointToSvg({x: 0, y: 0}, series2.slicesContainer);

                const series1CenterConverted = am4core.utils.svgPointToSprite(series1Center, series2.slicesContainer);
                const series2CenterConverted = am4core.utils.svgPointToSprite(series2Center, series1.slicesContainer);

                // tooltipY and tooltipY are in the middle of the slice, so we use them to avoid extra calculations
                const targetSlicePoint = am4core.utils.spritePointToSvg({
                    x: targetSlice.tooltipX,
                    y: targetSlice.tooltipY
                }, targetSlice);

                if (targetSlice === slice1) {
                    if (targetSlicePoint.x > container.pixelWidth / 2) {
                        // const value = dataItem1.value;

                        dataItem1.hide();

                        const animation = slice1.animate([{property: "x", to: series2CenterConverted.x}, {
                            property: "y",
                            to: series2CenterConverted.y
                        }], 400);
                        animation.events.on("animationprogress", (event) => {
                            slice1.hideTooltip();
                        });

                        slice2.x = 0;
                        slice2.y = 0;

                        dataItem2.show();
                        selectedPhyids.add(toggledType);
                    } else {
                        slice1.animate([{property: "x", to: 0}, {property: "y", to: 0}], 400);
                    }
                }
                if (targetSlice === slice2) {
                    if (targetSlicePoint.x < container.pixelWidth / 2) {

                        // const value = dataItem2.value;

                        dataItem2.hide();
                        selectedPhyids.delete(toggledType);

                        const animation = slice2.animate([{property: "x", to: series1CenterConverted.x}, {
                            property: "y",
                            to: series1CenterConverted.y
                        }], 400);
                        animation.events.on("animationprogress", (event) => {
                            slice2.hideTooltip();
                        });

                        slice1.x = 0;
                        slice1.y = 0;
                        dataItem1.show();
                    } else {
                        slice2.animate([{property: "x", to: 0}, {property: "y", to: 0}], 400);
                    }
                }

                // get all devices with matching phyids
                let devicesToVis = [];
                selectedPhyids.forEach(phyid => {
                    devicesToShow.forEach(device => {
                        if (device.phyid === phyid) {
                            devicesToVis.push(device);
                        }
                    });
                });
                this.setState({selectedPhyids, devicesToVis});

                toggleDummySlice(series1);
                toggleDummySlice(series2);

                series1.hideTooltip();
                series2.hideTooltip();
            };

            const toggleDummySlice = (series) => {
                let show = true;
                for (let i = 1; i < series.dataItems.length; i++) {
                    const dataItem = series.dataItems.getIndex(i);
                    if (dataItem.slice.visible && !dataItem.slice.isHiding) {
                        show = false;
                    }
                }

                const dummySlice = series.dataItems.getIndex(0);
                if (show) {
                    dummySlice.show();
                } else {
                    dummySlice.hide();
                }
            };

            series2.events.on("datavalidated", () => {
                const dummyDataItem = series2.dataItems.getIndex(0);
                dummyDataItem.show(0);
                dummyDataItem.slice.draggable = false;
                dummyDataItem.slice.tooltipText = undefined;

                for (let i = 1; i < series2.dataItems.length; i++) {
                    series2.dataItems.getIndex(i).hide(0);
                }
            });

            series1.events.on("datavalidated", () => {
                const dummyDataItem = series1.dataItems.getIndex(0);
                dummyDataItem.hide(0);
                dummyDataItem.slice.draggable = false;
                dummyDataItem.slice.tooltipText = undefined;
            });

        }
    };

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

    showInfo(sid){
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
                                                                {/*<Button fullWidth={true} onClick={this.handleCloseMenu}*/}
                                                                        {/*className={'submit-button'}>*/}
                                                                    {/*Submit*/}
                                                                {/*</Button>*/}
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
                        <Grid item xs={12} sm={12} md={12} lg={12} className={'chart_' + (linearData.length ? 'show' : 'hide')}>
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
                                        {locationData.length && locationData.map(el=>{
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
