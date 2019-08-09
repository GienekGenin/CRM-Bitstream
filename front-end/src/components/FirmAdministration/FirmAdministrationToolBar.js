import React from 'react';
import * as PropTypes from 'prop-types';

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
import RefreshIcon from '@material-ui/icons/Refresh';
import IconButton from '@material-ui/core/IconButton';
import ViewColumnIcon from '@material-ui/icons/ViewColumn';
import Tooltip from '@material-ui/core/Tooltip';
import Menu from '@material-ui/core/Menu';
import Checkbox from '@material-ui/core/Checkbox';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import LinearProgress from '@material-ui/core/LinearProgress';

// Redux
import {connect} from 'react-redux';
import {addFirmRequest, deleteFirmRequest, firmsRequest, updateFirmRequest} from '../../redux/actions';

// Components
import './FirmToolBar.scss'

// Services
import {validateField} from '../../services/validation.service';

const mapDispatchToProps = (dispatch) => {
    return {
        addFirmRequest: (payload) => dispatch(addFirmRequest(payload)),
        deleteFirmRequest: (payload) => dispatch(deleteFirmRequest(payload)),
        updateFirmRequest: (payload) => dispatch(updateFirmRequest(payload)),
        firmRequest: () => dispatch(firmsRequest()),
    };
};

class TestToolBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editDialog: false,
            addDialog: false,
            confirmDeleteDialog: false,
            anchorEl: null,
            columns: null,
            columnsDialog: false,
            newFirm: {
                name: '',
                address: '',
                email: '',
                tel: '',
                nip: ''
            },
            nameValid: false,
            addressValid: false,
            emailValid: false,
            telValid: false,
            nipValid: false
        };
        this.validateForm = this.validateForm.bind(this);
        this.updateNewFirm = this.updateNewFirm.bind(this);
    }

    handleClickMenu = event => {
        this.setState({anchorEl: event.currentTarget, columnsDialog: true, columns: this.props.columns});
    };

    handleCloseMenu = () => {
        const columns = this.state.columns;
        this.props.addRemoveColumn(columns);
        this.setState({anchorEl: null, columnsDialog: false, columns});
    };

    handleColumnsChange = (title) => {
        let columns = this.state.columns.map(
            (el, i, arr) => el.title === title ? arr[i] = Object.assign(el, {hidden: !el.hidden}) : el);
        this.setState({columns});
    };

    handleClickOpen = (state) => {
        this.setState({[state]: true});
        const newFirm = this.props.selected;
        if (state === 'editDialog') {
            this.setState({newFirm}, () => {
                Object.getOwnPropertyNames(newFirm).forEach(propName => {
                    validateField(propName, newFirm[propName], this);
                })
            });
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

    handleAddFirm = () => {
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

    updateNewFirm(e) {
        const {value, name} = e.target;
        this.setState({
            newFirm: Object.assign({}, this.state.newFirm, {[name]: value})
        }, () => {
            validateField(name, value, this)
        });
    }

    handleDeleteDevice() {
        this.props.deleteFirmRequest(this.props.selected._id);
        this.props.resetSelected();
        this.handleClose('confirmDeleteDialog');
    }

    handleRefresh() {
        this.props.firmRequest();
        this.props.resetSelected();
    }

    handleUpdateFirm(e) {
        this.props.updateFirmRequest(this.state.newFirm);
        this.props.resetSelected();
        this.handleClose('editDialog');
    }

    validateForm = () => {
        let {nameValid, addressValid, emailValid, telValid, nipValid} = this.state;
        this.setState({
            formValid: nameValid && addressValid && emailValid && telValid && nipValid
        });
    };

    render() {
        let {
            columns, anchorEl, columnsDialog, editDialog, nameValid, addressValid,
            emailValid, newFirm, formValid, telValid, nipValid, addDialog, confirmDeleteDialog
        } = this.state;
        const {selected, loading} = this.props;
        return (
            <div>
                <div className="firm-toolbar">
                    <div className={'title'}>
                        {selected ? <h3>
                            Selected {selected.name}
                        </h3> : <h3>Firms</h3>}
                    </div>
                    <div className={'firm-controls'}>
                        <div>
                            <Tooltip title={'Edit selected firm'}>
                                <div>
                                    <IconButton disabled={!selected} variant="contained" color="primary"
                                                onClick={() => this.handleClickOpen('editDialog')}>
                                        <EditIcon/>
                                    </IconButton>
                                </div>
                            </Tooltip>
                            <Dialog
                                open={editDialog}
                                onClose={() => this.handleClose('editDialog')}
                                aria-labelledby="key-dialog-title"
                                aria-describedby="alert-dialog-description"
                            >
                                <DialogTitle id="alert-dialog-title">Edit firm</DialogTitle>
                                <DialogContent>
                                    <TextField
                                        className={'form-group' + (!newFirm.name ? ' has-error' : '')}
                                        autoFocus
                                        margin="dense"
                                        id="firm-name"
                                        label="Firm name"
                                        type="text"
                                        name='name'
                                        required={true}
                                        value={newFirm.name}
                                        onChange={this.updateNewFirm}
                                        fullWidth
                                    />
                                    {
                                        !newFirm.name && null &&
                                        <div className="help-block">Name is required</div>
                                    }
                                    {
                                        newFirm.name && !nameValid &&
                                        <div className="help-block">Too short name</div>
                                    }
                                    <TextField
                                        className={'form-group' + (!newFirm.address ? ' has-error' : '')}
                                        autoFocus
                                        margin="dense"
                                        id="firm-address"
                                        label="Firms address"
                                        type="text"
                                        name='address'
                                        required={true}
                                        value={newFirm.address}
                                        onChange={this.updateNewFirm}
                                        fullWidth
                                    />
                                    {
                                        !newFirm.address && null &&
                                        <div className="help-block">Address is required</div>
                                    }
                                    {
                                        newFirm.address && !addressValid &&
                                        <div className="help-block">Too short adress</div>
                                    }
                                    <TextField
                                        className={'form-group' + (!newFirm.email ? ' has-error' : '')}
                                        autoFocus
                                        margin="dense"
                                        id="firm-email"
                                        label="Firm email"
                                        type="text"
                                        name='email'
                                        required={true}
                                        value={newFirm.email}
                                        onChange={this.updateNewFirm}
                                        fullWidth
                                    />
                                    {
                                        !newFirm.email && null &&
                                        <div className="help-block">Email is required</div>
                                    }
                                    {
                                        newFirm.email && !emailValid &&
                                        <div className="help-block">Incorrect email</div>
                                    }
                                    <TextField
                                        className={'form-group' + (!newFirm.tel ? ' has-error' : '')}
                                        autoFocus
                                        margin="dense"
                                        id="firm-tel"
                                        label="Firm contact number"
                                        type="text"
                                        name='tel'
                                        required={true}
                                        value={newFirm.tel}
                                        onChange={this.updateNewFirm}
                                        fullWidth
                                    />
                                    {
                                        !newFirm.tel && null &&
                                        <div className="help-block">Number is required</div>
                                    }
                                    {
                                        newFirm.tel && !telValid &&
                                        <div className="help-block">Too short number</div>
                                    }
                                    <TextField
                                        className={'form-group' + (!newFirm.nip ? ' has-error' : '')}
                                        autoFocus
                                        margin="dense"
                                        id="firm-nip"
                                        label="NIP"
                                        type="text"
                                        name='nip'
                                        required={true}
                                        value={newFirm.nip}
                                        onChange={this.updateNewFirm}
                                        fullWidth
                                    />
                                    {
                                        !newFirm.nip && null &&
                                        <div className="help-block">Nip is required</div>
                                    }
                                    {
                                        newFirm.nip && !nipValid &&
                                        <div className="help-block">Too short nip</div>
                                    }
                                </DialogContent>
                                <DialogActions>
                                    <Button variant="outlined" color="primary"
                                            disabled={
                                                !formValid
                                            }
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
                            <Tooltip title={'Add new firm'}>
                                <div>
                                    <IconButton variant="outlined" color="primary" disabled={loading}
                                                onClick={() => this.handleClickOpen('addDialog')}>
                                        <AddIcon/>
                                    </IconButton>
                                </div>
                            </Tooltip>
                            <Dialog
                                open={addDialog}
                                onClose={() => this.handleClose('addDialog')}
                                aria-labelledby="alert-dialog-title"
                                aria-describedby="alert-dialog-description"
                            >
                                <DialogTitle id="alert-dialog-title-">Add firm</DialogTitle>
                                <DialogContent>
                                    <TextField
                                        className={'form-group' + (!newFirm.name ? ' has-error' : '')}
                                        autoFocus
                                        margin="dense"
                                        id="firm-name"
                                        label="Firm name"
                                        type="text"
                                        name='name'
                                        required={true}
                                        value={newFirm.name}
                                        onChange={this.updateNewFirm}
                                        fullWidth
                                    />
                                    {
                                        !newFirm.name && null &&
                                        <div className="help-block">Name is required</div>
                                    }
                                    {
                                        newFirm.name && !nameValid &&
                                        <div className="help-block">Too short name</div>
                                    }
                                    <TextField
                                        className={'form-group' + (!newFirm.address ? ' has-error' : '')}
                                        autoFocus
                                        margin="dense"
                                        id="firm-address"
                                        label="Firms address"
                                        type="text"
                                        name='address'
                                        required={true}
                                        value={newFirm.address}
                                        onChange={this.updateNewFirm}
                                        fullWidth
                                    />
                                    {
                                        !newFirm.address && null &&
                                        <div className="help-block">Address is required</div>
                                    }
                                    {
                                        newFirm.address && !addressValid &&
                                        <div className="help-block">Too short adress</div>
                                    }
                                    <TextField
                                        className={'form-group' + (!newFirm.email ? ' has-error' : '')}
                                        autoFocus
                                        margin="dense"
                                        id="firm-email"
                                        label="Firm email"
                                        type="text"
                                        name='email'
                                        required={true}
                                        value={newFirm.email}
                                        onChange={this.updateNewFirm}
                                        fullWidth
                                    />
                                    {
                                        !newFirm.email && null &&
                                        <div className="help-block">Email is required</div>
                                    }
                                    {
                                        newFirm.email && !emailValid &&
                                        <div className="help-block">Incorrect email</div>
                                    }
                                    <TextField
                                        className={'form-group' + (!newFirm.tel ? ' has-error' : '')}
                                        autoFocus
                                        margin="dense"
                                        id="firm-tel"
                                        label="Firm contact number"
                                        type="text"
                                        name='tel'
                                        required={true}
                                        value={newFirm.tel}
                                        onChange={this.updateNewFirm}
                                        fullWidth
                                    />
                                    {
                                        !newFirm.tel && null &&
                                        <div className="help-block">Number is required</div>
                                    }
                                    {
                                        newFirm.tel && !telValid &&
                                        <div className="help-block">Too short number</div>
                                    }
                                    <TextField
                                        className={'form-group' + (!newFirm.nip ? ' has-error' : '')}
                                        autoFocus
                                        margin="dense"
                                        id="firm-nip"
                                        label="NIP"
                                        type="text"
                                        name='nip'
                                        required={true}
                                        value={newFirm.nip}
                                        onChange={this.updateNewFirm}
                                        fullWidth
                                    />
                                    {
                                        !newFirm.nip && null &&
                                        <div className="help-block">Nip is required</div>
                                    }
                                    {
                                        newFirm.nip && !nipValid &&
                                        <div className="help-block">Too short nip</div>
                                    }
                                </DialogContent>
                                <DialogActions>
                                    <Button variant="outlined" color="primary"
                                            disabled={
                                                !formValid
                                            }
                                            onClick={() => this.handleAddFirm()}>
                                        Add
                                    </Button>
                                    <Button onClick={() => this.handleClose('addDialog')} color="primary">
                                        Close
                                    </Button>
                                </DialogActions>
                            </Dialog>
                        </div>
                        <div>
                            <IconButton variant="contained" color="secondary" disabled={!selected || true}
                                        onClick={() => this.handleClickOpen('confirmDeleteDialog')}>
                                <DeleteIcon/>
                            </IconButton>
                            <Dialog
                                open={confirmDeleteDialog}
                                onClose={() => this.handleClose('confirmDeleteDialog')}
                                aria-labelledby="alert-dialog-title"
                                aria-describedby="alert-dialog-description"
                            >
                                <DialogTitle id="alert-dialog-title-">Delete firm</DialogTitle>
                                <DialogContent>
                                    Confirm deletion of {selected ? selected.name : ''}
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={() => this.handleClose('confirmDeleteDialog')} color="primary">
                                        Close
                                    </Button>
                                    <Button disabled={!selected} variant="contained" color="secondary"
                                            onClick={() => this.handleDeleteDevice()}>
                                        Confirm
                                    </Button>
                                </DialogActions>
                            </Dialog>
                        </div>
                        <Tooltip title={'Refresh firm list'}>
                            <div>
                                <IconButton variant="outlined" color="primary" disabled={loading}
                                            onClick={() => this.handleRefresh()}>
                                    <RefreshIcon/>
                                </IconButton>
                            </div>
                        </Tooltip>
                        <Tooltip title={'Show columns'}>
                            <div>
                                <IconButton variant="outlined" color="primary" disabled={loading}
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
                {loading && <div className={'progress'}>
                    <LinearProgress/>
                </div>}
            </div>

        )
    }
}

TestToolBar.propTypes = {
    selected: PropTypes.object,
    resetSelected: PropTypes.func,
    loading: PropTypes.bool,
    addRemoveColumn: PropTypes.func,
    columns: PropTypes.array
};

export default connect(null, mapDispatchToProps)(TestToolBar);
