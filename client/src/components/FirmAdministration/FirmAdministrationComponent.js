import React, {Component} from 'react';
import * as PropTypes from "prop-types";
import _ from 'lodash';

// Material
import Checkbox from "@material-ui/core/Checkbox";
import {Grid, MuiThemeProvider} from '@material-ui/core';
import {createMuiTheme} from '@material-ui/core/styles';
import MaterialTable from 'material-table';

// Redux
import {connect} from "react-redux";
import store from "../../redux/store";
import {addFirmRequest, deleteFirmRequest, updateFirmRequest} from "../../redux/actions";

// Components
import './FirmAdministration.scss';
import FirmAdministrationToolBar from './FirmAdministrationToolBar';

// Services
import {firmService} from "../../redux/services/firm";
import {mixedService} from "../../redux/services/mixed";
import {buildFirmsInfo} from "./chart.service";
import Paper from "@material-ui/core/Paper";

const mapDispatchToProps = (dispatch) => {
    return {
        addFirmRequest: (payload) => dispatch(addFirmRequest(payload)),
        deleteFirmRequest: (payload) => dispatch(deleteFirmRequest(payload)),
        updateFirmRequest: (payload) => dispatch(updateFirmRequest(payload)),
    };
};

const theme = createMuiTheme({
    palette: {
        type: 'light'
    },
    typography: {
        useNextVariants: true,
    },
});

class FirmAdministrationComponent extends Component {

    constructor(props) {
        super(props);

        this.state = {
            selectedFirm: null,
            selectedFirmId: '',
            page: 0,
            rowsPerPage: 5,
            loading: false,
            columns: [
                {
                    title: 'Select',
                    field: 'action',
                    filtering: false,
                    sorting: false,
                    hidden: false,
                },
                {
                    title: 'Name',
                    field: 'name',
                    hidden: false,
                },
                {title: 'Address', field: 'address', hidden: false,},
                {title: 'Email', field: 'email', hidden: false,},
                {title: 'tel', field: 'tel', hidden: false,},
                {title: 'nip', field: 'nip', hidden: false,},
            ],
            basicInfo: null
        };

        this.resetSelected = this.resetSelected.bind(this);

        this.addRemoveColumn = this.addRemoveColumn.bind(this);
    }

    resetSelected = () => {
        this.setState({selectedFirm: null, selectedFirmId: ''});
    };

    addRemoveColumn = (columns) => {
        this.setState({columns});
    };

    componentDidMount() {
        firmService.firmsInfo().then(firmsInfo => {
            buildFirmsInfo(firmsInfo);
        }).catch(e => e);
        mixedService.getBasicInfo().then(basicInfo => {
            this.setState({basicInfo});
        }).catch(e => e);
        this.unsubscribe = store.subscribe(() => {
            this.setState({loading: store.getState().firmReducer.loading});
            if (store.getState().firmReducer.firms) {
                const firms = store.getState().firmReducer.firms;
                this.setState({firms});
            }
        });

        if (this.props.selectedFirm) {
            this.setState({selectedFirm: this.props.selectedFirm, selectedFirmId: this.props.selectedFirm._id});
        }
        if (this.props.firms) {
            this.setState({firms: this.props.firms})
        }
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    onChangePage = (page) => {
        this.setState({page});
    };

    onChangeRowsPerPage = (rowsPerPage) => {
        this.setState({rowsPerPage});
    };

    onRowClick = (e, rowData) => {
        let selectedFirm = _.omit(this.props.firms.filter(el => (el._id === rowData._id) ? el : null)[0], 'action');
        if (this.state.selectedFirm && this.state.selectedFirm._id === selectedFirm._id) {
            this.setState({selectedFirm: null, selectedFirmId: ''});
            this.props.onFirmSelect(null);
        } else {
            this.setState({selectedFirm, selectedFirmId: selectedFirm._id});
            this.props.onFirmSelect(selectedFirm);
        }
    };

    render() {
        let {page, firms, rowsPerPage, loading, selectedFirm, selectedFirmId, columns,
        basicInfo} = this.state;
        firms && firms.map((el, i, arr) => arr[i] = Object.assign(el, {
            action: (
                <div>
                    <Checkbox value={el._id} checked={selectedFirmId === el._id}/>
                </div>
            )
        }));
        return (
            <MuiThemeProvider theme={theme}>
                <div style={{maxWidth: '100%'}}>
                    <Grid container spacing={5}>
                        <Grid item xs={12}>
                            <MaterialTable
                                components={{
                                    Toolbar: props => (
                                        <div className={'custom-toolbar'}>
                                            <FirmAdministrationToolBar
                                                selected={selectedFirm}
                                                resetSelected={this.resetSelected}
                                                loading={loading}
                                                addRemoveColumn={this.addRemoveColumn}
                                                columns={columns}
                                            />
                                        </div>
                                    ),
                                }}
                                // todo: bug if loading used
                                // isLoading={loading}
                                data={firms}
                                columns={columns}
                                title="Firms"
                                options={{
                                    filtering: true,
                                    columnsButton: false,
                                    header: true,
                                    initialPage: page,
                                    pageSize: rowsPerPage,
                                    search: false,
                                    toolbar: true
                                }}
                                onChangePage={(props, e) => this.onChangePage(props, e)}
                                onChangeRowsPerPage={(props, e) => this.onChangeRowsPerPage(props, e)}
                                onRowClick={this.onRowClick}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Paper className={'chart-container'}>
                                {basicInfo && Object.getOwnPropertyNames(basicInfo).map(propName=>(
                                    <div key={propName}>
                                        {propName} : {basicInfo[propName]}, 
                                    </div>
                                ))}
                            </Paper>
                        </Grid>
                        <Grid item xs={6}>
                            <Paper className={'chart-container'}>
                                <div id={'firms-info'}>
                                </div>
                            </Paper>
                        </Grid>
                    </Grid>
                </div>
            </MuiThemeProvider>
        );
    }
}

FirmAdministrationComponent.propTypes = {
    firms: PropTypes.array,
    onFirmSelect: PropTypes.func.isRequired,
    selectedFirm: PropTypes.object
};

export default connect(null, mapDispatchToProps)(FirmAdministrationComponent);
