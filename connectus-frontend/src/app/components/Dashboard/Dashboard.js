import React, { useEffect, useState, useContext } from "react";
import { observer } from "mobx-react-lite";
import { User } from "../../api/agent";
import Postare from "../Postari/Postare";
import { RootStoreContext } from '../../stores/rootStore';
import { Button, Paper, Divider, CardActions } from "@material-ui/core";
import AddIcon from '@material-ui/icons/Add';
import Modal from '@material-ui/core/Modal';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';

const Dashboard = observer(({ history }) => {
    const [posts, setPosts] = useState([])
    const [open, setOpen] = useState(false);
    const [photo, setPhoto] = useState(null);
    const [avatar, setAvatar] = useState(null);
    const [text, setText] = useState('');

    const changePhoto = (e) => {

        if (!e.target.files || !e.target.files[0])
            return;

        setPhoto(e.target.files[0]);

        var reader = new FileReader();

        reader.onload = (e) => setAvatar(e.target.result);
        reader.readAsDataURL(e.target.files[0]);

        setAvatar(e.target.files[0].data);
    }

    const uploadFile = (e) => {
        e.preventDefault();
        let formData = new FormData();
        formData.append('image', photo);
        formData.append('text', text);
        User.post(formData).then(response => {
            setAvatar(null);
            setPhoto(null);
            setText('');
            handleClose();
        }).catch(err => {
            console.log(err);
        });
    }

    const handleOpen = () => {
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
    }

    const rootStore = useContext(RootStoreContext);
    const { user } = rootStore.userStore;
    useEffect(() => {
        User.getNewsfeed().then(resp => {
            setPosts(resp.data);
        });
    }, []);

    const removePhoto = () => {
        setAvatar(null);
        setPhoto(null);
    }
    return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: '30px' }}>
            <Button style={{ position: 'fixed', left: '275px' }} onClick={handleOpen} variant="contained" startIcon={<AddIcon color="action" />}>Create post</Button>
            <Modal open={open} onClose={handleClose} >
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <Paper elevation={10}>
                        <TextareaAutosize
                            rowsMin={3}

                            value={text} onChange={(e) => setText(e.target.value)}
                            style={{ outline: 'none', border: 'none', width: '500px', resize: 'none' }}
                            maxLength="1000"

                        />
                        {/* <textarea maxLength="1000" 
                            style={{ width: '500px', height: '250px', resize: 'none', border: 'none', outline: 'none' }}></textarea> */}
                        <Divider />
                        {avatar && <img width="500px" max-height='500px' src={avatar} onClick={() => removePhoto()} style={{ cursor: 'pointer' }} />}
                        <CardActions>
                            <label htmlFor="upload-photo" style={{ width: '100%' }}>
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
                                Post
                        </Button>
                        </CardActions>
                    </Paper>
                </div>

            </Modal>
            <div style={{ height: '1000px', display: 'flex', flexDirection: 'column' }}>
                {posts.map(post => (<Postare key={post.post_id} postare={post} history={history} user={user} />))}

            </div>
        </div >
    )
});

export default Dashboard;