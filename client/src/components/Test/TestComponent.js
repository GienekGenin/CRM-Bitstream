import {Grid, MuiThemeProvider} from '@material-ui/core';
import {createMuiTheme} from '@material-ui/core/styles';
import React, {Component} from 'react';
import * as PropTypes from "prop-types";
import MaterialTable from '../material/MaterialTable/material-table';
import _ from 'lodash';
import './test.scss'

// Redux
import {connect} from "react-redux";
import store from "../../redux/store";
import {addFirmRequest, deleteFirmRequest, firmDevicesRequest, updateFirmRequest} from "../../redux/actions";
import Checkbox from "@material-ui/core/Checkbox";

import TestComponentToolBar from './TestComponentToolBar';

const mapDispatchToProps = (dispatch) => {
    return {
        addFirmRequest: (payload) => dispatch(addFirmRequest(payload)),
        deleteFirmRequest: (payload) => dispatch(deleteFirmRequest(payload)),
        updateFirmRequest: (payload) => dispatch(updateFirmRequest(payload)),
        firmDevicesRequest: (payload) => dispatch(firmDevicesRequest(payload)),
    };
};

const theme = createMuiTheme({
    palette: {
        type: 'light'
    }
});

class Test extends Component {

    constructor(props) {
        super(props);

        this.state = {
            selectedFirm: null,
            selectedFirmId: '',
            page: 0,
            rowsPerPage: 5,
            loading: false
        };

        this.resetSelected = this.resetSelected.bind(this);

        this.onFirmSelect = this.onFirmSelect.bind(this)
    }

    resetSelected = () => {
        this.setState({selectedFirm: null, selectedFirmId: ''});
    };



    componentDidMount() {
        this._isMounted = true;
        this.unsubscribe = store.subscribe(() => {
            this.setState({loading: store.getState().firmReducer.loading});
            if (store.getState().firmReducer.firms) {
                const firms = store.getState().firmReducer.firms;
                this.setState({firms});
            }
        });
    }

    componentWillUnmount() {
        this._isMounted = false;
        this.unsubscribe();
    }

    componentWillMount() {
        if (this.props.selectedFirm) {
            this.setState({selectedFirm: this.props.selectedFirm, selectedFirmId: this.props.selectedFirm._id});
        }
        if (this.props.firms) {
            this.setState({firms: this.props.firms})
        }
    }

    onFirmSelect = (e) => {
        let selectedFirm = _.omit(this.props.firms.filter(el => (el._id === e.target.value) ? el : null)[0], 'action');
        if (this.state.selectedFirm && this.state.selectedFirm._id === selectedFirm._id) {
            this.setState({selectedFirm: null, selectedFirmId: ''});
            this.props.onFirmSelect(null);
        } else {
            this.setState({selectedFirm, selectedFirmId: selectedFirm._id});
            this.props.onFirmSelect(selectedFirm);
        }
    };

    onChangePage = (page) => {
        this.setState({page});
    };

    onChangeRowsPerPage = (rowsPerPage) =>{
        this.setState({rowsPerPage});
    };

    render() {
        let {page, firms, rowsPerPage, loading, selectedFirm, selectedFirmId} = this.state;
        firms.map((el, i, arr) => arr[i] = Object.assign(el, {
            action: (
                <div>
                    <Checkbox value={el._id} checked={selectedFirmId === el._id} onChange={this.onFirmSelect}/>
                </div>
            )
        }));
        return (
            <MuiThemeProvider theme={theme}>
                <div style={{maxWidth: '100%'}}>
                    <Grid container>
                        <Grid item xs={12}>
                            <MaterialTable
                                components={{
                                    Toolbar: props => (
                                        <div className={'custom-toolbar'}>
                                            <TestComponentToolBar
                                                selected={selectedFirm}
                                                resetSelected={this.resetSelected}
                                                loading={loading}
                                            />
                                        </div>
                                    ),
                                }}
                                isLoading={loading}
                                data={firms}
                                columns={[
                                    {
                                        title: 'Select',
                                        field: 'action',
                                        filtering: false,
                                        sorting: false
                                    },
                                    {
                                        title: 'Name',
                                        field: 'name',
                                    },
                                    {title: 'Address', field: 'address'},
                                    {title: 'Email', field: 'email'},
                                    {title: 'tel', field: 'tel'},
                                    {title: 'nip', field: 'nip'},
                                ]}
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
                            />
                        </Grid>
                    </Grid>
                </div>
            </MuiThemeProvider>
        );
    }
}

Test.propTypes = {
    firms: PropTypes.array,
    onFirmSelect: PropTypes.func.isRequired,
    selectedFirm: PropTypes.object
};

export default connect(null, mapDispatchToProps)(Test);
