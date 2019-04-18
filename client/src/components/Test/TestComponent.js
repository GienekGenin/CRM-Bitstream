import {Grid, MuiThemeProvider, InputAdornment} from '@material-ui/core';
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
import {createData} from "../FirmAdministration/firms-table.service";
import Checkbox from "@material-ui/core/Checkbox";
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import Button from '@material-ui/core/Button';

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
                let data = [];
                const reduxFirms = store.getState().firmReducer.firms;

            }
        });
    }

    componentWillUnmount() {
        this._isMounted = false;
        this.unsubscribe();
    }

    componentWillMount() {
        let selected = [];
        if (this.props.selectedFirm) {
            this.setState({firm: this.props.selectedFirm});
            selected.push(this.props.selectedFirm._id);
        }
        if (this.props.firms) {
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

    render() {
        let {loading, selectedFirm, selectedFirmId} = this.state;
        let {firms} = this.props;
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
                                    initialPage: 0,
                                    search: false,
                                    toolbar: true
                                }}
                                onSelectionChange={this.onSelectionChange}
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
