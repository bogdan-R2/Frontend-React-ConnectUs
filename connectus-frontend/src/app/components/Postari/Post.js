import {
    Avatar,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Container,
    Divider,
    Typography,
    Grid,
    CardHeader,
    IconButton,
    TextField
} from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { useContext, useEffect, useState } from 'react';
import { withRouter } from 'react-router';
import { toast } from 'react-toastify';
import { RootStoreContext } from '../../stores/rootStore';

const Post = () => {
    return (
        <div style={{ width: "35%" }}>
            <Card>
                <CardHeader

                    action={
                        <IconButton aria-label="settings">
                        </IconButton>
                    }
                    title="Create a new post"
                    subheader="Add text"
                />
                <Divider />
                <TextField
                    placeholder="Insert text here"
                    multiline
                    rows={2}
                    rowsMax={4}
                    style={{ width: 2000 }}
                />
            </Card >
        </div>
    )
}

export default Post
