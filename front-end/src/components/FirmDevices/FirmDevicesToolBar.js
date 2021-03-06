import React from 'react';
import * as PropTypes from 'prop-types';
import * as _ from 'lodash';
import * as d3 from 'd3';

// Material
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import TextField from '@material-ui/core/TextField';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import LinearProgress from '@material-ui/core/LinearProgress';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Input from '@material-ui/core/Input';
import Chip from '@material-ui/core/Chip';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import RefreshIcon from '@material-ui/icons/Refresh';
import AssignmentIndIcon from '@material-ui/icons/AssignmentInd';
import ViewColumnIcon from '@material-ui/icons/ViewColumn';
import Menu from '@material-ui/core/Menu';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import Checkbox from '@material-ui/core/Checkbox';
import ListItemText from '@material-ui/core/ListItemText';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';

// Redux
import {connect} from 'react-redux';
import {
    addFirmDeviceRequest, deleteFirmDeviceRequest,
    updateFirmDevice, updateDeviceUsersRequest,
    userDevicesRequest
} from '../../redux/actions';

// Services
import {deviceTypesService} from '../../redux/services/device_types';
import {userService} from '../../redux/services/user';
import {devicesService} from '../../redux/services/devices';
import {checkAccess} from '../privateRoute';

const mapDispatchToProps = (dispatch) => {
    return {
        addFirmDeviceRequest: (payload) => dispatch(addFirmDeviceRequest(payload)),
        deleteFirmDeviceRequest: (payload) => dispatch(deleteFirmDeviceRequest(payload)),
        updateFirmDevice: (payload) => dispatch(updateFirmDevice(payload)),
        userDevicesRequest: (coid) => dispatch(userDevicesRequest(coid)),
        updateDeviceUsersRequest: (sid, coid, selectedUserIds) => dispatch(updateDeviceUsersRequest(sid, coid, selectedUserIds)),
    };
};

