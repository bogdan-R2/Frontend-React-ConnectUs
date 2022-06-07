import React, {useContext, useEffect, useState} from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import {Link} from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import './register.css';
import {withRouter} from 'react-router-dom';
import {observer} from "mobx-react-lite";
import {RootStoreContext} from "../../stores/rootStore";


const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.primary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

const Register = observer(({history}) => {

  const rootStore = useContext(RootStoreContext);
  const classes = useStyles();
  const [canSubmit, setCanSubmit] = useState(false);
  const {register} = rootStore.userStore;

  const [username, setUsername] = useState({
    error: false,
    errorMessage: '',
    value: ''
  });
  const [firstName, setFirstName] = useState({
    error: false,
    errorMessage: '',
    value: ''
  });
  const [lastName, setLastName] = useState({
    error: false,
    errorMessage: '',
    value: ''
  });
  const [email, setEmail] = useState({
    error: false,
    errorMessage: '',
    value: ''
  });
  const [password, setPassword] = useState({
    error: false,
    errorMessage: '',
    value: ''
  });
  const [confirmPassword, setConfirmPassword] = useState({
    error: false,
    errorMessage: '',
    value: ''
  });

  const onChange = (e) => {
    const {name, value} = e.target;
    switch (name){
      case 'firstName':
        verifyFirstName(value, setFirstName);
        break;
      case 'lastName':
        verifyLastName(value, setLastName);
        break;
      case 'email':
        verifyEmail(value, setEmail)
        break;
      case 'password':
        verifyPassword(value, setPassword);
        break;
      case 'confirmPassword':
        verifyConfirmPassword(value, setConfirmPassword);
        break;
      case 'username':
        verifyUsername(value, setUsername);
        break;
      default:
        break;
    }
  }

  useEffect(() => {
    setCanSubmit(firstName.value !== '' &&
        lastName.value !== '' &&
        email.value !== '' &&
        password.value !== '' &&
        confirmPassword.value !== ''
        &&username.value !== ''
        && !username.error
        && !firstName.error && !lastName.error
        && !email.error && !password.error
        && !confirmPassword.error);
  }, [firstName.error, firstName.value,
    lastName.error, lastName.value,
    password.error, password.value,
    email.error, email.value,
    confirmPassword.error, confirmPassword.value,
    username.error, username.value])

  const verifyUsername = (value, setFunction) => {
    let error = false;
    let errorMessage = '';

    if(value.length < 3) {
      error = true;
      errorMessage = 'Username should have at least 3 characters'
    }

    setValues(setFunction, value,error, errorMessage);
  }

  const setValues = (setFunction, value, error, errorMessage) => {
    setFunction({
      value,
      error,
      errorMessage
    });
  }

  const verifyFirstName = (value, setFunction) => {
    let error = false;
    let errorMessage = '';
    if(value.length < 3) {
      error = true;
      errorMessage = 'Invalid first name'
    }

    setValues(setFunction, value,error, errorMessage);

  }

  const verifyEmail = (value, setFunction) => {
    let error = false;
    let errorMessage = '';

    const regex = /^([a-zA-Z0-9_\-.]+)@([a-zA-Z0-9_\-.]+)\.([a-zA-Z]{2,5})$/;

    if(!regex.test(value)) {
      error = true;
      errorMessage = 'Invalid email address';
    }

    setValues(setFunction, value,error, errorMessage);
  }
  const verifyLastName = (value, setFunction) => {
    let error = false;
    let errorMessage = '';
    if(value.length < 3) {
      error = true;
      errorMessage = 'Invalid first name'
    }


    setValues(setFunction, value,error, errorMessage);
  }

  const verifyPassword = (value, setFunction) => {
    if(password.value === '' && value === '') {
      return;
    }
    let error = false;
    let errorMessage = '';
    const regex = /^(?=.*[a-z])(?=.*\d)[a-zA-Z\d]{8,}$/;

    if(!regex.test(value)) {
      error = true;
      errorMessage = 'At least 8 characters, one number, no special characters';
    }

    setValues(setFunction, value,error, errorMessage);

    if(confirmPassword.value === ''){
      return;
    }
    error = false;
    errorMessage = '';

    if(value !== confirmPassword.value) {
      error = true;
      errorMessage = 'Passwords do not match';
    }

    setValues(setConfirmPassword, confirmPassword.value,error, errorMessage);

  }

  const verifyConfirmPassword = (value, setFunction) => {
    if(confirmPassword.value === '' && value === '') {
      return;
    }
    let error = false;
    let errorMessage = '';

    if(value !== password.value) {
      error = true;
      errorMessage = 'Passwords do not match';
    }

    setValues(setFunction, value,error, errorMessage);

  }

  const submit = (e) => {
    e.preventDefault();
    const user = {
      first_name: firstName.value,
      last_name: lastName.value,
      email: email.value,
      password: password.value,
      username: username.value
    }

    register(user, history);
  }

  return (
      <Container component="main" maxWidth="xs">
        <CssBaseline/>
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon/>
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign up
          </Typography>
          <form className={classes.form} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                    value={firstName.value}
                    autoComplete="fname"
                    name="firstName"
                    variant="outlined"
                    required
                    fullWidth
                    id="firstName"
                    label="First Name"
                    autoFocus
                    error={firstName.error}
                    helperText={firstName.error ? firstName.errorMessage : ''}
                    onChange={onChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                    variant="outlined"
                    required
                    fullWidth
                    id="lastName"
                    label="Last Name"
                    name="lastName"
                    autoComplete="lname"
                    value={lastName.value}
                    error={lastName.error}
                    helperText={lastName.error ? lastName.errorMessage : ''}
                    onChange={onChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                    variant="outlined"
                    required
                    fullWidth
                    id="username"
                    label="Username"
                    name="username"
                    autoComplete="username"
                    value={username.value}
                    error={username.error}
                    helperText={username.error ? username.errorMessage : ''}
                    onChange={onChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                    variant="outlined"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    value={email.value}
                    error={email.error}
                    helperText={email.error ? email.errorMessage : ''}
                    onChange={onChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                    variant="outlined"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    value={password.value}
                    error={password.error}
                    helperText={password.error ? password.errorMessage : ''}
                    onChange={onChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                    variant="outlined"
                    required
                    fullWidth
                    name="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword.value}
                    error={confirmPassword.error}
                    helperText={confirmPassword.error ? confirmPassword.errorMessage : ''}
                    onChange={onChange}
                />
              </Grid>
            </Grid>
            <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
                disabled={!canSubmit}
                onClick={submit}
            >
              Sign Up
            </Button>
            <Grid container justify="flex-end">
              <Grid item>
                <Link to="/login">
                  Already have an account? Sign in
                </Link>
              </Grid>
            </Grid>
          </form>
        </div>
      </Container>
  )
});

export default withRouter(Register);