import React from "react";
import * as PropTypes from 'prop-types';

// Material
import classNames from 'classnames';
import {lighten} from '@material-ui/core/styles/colorManipulator';
import {withStyles} from '@material-ui/core/styles';
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from '@material-ui/icons/Delete';
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import FilterListIcon from '@material-ui/icons/FilterList';


const devicesTableToolbarStyles = theme => ({
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

let DevicesTableToolbar = props => {
    const {numSelected, classes, firm} = props;

    return (
        <Toolbar
            className={classNames(classes.root, {
                [classes.highlight]: numSelected > 0,
            })}
        >
            <div className={classes.title}>
                {numSelected > 0 ? (
                    <Typography color="inherit" variant="subtitle1">
                        {firm.name} selected
                    </Typography>
                ) : (
                    <Typography variant="h6" id="tableTitle">
                        User devices
                    </Typography>
                )}
            </div>
            <div className={classes.spacer}/>
            <div className={classes.actions}>
                {numSelected > 0 ? (
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

DevicesTableToolbar.propTypes = {
    classes: PropTypes.object.isRequired,
    numSelected: PropTypes.number.isRequired,
    firm: PropTypes.object
};

export default withStyles(devicesTableToolbarStyles)(DevicesTableToolbar);
