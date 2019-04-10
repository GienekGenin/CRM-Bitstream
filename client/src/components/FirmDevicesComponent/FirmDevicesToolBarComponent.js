import React from "react";
import * as PropTypes from 'prop-types';

// Material
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import TextField from "@material-ui/core/TextField";
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import LinearProgress from "@material-ui/core/LinearProgress";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Input from "@material-ui/core/Input";
import Chip from "@material-ui/core/Chip";

// Redux
import {connect} from "react-redux";
import {firmDevicesRequest, addFirmDeviceRequest, deleteFirmDeviceRequest} from "../../redux/actions";
import {deviceTypesService} from '../../redux/services/device_types';
import {userService} from '../../redux/services/user';
import * as d3 from "d3";

const mapDispatchToProps = (dispatch) => {
    return {
        firmDevicesRequest: (payload) => dispatch(firmDevicesRequest(payload)),
        addFirmDeviceRequest: (payload) => dispatch(addFirmDeviceRequest(payload)),
        deleteFirmDeviceRequest: (payload) => dispatch(deleteFirmDeviceRequest(payload)),
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
            this.setState({loading: true});
            userService.getAllByFirmId(this.props.selectedFirmId).then(d => {
                this.setState({firmUsers: d, loading: false})
            }).catch(e => console.log(e))
        }
    };

    handleClose = (state) => {
        this.setState({
            [state]: false,
            newFirmDevice: {
                name: '',
                type: '',
                user_desc: '',
                coid: []
            }
        });
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
        // this.props.updateFirmDeviceRequest(this.state.newFirmDevice);
        this.props.resetSelected();
        this.handleClose('editDialog');
    }

    handleRefresh() {
        d3.select('#tree').remove();
        this.props.firmDevicesRequest(this.props.selectedFirmId);
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

    componentDidMount() {
        this.setState({loading: true});
        deviceTypesService.getDeviceTypes().then(d => {
            this.setState({deviceTypes: d, loading: false});
        }).catch(e => console.log(e))
    }

    render() {
        let {loading, firmUsers, deviceTypes} = this.state;
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
                                value={this.state.newFirmDevice.name}
                                onChange={(e) => this.updateNewFirmDevice(e, 'name')}
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
                            Confirm deletion of {this.props.selected ? this.props.selected._id : ''}
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
            </div>
        )
    }
}

FirmDevicesToolBar.propTypes = {
    selected: PropTypes.object,
    resetSelected: PropTypes.func,
    selectedFirmId: PropTypes.string,
    loading: PropTypes.bool
};

export default connect(null, mapDispatchToProps)(FirmDevicesToolBar);
