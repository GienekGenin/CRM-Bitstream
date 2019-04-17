import { Grid, MuiThemeProvider } from '@material-ui/core';
import { createMuiTheme } from '@material-ui/core/styles';
import React, { Component } from 'react';
import * as PropTypes from "prop-types";
import MaterialTable from '../material/MaterialTable/material-table';
import './test.scss'

// Redux
import {connect} from "react-redux";
import store from "../../redux/store";
import {addFirmRequest, deleteFirmRequest, firmDevicesRequest, updateFirmRequest} from "../../redux/actions";
import {createData} from "../FirmAdministration/firms-table.service";

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

        this.testFun = this.testFun.bind(this)
    }

    resetSelected = () => {
        this.setState({selected: [], firm: null});
    };

    handleFirmSelect(firm) {
        this.props.onFirmSelect(firm);
    }

    componentDidMount() {
        this._isMounted = true;
        this.unsubscribe = store.subscribe(() => {
            this.setState({loading: store.getState().firmReducer.loading});
            if (store.getState().firmReducer.firms) {
                let data = [];
                const reduxFirms = store.getState().firmReducer.firms;
                const selected = [];
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
        if(this.props.firms){
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

    testFun =(event)=>{
        console.log(event)
    }

    render() {
        let {firms} = this.props;
        let test = true;
        return (
            <MuiThemeProvider theme={theme}>
                <div style={{ maxWidth: '100%' }}>
                    <Grid container>
                        <Grid item xs={12}>
                            <MaterialTable
                                onChangePage={this.testFun}
                                data={firms}
                                columns={[
                                    {
                                        title: 'name',
                                        field: 'name',
                                        editComponent: props => (
                                            <input
                                                type="text"
                                                value={props.value}
                                                onChange={e => props.onChange(e.target.value)}
                                            />
                                        ),},
                                    { title: 'address', field: 'address' },
                                    { title: 'email', field: 'email' },
                                    { title: 'tel', field: 'tel' },
                                    { title: 'nip', field: 'nip' },
                                ]}
                                actions={[
                                    {
                                        icon: test ? 'check' : 'cancel',
                                        tooltip: 'Show User Info',
                                        onClick: (event, rowData) => {
                                            alert('You clicked user ' + rowData.name)
                                        },
                                    },
                                    {
                                        icon: 'edit',
                                        tooltip: 'Show User Info',
                                        onClick: (event, rowData) => {
                                            alert('You clicked user ' + rowData.name)
                                        },
                                    },
                                    {
                                        icon: 'add',
                                        tooltip: 'Show User Info',
                                        onClick: (event, rowData) => {
                                            alert('You clicked user ' + rowData.name)
                                        },
                                    },
                                    {
                                        icon: 'delete',
                                        tooltip: 'Show User Info',
                                        onClick: (event, rowData) => {
                                            alert('You clicked user ' + rowData.name)
                                        },
                                    }
                                ]}
                                title="Firms"
                                options={{
                                    filtering: true,
                                    columnsButton: true
                                }}
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

// <MuiThemeProvider theme={theme}>
//     <div style={{ maxWidth: '100%', direction }}>
//         <Grid container>
//             <Grid item xs={12}>
//                 <MaterialTable
//                     data={[
//                         {
//                             "sid": "SX5caef77684a2692510ebd4db",
//                             "name": "PAPA1",
//                             "phyid": "status",
//                             "auto_desc": "th01 status",
//                             "parent_id": "0",
//                         },
//                         {
//                             "sid": "SX5caef77684a2692510ebd4db:TH01",
//                             "name": "TH01",
//                             "phyid": "status",
//                             "auto_desc": "th01 status",
//                             "parent_id": "SX5caef77684a2692510ebd4db",
//                         },
//                         {
//                             "sid": "SX5caef77684a2692510ebd4db:TH01:T",
//                             "name": "TH01:T",
//                             "phyid": "temperature",
//                             "auto_desc": "th01 temp",
//                             "parent_id": "SX5caef77684a2692510ebd4db:TH01",
//                         },
//                         {
//                             "sid": "SX5caef77684a2692510ebd4db:TH01:H",
//                             "name": "TH01:H",
//                             "phyid": "humidity",
//                             "auto_desc": "th01 hum",
//                             "parent_id": "SX5caef77684a2692510ebd4db:TH01",
//                         },
//
//                         {
//                             "sid": "SX5caef77684a2692510ebd4db:TH02",
//                             "name": "TH02",
//                             "phyid": "status",
//                             "auto_desc": "th02 status",
//                             "parent_id": "SX5caef77684a2692510ebd4db",
//                         },
//                         {
//                             "sid": "SX5caef77684a2692510ebd4db:TH02:T",
//                             "name": "TH02:T",
//                             "phyid": "temperature",
//                             "auto_desc": "th02 temp",
//                             "parent_id": "SX5caef77684a2692510ebd4db:TH02",
//                         },
//                         {
//                             "sid": "SX5caef77684a2692510ebd4db:TH02:H",
//                             "name": "TH02:H",
//                             "phyid": "humidity",
//                             "auto_desc": "th02 hum",
//                             "parent_id": "SX5caef77684a2692510ebd4db:TH02",
//                         },
//                         {
//                             "sid": "SX5caef77684a2692510ebd4d1",
//                             "name": "PAPA2",
//                             "phyid": "status",
//                             "auto_desc": "th01 status",
//                             "parent_id": "0",
//                         },
//                         {
//                             "sid": "SX5caef77684a2692510ebd4d1:TH01",
//                             "name": "TH01",
//                             "phyid": "status",
//                             "auto_desc": "th01 status",
//                             "parent_id": "SX5caef77684a2692510ebd4d1",
//                         },
//                         {
//                             "sid": "SX5caef77684a2692510ebd4d1:TH01:T",
//                             "name": "TH01:T",
//                             "phyid": "temperature",
//                             "auto_desc": "th01 temp",
//                             "parent_id": "SX5caef77684a2692510ebd4d1:TH01",
//                         },
//                     ]}
//                     editable={{
//                         onRowAdd: newData =>
//                             new Promise((resolve, reject) => {
//                                 setTimeout(() => {
//                                     {
//                                         /* const data = this.state.data;
//                                     data.push(newData);
//                                     this.setState({ data }, () => resolve()); */
//                                     }
//                                     resolve();
//                                 }, 1000);
//                             }),
//                         onRowUpdate: (newData, oldData) =>
//                             new Promise((resolve, reject) => {
//                                 setTimeout(() => {
//                                     {
//                                         /* const data = this.state.data;
//                                 const index = data.indexOf(oldData);
//                                 data[index] = newData;
//                                 this.setState({ data }, () => resolve()); */
//                                     }
//                                     resolve();
//                                 }, 1000);
//                             }),
//                         onRowDelete: oldData =>
//                             new Promise((resolve, reject) => {
//                                 setTimeout(() => {
//                                     {
//                                         /* let data = this.state.data;
//                                 const index = data.indexOf(oldData);
//                                 data.splice(index, 1);
//                                 this.setState({ data }, () => resolve()); */
//                                     }
//                                     resolve();
//                                 }, 1000);
//                             }),
//                     }}
//                     columns={[
//                         { title: 'sid', field: 'sid' },
//                         { title: 'name', field: 'name' },
//                         { title: 'phyid', field: 'phyid' },
//                         { title: 'auto_desc', field: 'auto_desc', removable: false },
//                     ]}
//                     title="Tree Data"
//                     // how to choose a parent for a rowData
//                     parentChildData={(row, rows) => rows.find(a => a.sid === row.parent_id)}
//                     options={{
//                         selection: false,
//                     }}
//                 />
//             </Grid>
//         </Grid>
//         <button
//             onClick={() => {
//                 this.tableRef.current.onQueryChange();
//             }}
        {/*>*/}
            {/*ok*/}
        {/*</button>*/}

    {/*</div>*/}
{/*</MuiThemeProvider>*/}
