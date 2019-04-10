import React from "react";
import * as PropTypes from 'prop-types';

// Material
import {withStyles} from '@material-ui/core/styles';
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import {createData, stableSort, getSorting} from "./firms-table.service";
import Table from "@material-ui/core/Table";
import Paper from "@material-ui/core/Paper";
import TableBody from "@material-ui/core/TableBody";
import TablePagination from "@material-ui/core/TablePagination";
import Checkbox from "@material-ui/core/Checkbox";
import LinearProgress from "@material-ui/core/LinearProgress";
import {styles} from '../material/table-styles';

// Redux
import {connect} from "react-redux";
import store from "../../redux/store";
import {addFirmRequest, deleteFirmRequest, firmDevicesRequest, updateFirmRequest} from "../../redux/actions";

// Components
import FirmToolBarComponent from './FirmToolBarComponent';
import FirmTableHead from './FirmTableHead'
import FirmTableToolbar from './FirmTableToolbar'
import './firmAdmin.scss';

const mapDispatchToProps = (dispatch) => {
    return {
        addFirmRequest: (payload) => dispatch(addFirmRequest(payload)),
        deleteFirmRequest: (payload) => dispatch(deleteFirmRequest(payload)),
        updateFirmRequest: (payload) => dispatch(updateFirmRequest(payload)),
        firmDevicesRequest: (payload) => dispatch(firmDevicesRequest(payload)),
    };
};

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

const FirmAdminProps = connect(null, mapDispatchToProps)(FirmAdmin);

const FirmAdminStyles = withStyles(styles)(FirmAdminProps);

export default FirmAdminStyles;
