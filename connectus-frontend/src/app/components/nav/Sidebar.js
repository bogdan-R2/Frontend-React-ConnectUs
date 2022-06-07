import React, { useContext, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import Container from '@material-ui/core/Container'
import HomeIcon from '@material-ui/icons/Home';
import GroupIcon from '@material-ui/icons/Group';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import ControlPointIcon from '@material-ui/icons/ControlPoint';
import { withRouter } from "react-router-dom";
import { RootStoreContext } from "../../stores/rootStore";
import { observer } from "mobx-react-lite";
import SettingsIcon from '@material-ui/icons/Settings';
const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex', textAlign: 'center'
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerContainer: {
    overflow: 'auto',
  },
  content: {
    flexGrow: 1,
    padding: 0
  },

  zero_padding: {
    padding: 0,
    display: 'flex',
    justifyContent: 'center'

  },
  avatar_large: {
    justifyContent: "center", display: "flex",
    width: theme.spacing(8),
    height: theme.spacing(8),
  },
  font: {
    fontFamily: 'Roboto',
    fontWeight: "bold"
  },
}));

const Sidebar = observer(({ history, location }) => {
  const classes = useStyles();
  const rootStore = useContext(RootStoreContext);
  const { user, logout } = rootStore.userStore;
  const [selectedRoute, setSelectedRoute] = useState('/');

  useEffect(() => {
    setSelectedRoute(location.pathname);
  }, [location])

  return (
    <div className={classes.root}>
      <CssBaseline />
      <Drawer
        className={classes.drawer}
        variant="permanent"
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <Toolbar style={{ padding: '0' }} />
        <div className={classes.drawerContainer}>
          <br />
          <Container className={classes.zero_padding}>
            <Avatar style={{cursor: 'pointer'}} onClick={() => {history.push(`/profile/${user.username}`)}} alt={user.first_name + " " + user.last_name} src={user.avatar || ''} className={classes.avatar_large} >
              {(user.first_name[0] + user.last_name[0]).toUpperCase()}
            </Avatar>
          </Container>
          <Typography className={classes.font} component="h3">
            {user.first_name + " " + user.last_name}
          </Typography>
          <Typography variant="body2" component="p">
            {user.username}
          </Typography>
          <br />
          <Divider />
          <List>
            <ListItem button key={'newsfeed'} onClick={() => history.push('/newsfeed')} selected={selectedRoute === '/newsfeed'}>
              <ListItemIcon><HomeIcon /></ListItemIcon>
              <ListItemText primary={'Newsfeed'} />
            </ListItem>
            <ListItem button key={'friends'} onClick={() => history.push('/friends')} selected={selectedRoute === '/friends'}>
              <ListItemIcon> <GroupIcon /></ListItemIcon>
              <ListItemText primary={'Friends'} />
            </ListItem>
           
            <Divider />
            <ListItem button key={'editprofile'} onClick={() => history.push('/profile/edit')} selected={selectedRoute === '/profile/edit'}>
              <ListItemIcon> <SettingsIcon /></ListItemIcon>
              <ListItemText primary={'Edit Profile'} />
            </ListItem>
            <ListItem button key={'logout'} onClick={() => logout(history)} >
              <ListItemIcon><ExitToAppIcon /></ListItemIcon>
              <ListItemText primary={'Logout'} />
            </ListItem>
          </List>
        </div>
      </Drawer>
      <main className={classes.content}>
        {/* <Toolbar /> */}
      </main>
    </div>
  );
});

export default withRouter(Sidebar);