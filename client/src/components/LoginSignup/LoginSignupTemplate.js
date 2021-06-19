import {
  Grid,
  Typography,
  makeStyles,
  Paper,
  Hidden,
} from "@material-ui/core";
import Signup from "./Signup";
import Login from "./Login";


const useStyles = makeStyles((theme) => ({
  root: {
    height: '100vh',
  },
  chatIconDiv: {
    textAlign: 'center',
    marginTop: '21vh'
  },
  chatIcon: {
    margin: '3rem',
    height: '90px'
  },
  titleFontDiv: {
    textAlign: 'center',
  },
  titleFont: {
    margin: 'auto',
    width: '65%',
    textAlign: 'center',
    color: 'white',
    fontSize: '27pt'
  },
  image: {
    backgroundImage: 'linear-gradient(to bottom, rgb(58, 141, 255, 0.85), rgb(134, 185, 255, 0.85)), url("/images/bg-img.png")',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  rightDiv: {
    height: '100%'
  },
}))

const Template = (props) => {
    const classes = useStyles();

  return (
    <Grid container component="main" justify="center" className={classes.root} >
      <Grid container item spacing={0} xs={false} sm={5} md={4} className={classes.image} >
        <Hidden smDown>
          <Grid item xs={false} sm={12} className={classes.chatIconDiv}>
            <img className={classes.chatIcon} src="/images/bubble.svg" alt="chat icon" />
            <Typography  sm={12} className={classes.titleFont}>Converse with anyone with any language</Typography>
          </Grid>
        </Hidden>
      </Grid>
      <Grid container item direction="column" xs={12} sm={12} md={6} lg={6} component={Paper} elevation={6} square justify="flex-start" className={classes.rightDiv}>
            { props.page === "signup" ?  <Signup /> : <Login />}
      </Grid>
    </Grid>
  );
};

export default Template;
