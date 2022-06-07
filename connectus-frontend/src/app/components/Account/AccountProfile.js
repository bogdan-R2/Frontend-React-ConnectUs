import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Divider,
  Typography
} from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { useContext, useEffect, useState } from 'react';
import { withRouter } from 'react-router';
import { toast } from 'react-toastify';
import { RootStoreContext } from '../../stores/rootStore';


const AccountProfile = observer(({history}) => {

  const rootStore = useContext(RootStoreContext);
  const [avatar, setAvatar] = useState(null);
  const {user, editProfilePicture} = rootStore.userStore;
  
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    setAvatar(user.avatar);
  }, [user.avatar]);

  const changePhoto = (e) =>{
    
    if(!e.target.files || !e.target.files[0])
      return ;

    setPhoto(e.target.files[0]);

    var reader = new FileReader();

    reader.onload = (e) => setAvatar(e.target.result);
    reader.readAsDataURL(e.target.files[0]);

    setAvatar(e.target.files[0].data);
  }


  const uploadFile = (e) => {
    e.preventDefault();
    if(photo === null) {
        toast.error('Niciun fisier selectat');
        return;
    }
    let formData = new FormData();
    formData.append('image', photo);
    editProfilePicture(formData, history);
  }

  return (
    <Card>
      <CardContent>
        <Box
          style={{
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Avatar
            src={avatar}
            style={{
              height: 100,
              width: 100
            }}
          />
          <Typography
            color="textPrimary"
            gutterBottom
            variant="h3"
          >
            {user.first_name + ' ' + user.last_name}
          </Typography>
          <Typography
            color="textSecondary"
            variant="body1"
          >
            {`Bucharest Romania`}
          </Typography>
          <Typography
            color="textSecondary"
            variant="body1"
          >
            07:47 PM GTM-7
        </Typography>
        </Box>
      </CardContent>
      <Divider />
      <CardActions>
      <label htmlFor="upload-photo" style={{width:'100%'}}>
        <input
          style={{ display: 'none' }}
          id="upload-photo"
          name="upload-photo"
          type="file"
          accept="image/x-png,image/gif,image/jpeg"
          onChange={changePhoto}
        />

        <Button color="primary" variant="text" fullWidth component="span">
          Upload Picture
        </Button>
      </label>
      <Button
          color="primary"
          fullWidth
          variant="text"
          onClick={uploadFile}
        >
          Save picture
      </Button>
      </CardActions>
    </Card>
  )
});


export default withRouter(AccountProfile);
