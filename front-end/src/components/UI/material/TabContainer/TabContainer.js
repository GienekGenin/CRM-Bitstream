import Typography from "@material-ui/core/Typography";
import PropTypes from "prop-types";
import React from "react";

export const TabContainer = (props) => {
    return (
        <Typography component="div" style={{padding: 8 * 3}}>
            {props.children}
        </Typography>
    );
};

TabContainer.propTypes = {
    children: PropTypes.node.isRequired,
};