class FirmDevicesToolBar extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            deviceTypes: null,
            firmUsers: null,
            editDialog: false,
            addDialog: false,
            confirmDeleteDialog: false,
            configUsersDialog: false,
            CSDialog: false,
            anchorEl: null,
            columns: null,
            columnsDialog: false,
            CS: '',
            newFirmDevice: {
                name: '',
                type: '',
                user_desc: '',
                coid: []
            },
            loading: false
        };
    }

    handleClickOpen = (state) => {
        this.setState({[state]: true});
        if (state === 'editDialog') {
            this.setState({newFirmDevice: this.props.selected})
        }
        if (state === 'addDialog') {
            if (this.props.deviceTypes) {
                this.setState({deviceTypes: this.props.deviceTypes, loading: false});
            }
            else {
                deviceTypesService.getDeviceTypes().then(deviceTypes => {
                    this.setState({deviceTypes, loading: false});
                }).catch(e => console.log(e))
            }
        }
        if (state === 'addDialog' || state === 'configUsersDialog') {
            this.setState({loading: true});
            userService.getAllByFirmId(this.props.selectedFirmId).then(dbUsers => {
                this.setState({
                    firmUsers: dbUsers, loading: false
                });
            }).catch(e => console.log(e))
        }
        if (state === 'configUsersDialog') {
            this.setState({loading: true});
            let users = [];
            userService.getAllByFirmId(this.props.selectedFirmId).then(dbUsers => {
                dbUsers.forEach(el => {
                    this.props.selected.coid.forEach(id => {
                        if (el._id === id) {
                            users.push(el);
                        }
                    });
                });
                this.setState({
                    newFirmDevice: Object.assign({}, this.props.selected, {coid: users}),
                    firmUsers: dbUsers, loading: false
                });
            }).catch(e => console.log(e))
        }
        if (state === 'CSDialog') {
            devicesService.getDeviceCS(this.props.selected.sid)
                .then(CS => this.setState({CS}))
                .catch(e => {
                    console.log(e);
                    this.setState({CS: 'Device not found'});
                });
        }
    };

    handleClose = (state) => {
        this.setState({
            [state]: false,
            newFirmDevice: {
                name: '',
                type: '',
                user_desc: '',
                coid: [],
                CS: ''
            }
        });
    };

    handleClickMenu = event => {
        this.setState({anchorEl: event.currentTarget, columnsDialog: true, columns: this.props.columns});
    };

    handleCloseMenu = () => {
        const columns = this.state.columns;
        this.props.addRemoveColumn(columns);
        this.setState({anchorEl: null, columnsDialog: false, columns});
    };

    handleAddFirmDevice = () => {
        this.props.addFirmDeviceRequest(this.state.newFirmDevice);
        this.setState({
            addDialog: false,
            newFirmDevice: {
                name: '',
                type: '',
                user_desc: '',
                coid: []
            }
        });
    };

    updateNewFirmDevice(e, param) {
        this.setState({newFirmDevice: Object.assign({}, this.state.newFirmDevice, {[param]: e.target.value})})
    }

    handleDeleteFirmDevice() {
        d3.select('#tree').remove();
        this.props.deleteFirmDeviceRequest(this.props.selected.sid);
        this.props.resetSelected();
        this.handleClose('confirmDeleteDialog');
    }

    handleUpdateFirmDevice() {
        let deviceToUpdate = _.omit(this.state.newFirmDevice, ['tableData', 'action']);
        this.props.updateFirmDevice(deviceToUpdate);
        this.props.resetSelected();
        this.handleClose('editDialog');
    }

    handleRefresh() {
        d3.select('#tree').remove();
        this.props.userDevicesRequest(this.props.selectedUserIds);
        this.props.resetSelected();
        this.setState({
            addDialog: false,
            newFirmDevice: {
                name: '',
                type: '',
                user_desc: '',
                coid: []
            }
        });
    }

    handleConfigUsersForDevice() {
        d3.select('#tree').remove();
        const ids = this.state.newFirmDevice.coid.map(el => el._id);
        if (ids.length > 0) {
            this.props.updateDeviceUsersRequest(this.state.newFirmDevice.sid, ids, this.props.selectedUserIds);
        }
        this.props.resetSelected();
        this.handleClose('configUsersDialog');
    }

    handleColumnsChange = (title) => {
        let columns = this.state.columns.map((el, i, arr) => el.title === title ? arr[i] = Object.assign(el, {hidden: !el.hidden}) : el);
        this.setState({columns});
    };

    changeDeviceActivity = (activity) => {
        const parentDeviceIds = this.props.selectedDevices
            .filter(el => el.parent_id === '0')
            .map(el => el.sid);
        if (parentDeviceIds.length > 0) {
            this.setState({loading: true});
            devicesService.changeActivity(parentDeviceIds, activity)
                .then(() => {
                    this.setState({loading: false});
                })
                .catch(() => {
                    this.setState({loading: false});
                });
        }
        else {
            alert('No gateways were selected');
        }

    };

    componentDidMount() {
    }

    render() {
        let {loading, firmUsers, deviceTypes, anchorEl, columnsDialog, columns} = this.state;
        return (
            <div>
                <div className="device-toolbar">
                    <div className={'title'}>
                        {this.props.selected ? <h3>
                            Selected {this.props.selected.name}
                        </h3> : <h3>Devices</h3>}
                    </div>
                    <div className={'device-controls'}>
                        <div>
                            <Tooltip title={'Device CS'}>
                                <div>
                                    <IconButton
                                        disabled={this.props.selected ? (this.props.selected.parent_id !== '0') : true || loading}
                                        variant="contained" color="primary"
                                        onClick={() => this.handleClickOpen('CSDialog')}>
                                        <VpnKeyIcon/>
                                    </IconButton>
                                </div>
                            </Tooltip>
                            <Dialog
                                open={this.state.CSDialog}
                                onClose={() => this.handleClose('CSDialog')}
                                aria-labelledby="key-dialog-title"
                                aria-describedby="alert-dialog-description"
                            >
                                <DialogTitle id="alert-dialog-title">Device CS</DialogTitle>
                                <DialogContent>
                                    {this.state.CS}
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={() => this.handleClose('CSDialog')} color="primary">
                                        Close
                                    </Button>
                                </DialogActions>
                            </Dialog>
                        </div>
                        <div>
                            <Tooltip title={'Edit selected device'}>
                                <div>
                                    <IconButton disabled={!this.props.selected || loading} variant="contained"
                                                color="primary"
                                                onClick={() => this.handleClickOpen('editDialog')}>
                                        <EditIcon/>
                                    </IconButton>
                                </div>
                            </Tooltip>
                            <Dialog
                                open={this.state.editDialog}
                                onClose={() => this.handleClose('editDialog')}
                                aria-labelledby="key-dialog-title"
                                aria-describedby="alert-dialog-description"
                            >
                                <DialogTitle id="alert-dialog-title">Edit firm device</DialogTitle>
                                <DialogContent>
                                    <DialogContent>
                                        <TextField
                                            autoFocus
                                            margin="dense"
                                            id="device-name"
                                            label="Device name"
                                            type="text"
                                            required={true}
                                            value={this.state.newFirmDevice.name}
                                            onChange={(e) => this.updateNewFirmDevice(e, 'name')}
                                            fullWidth
                                        />
                                        <TextField
                                            id="User-desc"
                                            label="Your description"
                                            multiline
                                            rows="4"
                                            margin="normal"
                                            variant="outlined"
                                            value={this.state.newFirmDevice.user_desc}
                                            onChange={(e) => this.updateNewFirmDevice(e, 'user_desc')}
                                            fullWidth
                                        />
                                    </DialogContent>
                                </DialogContent>
                                <DialogActions>
                                    <Button variant="outlined" color="primary"
                                            disabled={!this.state.newFirmDevice.name || loading}
                                            onClick={() => this.handleUpdateFirmDevice()}>
                                        Update
                                    </Button>
                                    <Button onClick={() => this.handleClose('editDialog')} color="primary">
                                        Close
                                    </Button>
                                </DialogActions>
                            </Dialog>
                        </div>
                        <div>
                            <Tooltip title={'Add new device'}>
                                <div>
                                    <IconButton variant="outlined" color="primary"
                                                disabled={this.props.loading || loading}
                                                onClick={() => this.handleClickOpen('addDialog')}>
                                        <AddIcon/>
                                    </IconButton>
                                </div>
                            </Tooltip>
                            <Dialog
                                open={this.state.addDialog}
                                onClose={() => this.handleClose('addDialog')}
                                aria-labelledby="alert-dialog-title"
                                aria-describedby="alert-dialog-description"
                            >
                                <DialogTitle id="alert-dialog-title-">Add device</DialogTitle>
                                <DialogContent>
                                    <TextField
                                        autoFocus
                                        margin="dense"
                                        id="device-name"
                                        label="Device name"
                                        type="text"
                                        required={true}
                                        value={this.state.newFirmDevice.name}
                                        onChange={(e) => this.updateNewFirmDevice(e, 'name')}
                                        fullWidth
                                    />
                                    <FormControl fullWidth required={true} disabled={loading}>
                                        <InputLabel htmlFor="device-type">Device type</InputLabel>
                                        <Select
                                            value={this.state.newFirmDevice.type}
                                            onChange={(e) => this.updateNewFirmDevice(e, 'type')}
                                            id='device-type'
                                        >
                                            {deviceTypes && deviceTypes.map((el, i) =>
                                                <MenuItem value={el._id} key={i}>{el.name}</MenuItem>)}
                                        </Select>
                                        {loading && <LinearProgress color="secondary"/>}
                                    </FormControl>
                                    <FormControl fullWidth disabled={loading}>
                                        <InputLabel htmlFor="select-multiple-chip">Users</InputLabel>
                                        <Select
                                            multiple
                                            value={this.state.newFirmDevice.coid}
                                            onChange={(e) => this.updateNewFirmDevice(e, 'coid')}
                                            input={<Input id="select-multiple-chip"/>}
                                            renderValue={selected => (
                                                <div>
                                                    {selected.map(value => (
                                                        <Chip key={value._id} label={value.name}/>
                                                    ))}
                                                </div>
                                            )}
                                        >
                                            {firmUsers && firmUsers.map(user => (
                                                <MenuItem key={user._id} value={user}>
                                                    {user.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {loading && <LinearProgress color="secondary"/>}
                                    </FormControl>
                                    <TextField
                                        id="User-desc"
                                        label="Your description"
                                        multiline
                                        rows="4"
                                        margin="normal"
                                        variant="outlined"
                                        value={this.state.newFirmDevice.user_desc}
                                        onChange={(e) => this.updateNewFirmDevice(e, 'user_desc')}
                                        fullWidth
                                    />
                                </DialogContent>
                                <DialogActions>
                                    <Button variant="outlined" color="primary"
                                            disabled={
                                                !this.state.newFirmDevice.name ||
                                                !this.state.newFirmDevice.coid.length ||
                                                !this.state.newFirmDevice.type
                                            }
                                            onClick={() => this.handleAddFirmDevice()}>
                                        Add
                                    </Button>
                                    <Button onClick={() => this.handleClose('addDialog')} color="primary">
                                        Close
                                    </Button>
                                </DialogActions>
                            </Dialog>
                        </div>
                        <div>
                            <Tooltip title={'Delete device'}>
                                <div>
                                    <IconButton variant="contained" color="secondary"
                                                disabled={
                                                    this.props.selected ?
                                                        !(this.props.selected.parent_id === '0')
                                                        : true}
                                                onClick={() => this.handleClickOpen('confirmDeleteDialog')}>
                                        <DeleteIcon/>
                                    </IconButton>
                                </div>
                            </Tooltip>
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
                                    <Button disabled={!this.props.selected || loading} variant="contained"
                                            color="secondary"
                                            onClick={() => this.handleDeleteFirmDevice()}>
                                        Confirm
                                    </Button>
                                </DialogActions>
                            </Dialog>
                        </div>
                        <Tooltip title={'Refresh device list'}>
                            <div>
                                <IconButton variant="outlined" color="primary" disabled={this.props.loading || loading}
                                            onClick={() => this.handleRefresh()}>
                                    <RefreshIcon/>
                                </IconButton>
                            </div>
                        </Tooltip>
                        <div>
                            <Tooltip
                                title={
                                    <React.Fragment>
                                        <em>{"Add"}</em> <b>{'or'}</b> <em>{'delete'}</em>{' '}
                                        {"users from device"}
                                    </React.Fragment>
                                }
                            >
                                <div>
                                    <IconButton variant="outlined" color="primary"
                                                disabled={
                                                    this.props.loading ||
                                                    !this.props.selected ||
                                                    !checkAccess('/users') ||
                                                    loading}
                                                onClick={() => this.handleClickOpen('configUsersDialog')}>
                                        <AssignmentIndIcon/>
                                    </IconButton>
                                </div>
                            </Tooltip>
                            <Dialog
                                open={this.state.configUsersDialog}
                                onClose={() => this.handleClose('configUsersDialog')}
                                aria-labelledby="alert-dialog-title"
                                aria-describedby="alert-dialog-description"
                            >
                                <DialogTitle id="alert-dialog-title-">Config users</DialogTitle>
                                <DialogContent>
                                    <FormControl fullWidth={true}>
                                        <InputLabel htmlFor="select-multiple-chip">Firm users</InputLabel>
                                        <Select
                                            multiple
                                            value={this.state.newFirmDevice.coid}
                                            onChange={(e) => this.updateNewFirmDevice(e, 'coid')}
                                            input={<Input id="select-multiple-chip"/>}
                                            renderValue={selected => (
                                                <div>
                                                    {selected.map(value => (
                                                        <Chip key={value._id} label={value.name}/>
                                                    ))}
                                                </div>
                                            )}
                                        >
                                            {firmUsers && firmUsers.map(user => (
                                                <MenuItem key={user._id} value={user}>
                                                    {user.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {loading && <LinearProgress color="secondary"/>}
                                    </FormControl>
                                </DialogContent>
                                <DialogActions>
                                    <Button variant="outlined" color="primary"
                                            disabled={this.state.newFirmDevice.coid < 1 || loading}
                                            onClick={() => this.handleConfigUsersForDevice()}>
                                        Submit
                                    </Button>
                                    <Button onClick={() => this.handleClose('configUsersDialog')} color="primary">
                                        Close
                                    </Button>
                                </DialogActions>
                            </Dialog>
                        </div>
                        <Tooltip title={'Turn on'}>
                            <div>
                                <IconButton variant="outlined" color="primary"
                                            disabled={
                                                this.props.loading ||
                                                (this.props.selectedDevices &&
                                                    !this.props.selectedDevices.length > 0) ||
                                                loading}
                                            onClick={() => this.changeDeviceActivity('Enabled')}>
                                    <RadioButtonCheckedIcon/>
                                </IconButton>
                            </div>
                        </Tooltip>
                        <Tooltip title={'Turn off'}>
                            <div>
                                <IconButton variant="outlined" color="primary"
                                            disabled={
                                                this.props.loading ||
                                                (this.props.selectedDevices &&
                                                    !this.props.selectedDevices.length > 0) ||
                                                loading}
                                            onClick={() => this.changeDeviceActivity('Disabled')}>
                                    <RadioButtonUncheckedIcon/>
                                </IconButton>
                            </div>
                        </Tooltip>
                        <Tooltip title={'Show columns'}>
                            <div>
                                <IconButton variant="outlined" color="primary" disabled={
                                    this.props.loading || loading}
                                            onClick={this.handleClickMenu}>
                                    <ViewColumnIcon/>
                                </IconButton>
                                <Menu
                                    id="long-menu"
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
                                                <ListItem key={el.title} dense button disabled={el.field === 'action'}
                                                          onClick={() => this.handleColumnsChange(el.title)}>
                                                    <Checkbox checked={!el.hidden}/>
                                                    <ListItemText primary={el.title}/>
                                                </ListItem>
                                            </div>
                                        ))}
                                        <Button fullWidth={true} onClick={this.handleCloseMenu}
                                                className={'submit-button'}>
                                            Submit
                                        </Button>
                                    </List>
                                </Menu>
                            </div>
                        </Tooltip>
                    </div>
                </div>
                {(this.props.loading || loading) && <div className={'progress'}>
                    <LinearProgress/>
                </div>}
            </div>
        )
    }
}

FirmDevicesToolBar.propTypes = {
    selected: PropTypes.object,
    selectedDevices: PropTypes.array,
    resetSelected: PropTypes.func,
    selectedFirmId: PropTypes.string,
    loading: PropTypes.bool,
    columns: PropTypes.array,
    addRemoveColumn: PropTypes.func,
    deviceTypes: PropTypes.array,
    selectedUserIds: PropTypes.array
};

export default connect(null, mapDispatchToProps)(FirmDevicesToolBar);
