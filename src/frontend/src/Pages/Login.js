import React, { Component } from "react";
import swal from "sweetalert";
import { Button, TextField, Link, Typography, Container } from "@material-ui/core";
import { withRouter } from "../utils";
import Header from "../Header1";
import '../Styles/Register.css'; // Import custom CSS file for register page styling
const axios = require("axios");

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username_or_email: '',
      password: '',
      activeTab: 'patient', // Default active tab
      isGoogleScriptLoaded: false,
      errors: {}, // Add errors state to handle form validation errors
    };
  }

  componentDidMount() {
    // Load the Google Identity Services library
    this.loadGoogleScript();
  }

  loadGoogleScript = () => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = this.onGoogleScriptLoad;
    document.body.appendChild(script);
  }

  onGoogleScriptLoad = () => {
    this.setState({ isGoogleScriptLoaded: true });
    this.initializeGoogleSignIn();
  }

  initializeGoogleSignIn = () => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID, // Replace with your actual client ID
        callback: this.handleCredentialResponse,
      });
      window.google.accounts.id.renderButton(
        document.getElementById("google-signin-button"),
        { theme: "outline", size: "large" } // Customization attributes
      );
    }
  }

  handleCredentialResponse = (response) => {
    const idToken = response.credential;
  
    axios.post(`${process.env.REACT_APP_API_BASE_URL}/app4/google-signup-login`, null, {
      params: {
        id_token: idToken
      },
      headers: {
        'Content-Type': 'application/json' // Ensure Content-Type is application/json
      }
    }).then(res => {
      // Handle successful login
      const { access_token, user } = res.data;
  
      localStorage.setItem('token', access_token);
      localStorage.setItem('user_id', user.id);
      localStorage.setItem('username', user.username);
      localStorage.setItem('phone', user.phone);
      localStorage.setItem('email', user.email);
      localStorage.setItem('user_type', user.user_type);
      localStorage.setItem('loggedIn', 'true'); // Set flag indicating user is logged in
      
      if (user.user_type === "patient") {
        this.props.navigate("/HomeDashboard", { state: { username: user.username, email: user.email, phone: user.phone } });
      } else if (user.user_type === "doctor") {
        this.props.navigate("/DoctorDashboard", { state: { username: user.username, email: user.email, phone: user.phone } });
      } else {
        // Handle other user types if needed
      }
    }).catch(err => {
      console.error('Google Sign-In failed:', err);
      swal({
        text: 'Google Sign-In failed. Please try again.',
        icon: "error",
      });
    });
  }

  validateForm = () => {
    const errors = {};
    if (!this.state.username_or_email) {
      errors.username_or_email = 'Username or email is required';
    }
    if (!this.state.password) {
      errors.password = 'Password is required';
    }
    return errors;
  }

  onChange = (e) => this.setState({ [e.target.name]: e.target.value });

  login = () => {
    const { username_or_email, password } = this.state;
    const errors = this.validateForm();
  
    if (Object.keys(errors).length > 0) {
      this.setState({ errors });
      return;
    }

    axios.post(`${process.env.REACT_APP_API_BASE_URL}/login/`, {
      username_or_email: username_or_email,
      password: password,
    }, {
      headers: {
        'Content-Type': 'application/json' // Ensure Content-Type is application/json
      }
    }).then((res) => {
      const { access_token, user } = res.data;
  
      localStorage.setItem('token', access_token);
      localStorage.setItem('user_id', user.id);
      localStorage.setItem('username', user.username);
      localStorage.setItem('phone', user.phone);
      localStorage.setItem('email', user.email);
      localStorage.setItem('user_type', user.user_type);
      localStorage.setItem('loggedIn', 'true');
  
      if (user.user_type === "patient") {
        this.props.navigate("/HomeDashboard", { state: { username: user.username, email: user.email, phone: user.phone } });
      } else if (user.user_type === "doctor") {
        this.props.navigate("/DoctorDashboard", { state: { username: user.username, email: user.email, phone: user.phone } });
      } else {
        // Handle other user types if needed
      }
    }).catch((err) => {
      if (err.response && err.response.data && err.response.data.errorMessage) {
        swal({
          text: err.response.data.errorMessage,
          icon: "error",
        });
      } else {
        swal({
          text: 'Login failed. Please try again later.',
          icon: "error",
        });
      }
    });
  }

  render() {
    const { activeTab, isGoogleScriptLoaded, errors } = this.state;

    return (
      <div className="login-register-container">
        <Header />
        <Container maxWidth="sm" className="login-register-form-container">
          <Typography variant="h6" gutterBottom className="login-register-title">
            Sign In
          </Typography>
          <div className="login-register-tab-container">
            <div
              className={`login-register-tab ${activeTab === 'patient' ? 'active' : ''}`}
              onClick={() => this.setState({ activeTab: 'patient' })}
            >
              Patient
            </div>
            <div
              className={`login-register-tab ${activeTab === 'doctor' ? 'active' : ''}`}
              onClick={() => this.setState({ activeTab: 'doctor' })}
            >
              Doctor
            </div>
          </div>
          <div>
            <TextField
              fullWidth
              label="Username or Email"
              name="username_or_email"
              value={this.state.username_or_email}
              onChange={this.onChange}
              variant="outlined"
              margin="normal"
              className="login-register-input"
              error={!!errors.username_or_email}
              helperText={errors.username_or_email}
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={this.state.password}
              onChange={this.onChange}
              variant="outlined"
              margin="normal"
              className="login-register-input"
              error={!!errors.password}
              helperText={errors.password}
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={this.login}
              className="login-register-button"
            >
              Sign In as {activeTab === 'patient' ? 'Patient' : 'Doctor'}
            </Button>
          </div>
          {isGoogleScriptLoaded && (
            <div id="google-signin-button" className="login-google-signin"></div>
          )}
          <Typography variant="body2" className="login-register-login-text">
            Don't have an account?
            <Link href="/register" className="login-register-login-link">
              Sign Up
            </Link>
          </Typography>
        </Container>
      </div>
    );
  }
}

export default withRouter(Login);
