import { useContext, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  TextField
} from '@material-ui/core';
import { withRouter } from 'react-router';
import { observer } from 'mobx-react-lite';
import { RootStoreContext } from '../../stores/rootStore';


const AccountProfileDetails = observer(({history}) => {
  
  const rootStore = useContext(RootStoreContext);
  
  const {user, editProfileValues} = rootStore.userStore;

  const [values, setValues] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });

  useEffect(() => {
    setValues(user);
  }, [user])

  const handleChange = (event) => {
    setValues({
      ...values,
      [event.target.name]: event.target.value
    });
  };

  return (
    <form
      autoComplete="off"
      noValidate
      
    >
      <Card>
        <CardHeader
          subheader="The information can be edited"
          title="Profile"
        />
        <Divider />
        <CardContent>
          <Grid
            container
            spacing={3}
          >
            <Grid
              item
              md={6}
              xs={12}
            >
              <TextField
                fullWidth
                helperText="Please specify the first name"
                label="First name"
                name="first_name"
                onChange={handleChange}
                required
                value={values.first_name}
                variant="outlined"
              />
            </Grid>
            <Grid
              item
              md={6}
              xs={12}
            >
              <TextField
                fullWidth
                label="Last name"
                name="last_name"
                onChange={handleChange}
                required
                value={values.last_name}
                variant="outlined"
              />
            </Grid>
            <Grid
              item
              md={6}
              xs={12}
            >
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                onChange={handleChange}
                required
                value={values.email}
                variant="outlined"
              />
            </Grid>
           
          </Grid>
        </CardContent>
        <Divider />
        <Box
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '15px'
          }}
        >
          <Button
            color="primary"
            variant="contained"
            onClick={() => editProfileValues(values, history)}
          >
            Save details
          </Button>
        </Box>
      </Card>
    </form>
  );
});

export default withRouter(AccountProfileDetails);
