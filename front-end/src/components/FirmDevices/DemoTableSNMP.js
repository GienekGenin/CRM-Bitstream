import React from "react";
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

const StyledTableCell = withStyles(theme => ({
    head: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
    },
    body: {
        fontSize: 14,
    },
}))(TableCell);

const StyledTableRow = withStyles(theme => ({
    root: {
        '&:nth-of-type(odd)': {
            backgroundColor: theme.palette.background.default,
        },
    },
}))(TableRow);

function createData(name, info) {
    return { name, info };
}

const generals = [
    createData('Network State:', 'Online'),
    createData('Last Message:', '2019-08-07, 11:48:35.045037'),
    createData('Device Type:', 'Boundary Clock'),
    createData('PTP State:', 'Master'),
    createData('Transmission Type:', 'Multicast'),
    createData('Clock ID:', '0x0050C2FFFE0E33A5'),
    createData('Address:', '00:50:C2:0E:33:A5'),
    createData('VLAN:', '-'),
    createData('Transport Protocol:', 'Layer 2 (ETH)'),
    createData('Subdomain Number:', 12),
    createData('Grandmaster ID:', '-'),
    createData('Announce Messages:', '13 (1,00/sec)'),
    createData('Sync messages:', '13 (1,00/sec)'),
    createData('Follow Up Messages:', '13 (1,00/sec)'),
    createData('Delay Mechanism:', 'N/A'),
    createData('Delay Requests:', '0 (0,00/sec)'),
    createData('Delay Responses:', '0 (0,00/sec)'),
    createData('Singnalling Messages:', 0),
];

const announces = [
    createData('Receive Time:', '2019-08-07, 11:48:35.045036'),
    createData('PTP Version:', 2),
    createData('Message Length:', 86),
    createData('Subdomain:', 12),
    createData('Flags:', '0000000001000'),
    createData('Correction:', '0.000000 ns'),
    createData('Clock ID:', '0x0050C2FFFE0E33A5'),
    createData('Source Port ID:', 4),
    createData('Sequence ID:', '5198'),
    createData('Control:', 'Other (5)'),
    createData('Log Message Period:', 0),
    createData('Origin Timestamp (sec):', '17514'),
    createData('Origin Timestamp (ns):', '6448880280'),
    createData('Current UTC Offset:', 0),
    createData('Priority 1:', '128'),
    createData('Grandmaster Clock Class:', 251),
    createData('Grandmaster Clock Accuracy:', 'Unknown(0xFE'),
    createData('Grandmaster Clock Variance:', 65535),
    createData('Priority 2:', 128),
    createData('Grandmaster Clock ID:', '0x0050C2FFFE0E33A5'),
    createData('Local Steps Removed:', 0),
    createData('Time Source:', 'Internal Oscillator(0xA0'),
];

const syncs = [
    createData('Receive Time:', '2019-08-07, 11:48:35.045071'),
    createData('PTP Version:', 2),
    createData('Message Length:', 44),
    createData('Flags:', '0000000001000'),
    createData('Correction:', '0.000000 ns'),
    createData('Clock ID:', '0x0050C2FFFE0E33A5'),
    createData('Source Port ID:', 4),
    createData('Squence ID:', 5198),
    createData('Control:', 'Sync (0)'),
    createData('Log Message Period:', 0),
    createData('Origin Timestamp (sec):', 0),
    createData('Origin Timestamp (ns):', 0),
];

const follows = [
    createData('Receive Time:', '2019-08-07, 11:48:35.045071'),
    createData('PTP Version:', 2),
    createData('Message Length:', 44),
    createData('Subdomain:', 12),
    createData('Flags:', '0000000001000'),
    createData('Correction:', '0.000000 ns'),
    createData('Clock ID:', '0x0050C2FFFE0E33A5'),
    createData('Source Port ID:', 4),
    createData('Squence ID:', 5198),
    createData('Control:', 'Follow up (2)'),
    createData('Log Message Period:', 0),
    createData('Origin Timestamp (sec):', 17514),
    createData('Origin Timestamp (ns):', 624997756),
]

const useStyles = makeStyles(theme => ({
    root: {
        width: '100%',
        marginTop: theme.spacing(3),
        overflowX: 'auto',
    },
    table: {
        minWidth: 600,
    },
}));

export default function TableSNMP() {
    const classes = useStyles();

    return (
        <Paper className={classes.root}>
            <Table className={classes.table}>
                <TableHead>
                    <TableRow>
                        <StyledTableCell>General Info</StyledTableCell>
                        <StyledTableCell></StyledTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {generals.map(general => (
                        <StyledTableRow key={general.name}>
                            <StyledTableCell component="th" scope="row">
                                {general.name}
                            </StyledTableCell>
                            <StyledTableCell align="center">{general.info}</StyledTableCell>
                        </StyledTableRow>
                    ))}
                </TableBody>
            </Table>
            <Table className={classes.table}>
                <TableHead>
                    <TableRow>
                        <StyledTableCell>Announces</StyledTableCell>
                        <StyledTableCell></StyledTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {announces.map(announce => (
                        <StyledTableRow key={announce.name}>
                            <StyledTableCell component="th" scope="row">
                                {announce.name}
                            </StyledTableCell>
                            <StyledTableCell align="center">{announce.info}</StyledTableCell>
                        </StyledTableRow>
                    ))}
                </TableBody>
            </Table>
            <Table className={classes.table}>
                <TableHead>
                    <TableRow>
                        <StyledTableCell>Syncs</StyledTableCell>
                        <StyledTableCell></StyledTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {syncs.map(sync => (
                        <StyledTableRow key={sync.name}>
                            <StyledTableCell component="th" scope="row">
                                {sync.name}
                            </StyledTableCell>
                            <StyledTableCell align="center">{sync.info}</StyledTableCell>
                        </StyledTableRow>
                    ))}
                </TableBody>
            </Table>
            <Table className={classes.table}>
                <TableHead>
                    <TableRow>
                        <StyledTableCell>Follow ups</StyledTableCell>
                        <StyledTableCell></StyledTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {follows.map(follow => (
                        <StyledTableRow key={follow.name}>
                            <StyledTableCell component="th" scope="row">
                                {follow.name}
                            </StyledTableCell>
                            <StyledTableCell align="center">{follow.info}</StyledTableCell>
                        </StyledTableRow>
                    ))}
                </TableBody>
            </Table>
        </Paper>
    );
}