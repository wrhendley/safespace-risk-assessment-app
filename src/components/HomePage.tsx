import { Container, Button, Alert } from "react-bootstrap";
// import { TableauViz } from '@tableau/embedding-api-react';
// import LineChartOption2 from "./LineChart";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import { auth } from '../firebaseConfig';
import { useNavigate } from "react-router-dom";

function HomePage(){
    const navigate = useNavigate();

    useEffect(()=>{
        onAuthStateChanged(auth, (user) => {
            if (user) {
              // User is signed in, see docs for a list of available properties
              // https://firebase.google.com/docs/reference/js/firebase.User
                const uid = user.uid;
                // ...
                console.log("uid", uid)
            } else {
                // User is signed out
                // ...
                console.log("user is logged out")
            }
        });
    }, [])


    return (
        <Container className="p-5 my-3 rounded text-center">
            

            <h1>Let's get started!</h1>
            <p>Here's a description of our application...</p>
            <div className='text-center'>
            <Button variant="primary" className='m-3'>Continue as Guest</Button>
            <Button variant="secondary" className='m-3' onClick={()=>navigate('/register')}>Get Started</Button>
            </div>
            
            
            <h1 className="text-center mt-5">Tableau Example</h1>
            <div className='m-3'>
            {/* <TableauViz 
                src='https://public.tableau.com/shared/NWPCF5CJP?:display_count=n&:origin=viz_share_link'
                toolbar="bottom" 
                hideTabs
            /> */}
            </div>
            
        </Container>
    );
};

export default HomePage;