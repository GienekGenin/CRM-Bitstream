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

// Redux
import {connect} from "react-redux";
import {addFirmRequest, deleteFirmRequest, firmDevicesRequest, updateFirmRequest} from "../../redux/actions";

const mapDispatchToProps = (dispatch) => {
    return {
        addFirmRequest: (payload) => dispatch(addFirmRequest(payload)),
        deleteFirmRequest: (payload) => dispatch(deleteFirmRequest(payload)),
        updateFirmRequest: (payload) => dispatch(updateFirmRequest(payload)),
        firmDevicesRequest: (payload) => dispatch(firmDevicesRequest(payload)),
    };
};

class FirmToolBar extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            editDialog: false,
            addDialog: false,
            confirmDeleteDialog: false,
            newFirm: {
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
            this.setState({newFirm: this.props.selected})
        }
    };

    handleClose = (state) => {
        this.setState({
            [state]: false,
            newFirm: {
                name: '',
                address: '',
                email: '',
                tel: '',
                nip: ''
            }
        });
    };

    handleAddDevice = () => {
        this.props.addFirmRequest(this.state.newFirm);
        this.setState({
            addDialog: false,
            newFirm: {
                name: '',
                address: '',
                email: '',
                tel: '',
                nip: ''
            }
        });
    };

    updateNewFirm(e, param) {
        this.setState({newFirm: Object.assign({}, this.state.newFirm, {[param]: e.target.value})})
    }

    handleDeleteDevice() {
        this.props.deleteFirmRequest(this.props.selected._id);
        this.props.resetSelected();
        this.handleClose('confirmDeleteDialog');
    }

    handleUpdateFirm() {
        this.props.updateFirmRequest(this.state.newFirm);
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
                        <DialogTitle id="alert-dialog-title">Edit firm</DialogTitle>
                        <DialogContent>
                            <TextField
                                autoFocus
                                margin="dense"
                                id="firm-name"
                                label="Firm name"
                                type="text"
                                required={true}
                                value={this.state.newFirm.name}
                                onChange={(e) => this.updateNewFirm(e, 'name')}
                                fullWidth
                            />
                            <TextField
                                autoFocus
                                margin="dense"
                                id="firm-address"
                                label="Firms address"
                                type="text"
                                required={true}
                                value={this.state.newFirm.address}
                                onChange={(e) => this.updateNewFirm(e, 'address')}
                                fullWidth
                            />
                            <TextField
                                autoFocus
                                margin="dense"
                                id="firm-email"
                                label="Firm email"
                                type="text"
                                required={true}
                                value={this.state.newFirm.email}
                                onChange={(e) => this.updateNewFirm(e, 'email')}
                                fullWidth
                            />
                            <TextField
                                autoFocus
                                margin="dense"
                                id="firm-tel"
                                label="Firm contact number"
                                type="text"
                                required={true}
                                value={this.state.newFirm.tel}
                                onChange={(e) => this.updateNewFirm(e, 'tel')}
                                fullWidth
                            />
                            <TextField
                                autoFocus
                                margin="dense"
                                id="firm-nip"
                                label="NIP"
                                type="text"
                                required={true}
                                value={this.state.newFirm.nip}
                                onChange={(e) => this.updateNewFirm(e, 'nip')}
                                fullWidth
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button variant="outlined" color="primary"
                                    onClick={() => this.handleUpdateFirm()}>
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
                        <DialogTitle id="alert-dialog-title-">Add firm</DialogTitle>
                        <DialogContent>
                            <TextField
                                autoFocus
                                margin="dense"
                                id="firm-name"
                                label="Firm name"
                                type="text"
                                required={true}
                                value={this.state.newFirm.name}
                                onChange={(e) => this.updateNewFirm(e, 'name')}
                                fullWidth
                            />
                            <TextField
                                autoFocus
                                margin="dense"
                                id="firm-address"
                                label="Firms address"
                                type="text"
                                required={true}
                                value={this.state.newFirm.address}
                                onChange={(e) => this.updateNewFirm(e, 'address')}
                                fullWidth
                            />
                            <TextField
                                autoFocus
                                margin="dense"
                                id="firm-email"
                                label="Firm email"
                                type="text"
                                required={true}
                                value={this.state.newFirm.email}
                                onChange={(e) => this.updateNewFirm(e, 'email')}
                                fullWidth
                            />
                            <TextField
                                autoFocus
                                margin="dense"
                                id="firm-tel"
                                label="Firm contact number"
                                type="text"
                                required={true}
                                value={this.state.newFirm.tel}
                                onChange={(e) => this.updateNewFirm(e, 'tel')}
                                fullWidth
                            />
                            <TextField
                                autoFocus
                                margin="dense"
                                id="firm-nip"
                                label="NIP"
                                type="text"
                                required={true}
                                value={this.state.newFirm.nip}
                                onChange={(e) => this.updateNewFirm(e, 'nip')}
                                fullWidth
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button variant="outlined" color="primary"
                                    onClick={() => this.handleAddDevice()}>
                                Add
                            </Button>
                            <Button onClick={() => this.handleClose('addDialog')} color="primary">
                                Close
                            </Button>
                        </DialogActions>
                    </Dialog>
                </div>
                <div>
                    <Button variant="contained" color="secondary" disabled={!this.props.selected || true}
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
                        <DialogTitle id="alert-dialog-title-">Delete firm</DialogTitle>
                        <DialogContent>
                            Confirm deletion of {this.props.selected ? this.props.selected.name : ''}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => this.handleClose('confirmDeleteDialog')} color="primary">
                                Close
                            </Button>
                            <Button disabled={!this.props.selected} variant="contained" color="secondary"
                                    onClick={() => this.handleDeleteDevice()}>
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

FirmToolBar.propTypes = {selected: PropTypes.object, resetSelected: PropTypes.func, loading: PropTypes.bool};

export default connect(null, mapDispatchToProps)(FirmToolBar);
