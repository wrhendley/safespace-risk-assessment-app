import { Navbar,  Container } from 'react-bootstrap';

function Footer(){

    return(
        <footer className='mt-5'>
            <Navbar>
                <Container>
                    <div><em>&copy; 2025 Elizabeth Yates. All rights reserved.</em></div>
                    <div><a href={'mailto:ecyates1@mac.com'}>Email</a>  |  <a href={'tel:5037810970'}>Phone</a>  |  <a href={'https://www.linkedin.com/in/ecyates/'}>LinkedIn</a>  |  <a href={'https://github.com/ecyates'}>GitHub</a></div>
                </Container>
            </Navbar>
        </footer>
        )
}

export default Footer;