import React from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import TextField from "@material-ui/core/TextField";
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import RefreshIcon from '@material-ui/icons/Refresh';
import IconButton from "@material-ui/core/IconButton";
import ViewColumnIcon from '@material-ui/icons/ViewColumn';
import Tooltip from "@material-ui/core/Tooltip";
import Menu from "@material-ui/core/Menu";
import Checkbox from "@material-ui/core/Checkbox";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import LinearProgress from '@material-ui/core/LinearProgress';
import { addFirmRequest, deleteFirmRequest, firmsRequest, updateFirmRequest } from "../../redux/actions";
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
		this.updateNewFirm = this.updateNewFirm.bind(this);
	}
	handleClickMenu = event => {
		this.setState({ anchorEl: event.currentTarget, columnsDialog: true, columns: this.props.columns });
	};
	handleCloseMenu = () => {
		const columns = this.state.columns;
		this.props.addRemoveColumn(columns);
		this.setState({ anchorEl: null, columnsDialog: false, columns });
	};
	handleColumnsChange = (title) => {
		let columns = this.state.columns.map((el, i, arr) => el.title === title ? arr[i] = Object.assign(el, { hidden: !el.hidden }) : el);
		this.setState({ columns });
	};
	handleClickOpen = (state) => {
		this.setState({ [state]: true });
		if (state === 'editDialog') {
			this.setState({ newFirm: this.props.selected });
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
				nip: '',
			},
		});
		validateField = (fieldName, value) => {
			const { nameValid, addressValid, emailValid, telValid, nipValid } = this.state;
			switch (fieldName) {
				case 'name':
					nameValid = value.length >= 5;
					break;
				case 'address':
					addressValid = value.length >= 5;
					break;
				case 'email':
					emailValid = value.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
					break;
				case 'tel':
					telValid = value.length >= 9;
					break;
				case 'nip':
					nipValid = value.length >= 6;
					break;
				default:
					break;
			};
			
			this.setState({
				nameValid: nameValid,
				addressValid: addressValid,
				emailValid: emailValid,
				telValid: telValid,
				nipValid: nipValid
			}, this.validateForm);
		};
		
		validateForm = () => {
			let { nameValid, addressValid, emailValid, telValid, nipValid } = this.state;
			this.setState({
				formValid: nameValid & addressValid & emailValid & telValid & nipValid
			});
		};

		updateNewFirm = (e) => {
			const { name, value } = e.target;
			const { newFirm } = this.state;
			this.setState({
				newFirm: Object.assign({}, { [name]: value })
			}, () => { this.validateField(newFirm[name], value); });
		};

		handleDeleteDevice = () => {
			this.props.deleteFirmRequest(this.props.selected._id);
			this.props.resetSelected();
			this.handleClose('confirmDeleteDialog');
		};
		handleRefresh = () => {
			this.props.firmRequest();
			this.props.resetSelected();
		};
		handleUpdateFirm = (e) => {
			this.props.updateFirmRequest(this.state.newFirm);
			this.props.resetSelected();
			this.handleClose('editDialog');
		};
		render();
		{
			let { columns, anchorEl, columnsDialog, newFirm } = this.state;
			return (<div>
				<div className="firm-toolbar">
					<div className={'title'}>
						{this.props.selected ? <h3>
							Selected {this.props.selected.name}
						</h3> : <h3>Firms</h3>}
					</div>
					<div className={'firm-controls'}>
						<div>
							<Tooltip title={'Edit selected firm'}>
								<div>
									<IconButton disabled={!this.props.selected} variant="contained" color="primary" onClick={() => this.handleClickOpen('editDialog')}>
										<EditIcon />
									</IconButton>
								</div>
							</Tooltip>
							<Dialog open={this.state.editDialog} onClose={() => this.handleClose('editDialog')} aria-labelledby="key-dialog-title" aria-describedby="alert-dialog-description">
								<DialogTitle id="alert-dialog-title">Edit firm</DialogTitle>
								<DialogContent>
									<TextField autoFocus margin="dense" id="firm-name" label="Firm name" type="text" required={true} value={newFirm.name} onChange={(e) => this.updateNewFirm(e, 'name')} fullWidth />
									<TextField autoFocus margin="dense" id="firm-address" label="Firms address" type="text" required={true} value={newFirm.address} onChange={(e) => this.updateNewFirm(e, 'address')} fullWidth />
									<TextField autoFocus margin="dense" id="firm-email" label="Firm email" type="text" required={true} value={newFirm.email} onChange={(e) => this.updateNewFirm(e, 'email')} fullWidth />
									<TextField autoFocus margin="dense" id="firm-tel" label="Firm contact number" type="text" required={true} value={newFirm.tel} onChange={(e) => this.updateNewFirm(e, 'tel')} fullWidth />
									<TextField autoFocus margin="dense" id="firm-nip" label="NIP" type="text" required={true} value={newFirm.nip} onChange={(e) => this.updateNewFirm(e, 'nip')} fullWidth />
								</DialogContent>
								<DialogActions>
									<Button variant="outlined" color="primary" disabled={!this.state.newFirm.name ||
										!this.state.newFirm.address ||
										!this.state.newFirm.email ||
										!this.state.newFirm.tel ||
										!this.state.newFirm.nip} onClick={() => this.handleUpdateFirm()}>
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
									<IconButton variant="outlined" color="primary" disabled={this.props.loading} onClick={() => this.handleClickOpen('addDialog')}>
										<AddIcon />
									</IconButton>
								</div>
							</Tooltip>
							<Dialog open={this.state.addDialog} onClose={() => this.handleClose('addDialog')} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
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
										type="tel" required={true} 
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
									<Button variant="outlined" color="primary" disabled={!this.state.newFirm.name ||
										!this.state.newFirm.address ||
										!this.state.newFirm.email ||
										!this.state.newFirm.tel ||
										!this.state.newFirm.nip} onClick={() => this.handleAddFirm()}>
										Add
                                    </Button>
									<Button onClick={() => this.handleClose('addDialog')} color="primary">
										Close
                                    </Button>
								</DialogActions>
							</Dialog>
						</div>
						<div>
							<IconButton variant="contained" color="secondary" disabled={!this.props.selected || true} onClick={() => this.handleClickOpen('confirmDeleteDialog')}>
								<DeleteIcon />
							</IconButton>
							<Dialog open={this.state.confirmDeleteDialog} onClose={() => this.handleClose('confirmDeleteDialog')} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
								<DialogTitle id="alert-dialog-title-">Delete firm</DialogTitle>
								<DialogContent>
									Confirm deletion of {this.props.selected ? this.props.selected.name : ''}
								</DialogContent>
								<DialogActions>
									<Button onClick={() => this.handleClose('confirmDeleteDialog')} color="primary">
										Close
                                    </Button>
									<Button disabled={!this.props.selected} variant="contained" color="secondary" onClick={() => this.handleDeleteDevice()}>
										Confirm
                                    </Button>
								</DialogActions>
							</Dialog>
						</div>
						<Tooltip title={'Refresh firm list'}>
							<div>
								<IconButton variant="outlined" color="primary" disabled={this.props.loading} onClick={() => this.handleRefresh()}>
									<RefreshIcon />
								</IconButton>
							</div>
						</Tooltip>
						<Tooltip title={'Show columns'}>
							<div>
								<IconButton variant="outlined" color="primary" disabled={this.props.loading} onClick={this.handleClickMenu}>
									<ViewColumnIcon />
								</IconButton>
								<Menu id="long-menu" open={columnsDialog} anchorEl={anchorEl} onClose={this.handleCloseMenu} PaperProps={{
									style: {
										maxHeight: 45 * 4.5,
										width: 250,
									},
								}}>
									<List id={'column-list'}>
										{columns && columns.map(el => (<div key={el.title}>
											<Divider dark={'true'} />
											<ListItem key={el.title} dense button disabled={el.field === 'action'} onClick={() => this.handleColumnsChange(el.title)}>
												<Checkbox checked={!el.hidden} />
												<ListItemText primary={el.title} />
											</ListItem>
										</div>))}
										<Button fullWidth={true} onClick={this.handleCloseMenu} className={'submit-button'}>
											Submit
                                        </Button>
									</List>
								</Menu>
							</div>
						</Tooltip>
					</div>
				</div>
				{this.props.loading && <div className={'progress'}>
					<LinearProgress />
				</div>}
			</div>);
		}
	};
	TestToolBar;
	propTypes = {
		selected: PropTypes.object,
		resetSelected: PropTypes.func,
		loading: PropTypes.bool,
		addRemoveColumn: PropTypes.func,
		columns: PropTypes.array
	};
	export;
	default;
	connect(, mapDispatchToProps) { }
}
(TestToolBar);
