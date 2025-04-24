import { Container} from 'react-bootstrap';
import React from 'react';

function LoadingPage(){

    return(
        <>
        <Container className="p-5 my-5 rounded text-center">
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner" role="status">
                <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        </Container>
        </>

    )
}

export default LoadingPage;