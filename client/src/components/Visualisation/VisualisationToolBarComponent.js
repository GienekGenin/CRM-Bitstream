import React from "react";
import * as PropTypes from 'prop-types';

// Material
import Button from "@material-ui/core/Button";
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from "@material-ui/core/IconButton";
import ViewColumnIcon from '@material-ui/icons/ViewColumn';
import Menu from "@material-ui/core/Menu";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import Checkbox from "@material-ui/core/Checkbox";
import ListItemText from "@material-ui/core/ListItemText";

// Redux
import {connect} from "react-redux";
import TimelineIcon from '@material-ui/icons/Timeline';
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";

const mapDispatchToProps = (dispatch) => {
    return {

    };
};

class VisualisationToolBar extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            anchorEl: null,
            columns: null,
            columnsDialog: false,
            timeDialog: false,
            loading: false
        };
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
        let columns = this.state.columns.map((el, i, arr) => el.title === title ? arr[i] = Object.assign(el, {hidden: !el.hidden}) : el);
        this.setState({columns});
    };

    handleClickOpen = (state) => {
        this.setState({[state]: true});
    };

    handleClose = (state) => {
        this.setState({
            [state]: false
        });
    };

    componentDidMount() {

    }

    handleConfigTime(){
        this.handleClose('timeDialog');
    }

    render() {
        let {anchorEl, columnsDialog, columns} = this.state;
        return (
            <div className="device-toolbar">
                <div className={'title'}>
                    {this.props.selected ? <h3>
                        Selected {this.props.selected.name}
                    </h3> : <h3>Devices</h3>}
                </div>
                <div className={'device-controls'}>
                    <div>
                        <Tooltip title={'Select time'}>
                            <div>
                                <IconButton disabled={!this.props.selectedDevices.length} variant="contained" color="primary"
                                            onClick={() => this.handleClickOpen('timeDialog')}>
                                    <TimelineIcon/>
                                </IconButton>
                            </div>
                        </Tooltip>
                        <Dialog
                            open={this.state.timeDialog}
                            onClose={() => this.handleClose('timeDialog')}
                            aria-labelledby="key-dialog-title"
                            aria-describedby="alert-dialog-description"
                        >
                            <DialogTitle id="alert-dialog-title">Config time for devices</DialogTitle>
                            <DialogContent>
                                <DialogContent>
                                    Test
                                </DialogContent>
                            </DialogContent>
                            <DialogActions>
                                <Button variant="outlined" color="primary"
                                        onClick={() => this.handleConfigTime()}>
                                    Confirm
                                </Button>
                                <Button onClick={() => this.handleClose('timeDialog')} color="primary">
                                    Close
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </div>
                    <Tooltip title={'Show columns'}>
                        <div>
                            <IconButton variant="outlined" color="primary" disabled={this.props.loading}
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
                                <List id={'column-list'} >
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
                                    <Button fullWidth={true} onClick={this.handleCloseMenu} className={'submit-button'}>
                                        Submit
                                    </Button>
                                </List>
                            </Menu>
                        </div>
                    </Tooltip>
                </div>
            </div>
        )
    }
}

VisualisationToolBar.propTypes = {
    selected: PropTypes.object,
    selectedDevices: PropTypes.array,
    loading: PropTypes.bool,
    columns: PropTypes.array,
    addRemoveColumn: PropTypes.func,
};

export default connect(null, mapDispatchToProps)(VisualisationToolBar);
