import {
  Box,
  Container,
  Grid
} from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { useContext } from 'react';
import { RootStoreContext } from '../../stores/rootStore';
import AccountProfile from './AccountProfile';
import AccountProfileDetails from './AccountProfileDetails';

const Account = observer(() => {
  const rootStore = useContext(RootStoreContext);
  const {user} = rootStore.userStore;

  return (
    <>
      <Box
        sx={{
          backgroundColor: 'background.default',
          minHeight: '100%',
          py: 3
        }}
      >
        <Container maxWidth="lg">
          <Grid
            container
            spacing={3}
          >
            <Grid
              item
              lg={4}
              md={6}
              xs={12}
            >
              <AccountProfile user={user} />
            </Grid>
            <Grid
              item
              lg={8}
              md={6}
              xs={12}
            >
              <AccountProfileDetails user={user}/>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  )
});

export default Account;
