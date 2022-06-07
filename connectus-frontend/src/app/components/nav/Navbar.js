import React, { useContext } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import { observer } from "mobx-react-lite";
import { withRouter } from "react-router-dom";
import { RootStoreContext } from "../../stores/rootStore";
import BrightnessHighRoundedIcon from '@material-ui/icons/BrightnessHighRounded';
import Brightness4RoundedIcon from '@material-ui/icons/Brightness4Rounded';
import Searchbar from './Searchbar.js';
import NotificationsIcon from '@material-ui/icons/Notifications';
import { Badge, ClickAwayListener, Paper, SvgIcon } from '@material-ui/core';
import NotificationCard from '../Notifications/NotificationCard';
import { ReactComponent as ConnectUsLogo } from './logo.svg'
import { PhotoSizeSelectActual } from '@material-ui/icons';

const drawerWidth = 240;


const Navbar = observer(({ history }) => {

    const rootStore = useContext(RootStoreContext);
    const { switchTheme, theme: Tema, friendRequests } = rootStore.userStore;

    const useStyles = makeStyles((theme) => ({
        root: {
            display: 'flex',
        },
        appBar: {
            backgroundColor: (props) =>
                Tema === 'light'
                    ? '#104080'
                    : '#212121',
            zIndex: theme.zIndex.drawer + 1,
            transition: theme.transitions.create(['width', 'margin'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
        },
        menuButton: {
            marginRight: 36,
        },
        hide: {
            display: 'none',
        },
        drawer: {
            width: drawerWidth,
            flexShrink: 0,
            whiteSpace: 'nowrap',
        },

        toolbar: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: theme.spacing(0, 1),
            // necessary for content to be below app bar
            ...theme.mixins.toolbar,
        },
        content: {
            flexGrow: 1,
            padding: theme.spacing(3),
        },
        title: {
            "&:hover": {
                cursor: 'pointer'
            }
        },
        button: {
            position: 'relative'
        },
        dropdown: {
            overflowY: 'scroll',
            position: 'absolute',
            top: 35,
            right: 0,
            zIndex: 1,
            width: '350px',
            height: '240px',
            backgroundColor: theme.palette.background.paper,
            color: 'black',
            padding: 0,
            '&::-webkit-scrollbar': {
                width: '0.4em'
            },
            '&::-webkit-scrollbar-track': {
                boxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
                webkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)'
            },
            '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0,0,0,.1)',
            }
        },

        logo:
        {
            height: 45,
            display: 'flex', justifyContent: 'center', alignItems: 'center',
        }
    }));
    const [open, setOpen] = React.useState(false);

    const classes = useStyles({ theme: 'light' });

    const handleClick = () => {
        setOpen((prev) => !prev);
    };

    const handleClickAway = () => {
        setOpen(false);
    };


    return (
        <div className={classes.root}>
            <CssBaseline />
            <AppBar
                position="fixed"
                className={clsx(classes.appBar, {
                    [classes.appBarShift]: false,
                })}
            >
                <Toolbar>

                    {/* <Typography onClick={() => history.push('/')} className={classes.title} variant="h5" noWrap>
                        
                    </Typography> */}
                    <ConnectUsLogo className={classes.logo} />

                    <Searchbar className={classes.root} />
                    <div style={{ flexGrow: 1 }}>

                    </div>
                    <ClickAwayListener
                        mouseEvent="onMouseDown"
                        touchEvent="onTouchStart"
                        onClickAway={handleClickAway}
                    >
                        <div className={classes.button}>
                            <IconButton color='inherit' onClick={handleClick}>
                                <Badge badgeContent={friendRequests.length} color="secondary">
                                    <NotificationsIcon />
                                </Badge>
                            </IconButton>
                            {open ? (
                                <Paper className={classes.dropdown} elevation={5}>
                                    {friendRequests.length > 0 ?
                                        friendRequests.map(friend =>
                                            <NotificationCard key={friend.username} friend={friend} />)
                                        : <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                                You have no friendship request
                                            </div>
                                        </div>
                                    }
                                </Paper>
                            ) : null}
                        </div>
                    </ClickAwayListener>

                    {/* <IconButton onClick={() => switchTheme()} color='inherit'>
                        {Tema === 'light' ? <Brightness4RoundedIcon  /> :
                            <BrightnessHighRoundedIcon />
                        }
                    </IconButton> */}

                </Toolbar>

            </AppBar>
        </div>
    );
});

export default withRouter(Navbar);