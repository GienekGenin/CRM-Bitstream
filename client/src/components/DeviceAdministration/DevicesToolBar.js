import React from "react";
import * as PropTypes from 'prop-types';

import DeleteIcon from '@material-ui/icons/Delete';
import {connect} from "react-redux";
import {
    userDevicesRequest,
    addDeviceRequest,
    deleteDeviceRequest,
    updateDeviceUsersRequest,
} from "../../redux/actions";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import TextField from "@material-ui/core/TextField";
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';

import {deviceTypesService} from '../../redux/services/device_types'
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";

import * as d3 from "d3";
import Input from "@material-ui/core/Input";
import Chip from "@material-ui/core/Chip";

const mapDispatchToProps = (dispatch) => {
    return {
        userDevicesRequest: (payload) => dispatch(userDevicesRequest(payload)),
        addDeviceRequest: (payload) => dispatch(addDeviceRequest(payload)),
        deleteDeviceRequest: (payload) => dispatch(deleteDeviceRequest(payload)),
        updateDeviceUsersRequest: (sid, coid) => dispatch(updateDeviceUsersRequest(sid, coid)),
    };
};


class DevicesToolBar extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            deviceTypes: null,
            editDialog: false,
            addDialog: false,
            confirmDeleteDialog: false,
            configUsersDialog: false,
            newUserDevice: {
                name: '',
                type: '',
                user_desc: '',
                coid: []
            }
        };
    }

    handleClickOpen = (state) => {
        this.setState({[state]: true});
        if (state === 'editDialog') {
            this.setState({newUserDevice: this.props.selected})
        }
        if (state === 'configUsersDialog') {
            let users = [];
            this.props.parentUsers.forEach(el => {
                this.props.selected.coid.forEach(id => {
                    if (el._id === id) {
                        users.push(el);
                    }
                });
            });
            this.setState({newUserDevice: Object.assign({}, this.props.selected, {coid: users})});
        }
    };

    handleClose = (state) => {
        this.setState({
            [state]: false,
            newUserDevice: {
                name: '',
                type: '',
                user_desc: '',
                coid: []
            }
        });
    };

    handleAddUserDevice = () => {
        d3.select('#tree').remove();
        const deviceToServer = Object.assign({}, this.state.newUserDevice,
            {coid: [this.props.selectedUserId]});
        this.props.addDeviceRequest(deviceToServer);
        this.setState({
            addDialog: false,
            newUserDevice: {
                name: '',
                type: '',
                user_desc: '',
                coid: []
            }
        });
    };

    updateNewUserDevice(e, param) {
        this.setState({newUserDevice: Object.assign({}, this.state.newUserDevice, {[param]: e.target.value})})
    }

    handleDeleteFirmDevice() {
        d3.select('#tree').remove();
        this.props.deleteDeviceRequest(this.props.selected.sid);
        this.props.resetSelected();
        this.handleClose('confirmDeleteDialog');
    }

    handleUpdateFirmDevice() {
        d3.select('#tree').remove();
        // this.props.updateFirmDeviceRequest(this.state.newUserDevice);
        this.props.resetSelected();
        this.handleClose('editDialog');
    }

    handleRefresh() {
        d3.select('#tree').remove();
        this.props.userDevicesRequest(this.props.selectedUserId);
        this.props.resetSelected();
        this.setState({
            addDialog: false,
            newUserDevice: {
                name: '',
                type: '',
                user_desc: '',
                coid: []
            }
        });
    }

    handleConfigUsersForDevice() {
        d3.select('#tree').remove();
        const ids = this.state.newUserDevice.coid.map(el => el._id);
        if (ids.length > 0) {
            this.props.updateDeviceUsersRequest(this.state.newUserDevice.sid, ids);
        }
        this.props.resetSelected();
        this.handleClose('configUsersDialog');
    }

    componentDidMount() {
        // get all deviceTypes
        deviceTypesService.getDeviceTypes().then(d => {
            this.setState({deviceTypes: d})
        }).catch(e => console.log(e))
    }

    render() {
        const {deviceTypes} = this.state;
        const {parentUsers} = this.props;
        return (
            <div className="device-controls">
                <div>
                    <Button disabled={!this.props.selected} variant="contained" color="primary"
                            onClick={() => this.handleClickOpen('editDialog')}>
                        Edit
                        <EditIcon/>
                    </Button>
                    <Dialog
                        open={this.state.editDialog}
                        onClose={() => this.handleClose('editDialog')}
                        aria-labelledby="key-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                        <DialogTitle id="alert-dialog-title">Edit</DialogTitle>
                        <DialogContent>
                            <TextField
                                autoFocus
                                margin="dense"
                                id="firm-name"
                                label="Firm name"
                                type="text"
                                required={true}
                                value={this.state.newUserDevice.name}
                                onChange={(e) => this.updateNewUserDevice(e, 'name')}
                                fullWidth
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button variant="outlined" color="primary"
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
                    <Button variant="outlined" color="primary" disabled={this.props.loading}
                            onClick={() => this.handleClickOpen('addDialog')}>
                        Add
                        <AddIcon/>
                    </Button>
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
                                value={this.state.newUserDevice.name}
                                onChange={(e) => this.updateNewUserDevice(e, 'name')}
                                fullWidth
                            />
                            <FormControl fullWidth required={true}>
                                <InputLabel htmlFor="device-type">Device type</InputLabel>
                                <Select
                                    value={this.state.newUserDevice.type}
                                    onChange={(e) => this.updateNewUserDevice(e, 'type')}
                                    id='device-type'
                                >
                                    {deviceTypes ? deviceTypes.map((el, i) =>
                                        <MenuItem value={el._id} key={i}>{el.name}</MenuItem>) : ''}
                                </Select>
                            </FormControl>
                            <TextField
                                id="User-desc"
                                label="Your description"
                                multiline
                                rows="4"
                                margin="normal"
                                variant="outlined"
                                value={this.state.newUserDevice.user_desc}
                                onChange={(e) => this.updateNewUserDevice(e, 'user_desc')}
                                fullWidth
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button variant="outlined" color="primary"
                                    onClick={() => this.handleAddUserDevice()}>
                                Add
                            </Button>
                            <Button onClick={() => this.handleClose('addDialog')} color="primary">
                                Close
                            </Button>
                        </DialogActions>
                    </Dialog>
                </div>
                <div>
                    <Button variant="contained" color="secondary" disabled={!this.props.selected}
                            onClick={() => this.handleClickOpen('confirmDeleteDialog')}>
                        Delete
                        <DeleteIcon/>
                    </Button>
                    <Dialog
                        open={this.state.confirmDeleteDialog}
                        onClose={() => this.handleClose('confirmDeleteDialog')}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                        <DialogTitle id="alert-dialog-title-">Device properties</DialogTitle>
                        <DialogContent>
                            Confirm deletion of {this.props.selected ? this.props.selected.name : ''}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => this.handleClose('confirmDeleteDialog')} color="primary">
                                Close
                            </Button>
                            <Button disabled={!this.props.selected} variant="contained" color="secondary"
                                    onClick={() => this.handleDeleteFirmDevice()}>
                                Confirm
                            </Button>
                        </DialogActions>
                    </Dialog>
                </div>
                <Button variant="contained" disabled={this.props.loading} onClick={() => this.handleRefresh()}>
                    Refresh
                </Button>
                <div>
                    <Button variant="outlined" color="primary" disabled={this.props.loading || !this.props.selected}
                            onClick={() => this.handleClickOpen('configUsersDialog')}>
                        Config users
                        <AddIcon/>
                    </Button>
                    <Dialog
                        open={this.state.configUsersDialog}
                        onClose={() => this.handleClose('configUsersDialog')}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                        <DialogTitle id="alert-dialog-title-">Config users</DialogTitle>
                        <DialogContent>
                            <FormControl fullWidth={true}>
                                <InputLabel htmlFor="select-multiple-chip">Chip</InputLabel>
                                <Select
                                    multiple
                                    value={this.state.newUserDevice.coid}
                                    onChange={(e) => this.updateNewUserDevice(e, 'coid')}
                                    input={<Input id="select-multiple-chip"/>}
                                    renderValue={selected => (
                                        <div>
                                            {selected.map(value => (
                                                <Chip key={value._id} label={value.name}/>
                                            ))}
                                        </div>
                                    )}
                                >
                                    {parentUsers.map(user => (
                                        <MenuItem key={user._id} value={user}>
                                            {user.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </DialogContent>
                        <DialogActions>
                            <Button variant="outlined" color="primary" disabled={this.state.newUserDevice.coid < 1}
                                    onClick={() => this.handleConfigUsersForDevice()}>
                                Submit
                            </Button>
                            <Button onClick={() => this.handleClose('configUsersDialog')} color="primary">
                                Close
                            </Button>
                        </DialogActions>
                    </Dialog>
                </div>
            </div>
        )
    }
}

DevicesToolBar.propTypes = {
    selected: PropTypes.object,
    selectedUserId: PropTypes.string,
    resetSelected: PropTypes.func,
    loading: PropTypes.bool,
    parentUsers: PropTypes.array
};

export default connect(null, mapDispatchToProps)(DevicesToolBar);
