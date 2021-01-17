import React, { useContext } from 'react'
import { NavLink } from 'react-router-dom'
import { AuthContext } from '../context/auth-context'

import './NavLinks.css'

const NavLinks = (props) => {
    const auth = useContext(AuthContext)
    return (
        <ul className="nav-links">
            <li>
                <NavLink to="/" exact>
                    All users
                </NavLink>
            </li>
            {auth.isLoggedIn && (
                <React.Fragment>
                    <li>
                        <NavLink to={`/${auth.userId}/places`}>My places</NavLink>
                    </li>
                    <li>
                        <NavLink to="/places/new">Add place</NavLink>
                    </li>
                </React.Fragment>
            )}
            {!auth.isLoggedIn && (
                <li>
                    <NavLink to="/auth">Authenticate</NavLink>
                </li>
            )}
            {auth.isLoggedIn && (
                <li>
                    <NavLink to="/" onClick={auth.logout}>LOGOUT</NavLink>
                </li>
            )}
        </ul>
    )
}
export default NavLinks
