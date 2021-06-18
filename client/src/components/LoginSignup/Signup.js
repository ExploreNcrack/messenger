import React, { useState } from "react";
import { Redirect, useHistory } from "react-router-dom";
import { connect } from "react-redux";
import {
  Grid,
  Box,
  Typography,
  Button,
  FormControl,
  TextField,
  FormHelperText,
  makeStyles,
} from "@material-ui/core";
import { register } from "../../store/utils/thunkCreators";

const useStyles = makeStyles((theme) => ({
  paper: {
    margin: theme.spacing(8, 4),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  formDiv: {
    width: "70%", 
    textAlign: "center"
  }
}));

const Login = (props) => {
  const history = useHistory();
  const { user, register } = props;
  const [formErrorMessage, setFormErrorMessage] = useState({});

  const classes = useStyles();

  const handleRegister = async (event) => {
    event.preventDefault();
    const username = event.target.username.value;
    const email = event.target.email.value;
    const password = event.target.password.value;
    const confirmPassword = event.target.confirmPassword.value;

    if (password !== confirmPassword) {
      setFormErrorMessage({ confirmPassword: "Passwords must match" });
      return;
    }

    await register({ username, email, password });
  };

  if (user.id) {
    return <Redirect to="/home" />;
  }

  return (
    <div className={classes.paper}>
      <Grid container justify="flex-end" alignItems="center">
        <Box m={4} color="text.disabled">
          <Typography px={2}>Already have an account?</Typography>
        </Box>
        <Box>
          <Button
            variant="contained"
            style={{ color: "#3A8DFF", background: "white", width: "170px" }}
            onClick={() => history.push("/login")}
          >
            Login
          </Button>
        </Box>
      </Grid>
      <Box my={5} className={classes.formDiv}>
        <Grid container my={4} justify="flex-start">
          <Typography component="h1" variant="h4">
            Create an account.
          </Typography>
        </Grid>
        <Box my={3}></Box>
        <form onSubmit={handleRegister}>
          <Grid container direction="column" spacing={5}>
            <Grid item>
              <FormControl fullWidth={true}>
                <TextField
                  aria-label="username"
                  label="Username"
                  name="username"
                  type="text"
                  required
                />
              </FormControl>
            </Grid>
            <Grid item>
              <FormControl fullWidth={true}>
                <TextField
                  label="E-mail address"
                  aria-label="e-mail address"
                  type="email"
                  name="email"
                  required
                />
              </FormControl>
            </Grid>
            <Grid item>
              <FormControl
                error={!!formErrorMessage.confirmPassword}
                fullWidth={true}
              >
                <TextField
                  aria-label="password"
                  label="Password"
                  type="password"
                  inputProps={{ minLength: 6 }}
                  name="password"
                  required
                />
                <FormHelperText>
                  {formErrorMessage.confirmPassword}
                </FormHelperText>
              </FormControl>
            </Grid>
            <Grid item>
              <FormControl
                error={!!formErrorMessage.confirmPassword}
                fullWidth={true}
              >
                <TextField
                  label="Confirm Password"
                  aria-label="confirm password"
                  type="password"
                  inputProps={{ minLength: 6 }}
                  name="confirmPassword"
                  required
                />
                <FormHelperText>
                  {formErrorMessage.confirmPassword}
                </FormHelperText>
              </FormControl>
            </Grid>
            <Box my={2} style={{ textAlign: "center" }}>
              <Button
                type="submit"
                fullWidth
                color="primary"
                variant="contained"
              >
                Create
              </Button>
            </Box>
          </Grid>
        </form>
      </Box>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    register: (credentials) => {
      dispatch(register(credentials));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
