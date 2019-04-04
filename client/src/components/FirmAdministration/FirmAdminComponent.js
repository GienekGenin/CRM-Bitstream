import React from "react";
import * as PropTypes from 'prop-types';

import './firmAdmin.scss';

import classNames from 'classnames';
import {lighten} from '@material-ui/core/styles/colorManipulator';
import {withStyles} from '@material-ui/core/styles';
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import Tooltip from "@material-ui/core/Tooltip";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from '@material-ui/icons/Delete';
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import FilterListIcon from '@material-ui/icons/FilterList';

// todo: import 'desc' if needed
import {createData, stableSort, getSorting, rows} from "./firms-table.service";
import Table from "@material-ui/core/Table";
import Paper from "@material-ui/core/Paper";
import TableBody from "@material-ui/core/TableBody";
import TablePagination from "@material-ui/core/TablePagination";

import {connect} from "react-redux";
import store from "../../redux/store";
import {addFirmRequest, deleteFirmRequest, firmDevicesRequest, updateFirmRequest} from "../../redux/actions";

import Checkbox from "@material-ui/core/Checkbox";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import TextField from "@material-ui/core/TextField";
import LinearProgress from "@material-ui/core/LinearProgress";
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';

const mapDispatchToProps = (dispatch) => {
    return {
        addFirmRequest: (payload) => dispatch(addFirmRequest(payload)),
        deleteFirmRequest: (payload) => dispatch(deleteFirmRequest(payload)),
        updateFirmRequest: (payload) => dispatch(updateFirmRequest(payload)),
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

const FirmToolBarComponent = connect(null, mapDispatchToProps)(FirmToolBar);

class FirmTableHead extends React.Component {
    createSortHandler = property => event => {
        this.props.onRequestSort(event, property);
    };

    render() {
        const {order, orderBy} = this.props;

        return (
            <TableHead>
                <TableRow>
                    <TableCell>
                        Select
                    </TableCell>
                    {rows.map(
                        row => (
                            <TableCell
                                key={row.id}
                                align={row.numeric ? 'right' : 'left'}
                                padding={row.disablePadding ? 'none' : 'default'}
                                sortDirection={orderBy === row.id ? order : false}
                            >
                                <Tooltip
                                    title="Sort"
                                    placement={row.numeric ? 'bottom-end' : 'bottom-start'}
                                    enterDelay={300}
                                >
                                    <TableSortLabel
                                        active={orderBy === row.id}
                                        direction={order}
                                        onClick={this.createSortHandler(row.id)}
                                    >
                                        {row.label}
                                    </TableSortLabel>
                                </Tooltip>
                            </TableCell>
                        ),
                        this,
                    )}
                </TableRow>
            </TableHead>
        );
    }
}

FirmTableHead.propTypes = {
    numSelected: PropTypes.number.isRequired,
    onRequestSort: PropTypes.func.isRequired,
    order: PropTypes.string.isRequired,
    orderBy: PropTypes.string.isRequired,
    rowCount: PropTypes.number.isRequired,
};

const firmTableToolbarStyles = theme => ({
    root: {
        paddingRight: theme.spacing.unit,
    },
    highlight:
        theme.palette.type === 'light'
            ? {
                color: theme.palette.secondary.main,
                backgroundColor: lighten(theme.palette.secondary.light, 0.85),
            }
            : {
                color: theme.palette.text.primary,
                backgroundColor: theme.palette.secondary.dark,
            },
    spacer: {
        flex: '1 1 100%',
    },
    actions: {
        color: theme.palette.text.secondary,
    },
    title: {
        flex: '0 0 auto',
    },
});

let FirmTableToolbar = props => {
    const {classes, firm} = props;
    return (
        <Toolbar
            className={classNames(classes.root, {
                [classes.highlight]: firm,
            })}
        >
            <div className={classes.title}>
                {firm ? (
                    <Typography color="inherit" variant="subtitle1">
                        {firm.name} selected
                    </Typography>
                ) : (
                    <Typography variant="h6" id="tableTitle">
                        Firms
                    </Typography>
                )}
            </div>
            <div className={classes.spacer}/>
            <div className={classes.actions}>
                {firm ? (
                    <Tooltip title="Delete">
                        <IconButton aria-label="Delete">
                            <DeleteIcon/>
                        </IconButton>
                    </Tooltip>
                ) : (
                    <Tooltip title="Filter list">
                        <IconButton aria-label="Filter list">
                            <FilterListIcon/>
                        </IconButton>
                    </Tooltip>
                )}
            </div>
        </Toolbar>
    );
};

FirmTableToolbar.propTypes = {
    classes: PropTypes.object.isRequired,
    numSelected: PropTypes.number.isRequired,
    firm: PropTypes.object
};

FirmTableToolbar = withStyles(firmTableToolbarStyles)(FirmTableToolbar);

const styles = theme => ({
    root: {
        width: '100%',
        marginTop: theme.spacing.unit * 3,
    },
    table: {
        minWidth: 1020,
    },
    tableWrapper: {
        overflowX: 'auto',
        position: 'relative',
        top: 0,
        left: 0
    },
});

class FirmAdmin extends React.Component {

    _isMounted = false;

    constructor(props) {
        super(props);

        this.state = {
            order: 'asc',
            orderBy: 'id',
            selected: [],
            data: [],
            page: 0,
            rowsPerPage: 5,
            firm: null,
            loading: false
        };

        this.resetSelected = this.resetSelected.bind(this);

        this.handleFirmSelect = this.handleFirmSelect.bind(this);
    }

    componentDidMount() {
        this._isMounted = true;
        this.unsubscribe = store.subscribe(() => {
            this.setState({loading: store.getState().firmReducer.loading});
            if (store.getState().firmReducer.firms) {
                let data = [];
                const reduxFirms = store.getState().firmReducer.firms;
                const selected = [this.props.selectedFirm ? this.props.selectedFirm._id : null];
                reduxFirms.map(record => {
                    let row = [
                        record._id,
                        record.name,
                    ];
                    data.push(createData(...row));
                    const obj = {
                        order: this.state.order,
                        orderBy: this.state.orderBy,
                        selected,
                        data,
                        page: this.state.page,
                        rowsPerPage: this.state.rowsPerPage
                    };
                    this.setState(obj);
                    return true;
                })
            }
        });
    }

    componentWillUnmount() {
        this._isMounted = false;
        this.unsubscribe();
    }

    componentWillMount() {
        let selected = [];
        if(this.props.selectedFirm){
            this.setState({firm: this.props.selectedFirm});
            selected.push(this.props.selectedFirm._id);
        }
        let data = [];
        this.props.firms.map(record => {
            let row = [
                record._id,
                record.name,
            ];
            data.push(createData(...row));
            const obj = {
                order: this.state.order,
                orderBy: this.state.orderBy,
                selected,
                data,
                page: this.state.page,
                rowsPerPage: this.state.rowsPerPage
            };
            this.setState(obj);
            return true;
        })
    }

    handleFirmSelect(firm) {
        this.props.onFirmSelect(firm);
    }

    handleRequestSort = (event, property) => {
        const orderBy = property;
        let order = 'desc';

        if (this.state.orderBy === property && this.state.order === 'desc') {
            order = 'asc';
        }

        this.setState({order, orderBy});
    };

    resetSelected = () => {
        this.setState({selected: [], firm: null});
    };

    handleClick = (event, id) => {
        const {selected} = this.state;
        const selectedIndex = selected.indexOf(id);
        let newSelected = [];
        let firm = null;
        if (selectedIndex === -1) {
            newSelected.push(id);
            firm = this.props.firms.filter(el => el._id === id ? el : null)[0];
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        }
        this.handleFirmSelect(firm);
        this.setState({selected: newSelected, firm});
    };

    handleChangePage = (event, page) => {
        this.setState({page});
    };

    handleChangeRowsPerPage = event => {
        this.setState({rowsPerPage: event.target.value});
    };

    isSelected = id => this.state.selected.indexOf(id) !== -1;

    render() {
        const {classes} = this.props;

        const {data, order, orderBy, selected, rowsPerPage, page, firm, loading} = this.state;
        const emptyRows = rowsPerPage - Math.min(rowsPerPage, data.length - page * rowsPerPage);
        return (
            <Paper className={classes.root}>
                <FirmTableToolbar numSelected={selected.length} firm={firm}/>
                <FirmToolBarComponent selected={firm} loading={loading} resetSelected={() => this.resetSelected()}/>
                {loading && <LinearProgress color="secondary"/>}
                <div className={classes.tableWrapper}>
                    <Table className={classes.table} aria-labelledby="tableTitle">
                        <FirmTableHead
                            numSelected={selected.length}
                            order={order}
                            orderBy={orderBy}
                            onRequestSort={this.handleRequestSort}
                            rowCount={data.length}
                        />
                        <TableBody>
                            {stableSort(data, getSorting(order, orderBy))
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map(n => {
                                    const isSelected = this.isSelected(n._id);
                                    return (
                                        <TableRow
                                            hover
                                            onClick={event => this.handleClick(event, n._id)}
                                            role="checkbox"
                                            aria-checked={isSelected}
                                            tabIndex={-1}
                                            key={n._id}
                                            selected={isSelected}
                                        >
                                            <TableCell padding="checkbox">
                                                <Checkbox checked={isSelected}/>
                                            </TableCell>
                                            <TableCell align="right" key={n._id}>{n._id}</TableCell>
                                            <TableCell align="right" key={n.name}>{n.name}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            {emptyRows > 0 && (
                                <TableRow style={{height: 49 * emptyRows}}>
                                    <TableCell colSpan={6}/>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={data.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    backIconButtonProps={{
                        'aria-label': 'Previous Page',
                    }}
                    nextIconButtonProps={{
                        'aria-label': 'Next Page',
                    }}
                    onChangePage={this.handleChangePage}
                    onChangeRowsPerPage={this.handleChangeRowsPerPage}
                />
            </Paper>
        )
    }
}

FirmAdmin.propTypes = {
    firms: PropTypes.array,
    onFirmSelect: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
    selectedFirm: PropTypes.object
};

const mapDispatchToProps1 = (dispatch) => {
    return {
        firmDevicesRequest: (payload) => dispatch(firmDevicesRequest(payload)),
    };
};

const FirmAdminProps = connect(null, mapDispatchToProps1)(FirmAdmin);

const FirmAdminStyles = withStyles(styles)(FirmAdminProps);

export default FirmAdminStyles;
