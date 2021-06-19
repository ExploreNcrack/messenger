import React from "react";
import { Redirect, useHistory } from "react-router-dom";
import { connect } from "react-redux";
import {
  Grid,
  Box,
  Typography,
  Button,
  FormControl,
  TextField,
  makeStyles,
} from "@material-ui/core";
import { login } from "../../store/utils/thunkCreators";

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
  },
  linkButton: {
    color: "#3A8DFF", 
    background: "white", 
    width: "192px"
  }
}));

const Login = (props) => {
  const history = useHistory();
  const { user, login } = props;

  const classes = useStyles();

  const handleLogin = async (event) => {
    event.preventDefault();
    const username = event.target.username.value;
    const password = event.target.password.value;

    await login({ username, password });
  };

  if (user.id) {
    return <Redirect to="/home" />;
  }

  return (
    <div className={classes.paper}>
      <Grid container justify="flex-end" alignItems="center">
        <Box m={4} color="text.disabled">
          <Typography px={2}>Don't have an account?</Typography>
        </Box>
        <Box>
          <Button
            variant="contained"
            className={classes.linkButton}
            onClick={() => history.push("/register")}
          >
            Create account
          </Button>
        </Box>
      </Grid>
      <Box my={5} className={classes.formDiv}>
        <Grid container my={4} justify="flex-start">
          <Typography component="h1" variant="h4">
            Welcome back!
          </Typography>
        </Grid>
        <Box my={3}></Box>
        <form onSubmit={handleLogin}>
          <Grid container direction="column" spacing={5}>
            <Grid item>
              <FormControl fullWidth={true} margin="normal" required>
                <TextField
                  aria-label="username"
                  label="Username"
                  name="username"
                  type="text"
                />
              </FormControl>
            </Grid>
            <Grid item>
              <FormControl fullWidth={true} margin="normal" required>
                <TextField
                  label="password"
                  aria-label="password"
                  type="password"
                  name="password"
                />
              </FormControl>
            </Grid>
            <Box my={2} style={{ textAlign: "center" }}>
              <Button
                type="submit"
                fullWidth
                color="primary"
                variant="contained"
              >
                Login
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
    login: (credentials) => {
      dispatch(login(credentials));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
