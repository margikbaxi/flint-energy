import React, {useState, useEffect} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Stepper, Step, Button, Typography, StepLabel, Grid, Box } from '@material-ui/core';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import CustomDesign from './customizeDesign';
import InfoDetails from  "./infoDetails";
import SystemFinance from  "./systemFinance";
import SystemSummary from  "./systemSummary";
import {postSystemDetails} from "../service/services";
import messages from "../../messages";

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  button: {
    marginRight: theme.spacing(1),
  },
  completed: {
    display: 'inline-block',
  },
  stepContent: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    textAlign : 'center'
  },
  stepBtnContainer : {
    textAlign : 'center'
  },
  steperRoot : {
    [theme.breakpoints.up('sm')]: {
      border : '1px solid #c0cecd',
      borderRadius : '13px',
      padding : '16px 16px 30px 16px',
    }
  },
  box : {
    background : 'white'
  }
}));

function getSteps() {
  return ['Customize your Design', 'Enter Your Details', 'Choose Your Finance' , 'System Summary'];
}

function getStepContent(step) {
  switch (step) {
    case 0:
      return <CustomDesign />;
    case 1:
      return <InfoDetails/>;
    case 2:
      return <SystemFinance/>;
      case 3:
      return <SystemSummary/>;
    default:
      return '';
  }
}

const checkObject = (obj) => {
  for(let key in obj){
    if(!obj[key]) return false;
  }
  return true;
}

export default function HorizontalLinearStepper() {
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set());
  const steps = getSteps();
  
  const [systemDesign, setSystemDesign] = useState({
    systemSize: '',
    structure: '',
    solar: '',
    avgbill: ''
  });
  const [personalDetails, setPersonalDetails] = useState({
    firstName : '',
    lastName : '',
    email : '',
    address : '',
    pincode : '',
    electricityProvider : '',
    state: '',
    district: ''
  });
  const [financeDetails, setFinanceDetails] = useState({
    payment: '',
    panNo: '',
    dob: ''
  });


  const isStepOptional = (step) => {
    return step === 0;
  };

  const isStepSkipped = (step) => {
    return skipped.has(step);
  };

  // API Inovking
  const apiHandler = async () => {
    console.log("requested")
    toast.info(messages.FORM_SUBMITING)
    try{
      let res;
      if(activeStep === 0){
        res = await postSystemDetails(activeStep, systemDesign)
      }else if(activeStep === 1){
        res = await postSystemDetails(activeStep, personalDetails)
      }else if(activeStep === 2){
        res = await postSystemDetails(activeStep, financeDetails)
      }else{
        // res = await
      }
      console.log(activeStep + " " + res);
      if(res.stauts === 200) toast.done(messages.FORM_SUBMIT_SUCCESS);
    }catch (err) {
      toast.error(messages.FORM_SUBMIT_UNSUCCESS);
      throw err;
    }
  }

  const handleNext = async () => {
    console.log("in handleNext")
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    try{
      console.log("calling apiHandler")
      await apiHandler();
    }catch (err) {
      return;
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      // You probably want to guard against something like this,
      // it should never occur unless someone's actively trying to break something.
      throw new Error("You can't skip a step that isn't optional.");
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <div className={classes.root}>
      <ToastContainer />
      <Stepper activeStep={activeStep}>
        {steps.map((label, index) => {
          const stepProps = {};
          const labelProps = {};
          if (isStepSkipped(index)) {
            stepProps.completed = false;
          }
          return (
            <Step key={label} {...stepProps}>
              <StepLabel {...labelProps}>{label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
      <div className={classes.steperRoot}>
        {activeStep === steps.length ? (
          <div>
            <Typography className={classes.instructions}>
              All steps completed - you&apos;re finished
            </Typography>
            <Button onClick={handleReset} className={classes.button}>
              Reset
            </Button>
          </div>
        ) : (
          <Grid container spacing={4} className={classes.container} direction="column">
            <Grid xs={12} item  sm={12} md={12} className={classes.stepContent} >
                 <Box className={classes.box}>
                   {activeStep === 0 && <CustomDesign handler={(obj) => setSystemDesign(obj)} />}
                   {activeStep === 1 && <InfoDetails handler={(obj) => setPersonalDetails(obj)} />}
                   {activeStep === 2 && <SystemFinance handler={(obj) => setFinanceDetails(obj)} />}
                   {activeStep === 3 && <SystemSummary />}
                 </Box>
              </Grid>
              <Grid xs={12} item  sm={12} md={12} className={classes.stepBtnContainer} >
              <div>
                    <Button disabled={activeStep === 0} onClick={handleBack} className={classes.button}>
                      Back
                    </Button>
                  
                   {activeStep < steps.length-1  &&
                    <Button
                        // disabled={
                          // !((activeStep === 0 && checkObject(systemDesign) ) ||
                          // (activeStep === 1 && checkObject(personalDetails)) ||
                          // (activeStep === 2 && checkObject(financeDetails)))
                        // }
                      variant="contained"
                      color="primary"
                      onClick={handleNext}
                      className={classes.button}
                    >
                     Next
                    </Button>
                  }
            </div>
            </Grid>
            </Grid>
           
        )}
      </div>
    </div>
  );
}