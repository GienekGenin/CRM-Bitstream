import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import './StepperDocumentation.scss';

const useStyles = makeStyles(theme => ({
    root: {
        width: '100%',
    },
    stepper: {
        borderColor: '#008DD2',
        borderBottom: '3px solid #008DD2',
    },
    backButton: {
        marginRight: theme.spacing(1),
    },
    doneButton: {
        backgroundColor: 'green',
        color: 'white',
        marginLeft: theme.spacing(1),
        "&:hover": {
            backgroundColor: "darkgreen"
        }
    },
    instructions: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
    },
    content: {
        display: 'flex',
        justifyContent: 'center',
    }
}));

const getSteps = () => {
    return ['Step 1', 'Step 2', 'Step 3', 'Step 4', 'Step 5', 'Step 6' ];
}

const getStepContent = (stepIndex) => {
    switch (stepIndex) {
        case 0:
            return '1Select campaign settings... '; // jsx array [img, text]
        case 1:
            return '2What is an ad group anyways?';
        case 2:
            return '3This is the bit I really care about!';
        case 3:
            return '4This is the bit care about!';
        case 4:
            return '5This is really care';
        case 5:
            return '6This is really care';
        default:
            return '7Uknown stepIndex';
    }
}

export default function StepperDocumentation() {
        const classes = useStyles();
        const [activeStep, setActiveStep] = React.useState(0);
        const steps = getSteps();

        function handleNext() {
            setActiveStep(prevActiveStep => prevActiveStep + 1);
        }

        function handleBack() {
            setActiveStep(prevActiveStep => prevActiveStep - 1);
        }

        function handleReset() {
            setActiveStep(0);
        }

        return (
            <div className={classes.root}>
                <Stepper
                    className={classes.stepper}
                    activeStep={activeStep}
                    alternativeLabel>
                    {steps.map(label => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
                <div className={classes.content}>
                    {activeStep === steps.length ? (
                        <div>
                            <Typography className={classes.instructions}>All steps completed</Typography>
                            <Button
                                className={classes.doneButton}
                                onClick={handleReset}>Done</Button>
                        </div>
                    ) : (
                        <div>
                            <Typography className={classes.instructions}>
                                {getStepContent(activeStep)}
                            </Typography>
                            <div>
                                <Button
                                    disabled={activeStep === 0}
                                    onClick={handleBack}
                                    className={classes.backButton}
                                >
                                    Back
                                </Button>
                                <Button variant="contained" color="primary" onClick={handleNext}>
                                    {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
}

