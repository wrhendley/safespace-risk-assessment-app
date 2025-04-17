import { Navbar,  Container } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faFacebook, faLinkedin, faGithub, faXTwitter} from '@fortawesome/free-brands-svg-icons'

function Footer(){

    return(
        <footer className='mt-5'>
            <Navbar>
                <Container>
                    <div><em>&copy; 2025 SafeSpace. All rights reserved.</em></div>
                    <div>FOLLOW US: 
                        <a className='icon-link' href='/'><FontAwesomeIcon icon={faFacebook} size='2x'/></a> 
                        <a className='icon-link' href='/'><FontAwesomeIcon icon={faLinkedin} size='2x'/></a> 
                        <a className='icon-link' href='/'><FontAwesomeIcon icon={faXTwitter} size='2x'/></a> 
                        <a className='icon-link' href='https://github.com/SafeSpace-Financial/safespace-risk-assessment-app'><FontAwesomeIcon icon={faGithub} size='2x'/></a> 
                    </div>
                </Container>
            </Navbar>
        </footer>
        )
}

export default Footer;