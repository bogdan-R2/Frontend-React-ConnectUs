import React from 'react';
import { SpinnerOverlay, SpinnerContainer } from './Spinner.styles';

const Spinner = (Component) =>
  ({ isLoading, ...other }) => {
    return isLoading ? (
      <SpinnerOverlay>
        <SpinnerContainer />
      </SpinnerOverlay>
    ) : (
      <Component {...other}/>
    )
  }
export default Spinner;