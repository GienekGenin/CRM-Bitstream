import React from "react";
import * as PropTypes from 'prop-types';

import DeleteIcon from '@material-ui/icons/Delete';
import {connect} from "react-redux";
import {firmDevicesRequest} from "../../redux/actions";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import TextField from "@material-ui/core/TextField";
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';

const mapDispatchToProps = (dispatch) => {
    return {
        firmDevicesRequest: (payload) => dispatch(firmDevicesRequest(payload)),
    };
};

class FirmDevicesToolBar extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            editDialog: false,
            addDialog: false,
            confirmDeleteDialog: false,
            newFirmDevice: {
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
        if (state === 'editDialog') {
            this.setState({newFirmDevice: this.props.selected})
        }
    };

    handleClose = (state) => {
        this.setState({
            [state]: false,
            newFirmDevice: {
                name: ''
            }
        });
    };

    handleAddFirmDevice = () => {
        // this.props.addFirmDeviceRequest(this.state.newFirmDevice);
        this.setState({
            addDialog: false,
            newFirmDevice: {
                name: ''
            }
        });
    };

    updateNewFirmDevice(e, param) {
        this.setState({newFirmDevice: Object.assign({}, this.state.newFirmDevice, {[param]: e.target.value})})
    }

    handleDeleteFirmDevice() {
        // this.props.deleteFirmDeviceRequest(this.props.selected._id);
        this.props.resetSelected();
        this.handleClose('confirmDeleteDialog');
    }

    handleUpdateFirmDevice() {
        // this.props.updateFirmDeviceRequest(this.state.newFirmDevice);
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
                        Edit
                        <EditIcon />
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
                        <AddIcon />
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
                        <DeleteIcon />
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

FirmDevicesToolBar.propTypes = {selected: PropTypes.object, resetSelected: PropTypes.func, loading: PropTypes.bool};

export default connect(null, mapDispatchToProps)(FirmDevicesToolBar);
