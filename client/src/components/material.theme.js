import {createMuiTheme} from "@material-ui/core";
// import purple from "@material-ui/core/colors/purple";

// Todo: config and use through all components
export const theme = createMuiTheme({
    palette: {
        type: 'light',
        // primary: purple,
        secondary: {
            light: '#757ce8',
            main: '#d81b60',
            dark: '#002884',
            contrastText: '#fff',
        },
    },
    typography: {
        useNextVariants: true,
    },
});
