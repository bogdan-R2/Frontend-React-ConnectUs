import React, { useContext, useState} from 'react';
import InputBase from '@material-ui/core/InputBase';
import {fade} from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import {makeStyles} from '@material-ui/core/styles';
import {RootStoreContext} from "../../stores/rootStore";
import { observer } from 'mobx-react-lite';
import {withRouter} from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
    search: {
        position: 'relative',
        borderRadius: theme.shape.borderRadius,
        backgroundColor: fade(theme.palette.common.white, 0.15),
        '&:hover': {
          backgroundColor: fade(theme.palette.common.white, 0.25),
        },
        marginRight: theme.spacing(0),
        marginLeft: 0,
        width: '100%',
        [theme.breakpoints.up('sm')]: {
          marginLeft: theme.spacing(3),
          width: 'auto',
        },
      },
      searchIcon: {
        padding: theme.spacing(0, 1),
        height: '100%',
        position: 'absolute',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
      inputRoot: {
        color: 'inherit',
      },
      inputInput: {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
          width: '20ch',
        },
      },
    }));

const Searchbar = observer(({history}) =>  {
const classes = useStyles();
const [searchName, setSearchName] = useState('');
const rootStore = useContext(RootStoreContext);
const {search} = rootStore.userStore;

const searchUsers = (e) => {
  e.preventDefault();
  // if(searchName.length < 3) {
  //   toast.error('Please type at least 2 characters');
  //   return;
  // }
  search({search: searchName}, history);
}

return ( 
    <div className={classes.search}>
            <div className={classes.searchIcon}>
              <SearchIcon />
            </div>
            <InputBase
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              onKeyPress={(e) => {
                if (e.charCode === 13) {
                  searchUsers(e)
                }
              }}
              placeholder="Search users..."
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput,
              }}
              inputProps={{ 'aria-label': 'search' }}
            />
          </div>
        );
});

export default withRouter(Searchbar);    