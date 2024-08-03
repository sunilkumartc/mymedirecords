import React, { Component } from "react";
import swal from "sweetalert";
import { Button, TextField, Link, Typography, Container } from "@material-ui/core";
import { withRouter } from "../utils";
import Header from "../Header1";
import '../Styles/Login.css'; // Use the same CSS file as Login page
const axios = require("axios");

class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      email: '',
      password: '',
      confirm_password: '',
      phone: '', // Added state for phone number
      activeTab: 'patient', // Default active tab
      certificate_no: '', // State for doctor's certificate number
      isGoogleScriptLoaded: false,
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
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID, // Use environment variable
        callback: this.handleCredentialResponse,
      });
      window.google.accounts.id.renderButton(
        document.getElementById("google-signin-button"),
        { theme: "outline", size: "large" } // Customization attributes
      );
    }
  }

  handleCredentialResponse = (response) => {
    axios.post(`${process.env.REACT_APP_API_BASE_URL}/google-login`, {
      id_token: response.credential
    }).then(res => {
      // Handle successful login
      const { name, email, phone, id } = res.data;

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user_id', id);
      localStorage.setItem('username', name);
      localStorage.setItem('phone', phone);
      localStorage.setItem('email', email);
      localStorage.setItem('loggedIn', 'true'); // Set flag indicating user is logged in
      this.props.navigate("/HomeDashboard", { state: { name, email, phone } });
    }).catch(err => {
      console.error('Google Sign-In failed:', err);
      swal({
        text: 'Google Sign-In failed. Please try again.',
        icon: "error",
      });
    });
  }

  onChange = (e) => this.setState({ [e.target.name]: e.target.value });

  register = () => {
    const { username, email, password, confirm_password, phone, certificate_no } = this.state;

    if (password !== confirm_password) {
      swal({
        text: 'Passwords do not match',
        icon: "error",
      });
      return;
    }

    axios.post(`${process.env.REACT_APP_API_BASE_URL}/register`, {
      username: username,
      email: email,
      password: password,
      phone: phone, // Include phone number in registration request
      user_type: this.state.activeTab === 'patient' ? 'patient' : 'doctor',
      certificate_no: certificate_no // Include certificate number for doctors
    }).then((res) => {
      swal({
        text: 'Registration successful',
        icon: "success",
      }).then(() => {
        this.props.navigate("/login");
      });
    }).catch((err) => {
      if (err.response && err.response.data && err.response.data.errorMessage) {
        swal({
          text: err.response.data.errorMessage,
          icon: "error",
        });
      }
    });
  }

  render() {
    const { activeTab, isGoogleScriptLoaded } = this.state;

    return (
      <div className="login-register-container">
        <Header />
        <Container maxWidth="sm" className="login-register-form-container">
          <Typography variant="h6" gutterBottom className="login-register-title">
            Sign Up
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
          <div className="login-register-form">
            <TextField
              variant="outlined"
              label="username"
              type="text"
              autoComplete="off"
              name="username"
              value={this.state.username}
              onChange={this.onChange}
              required
              fullWidth
              margin="dense" // Add margin to increase spacing
              className="login-register-input"
            />
            <TextField
              variant="outlined"
              label="email"
              type="email"
              autoComplete="off"
              name="email"
              value={this.state.email}
              onChange={this.onChange}
              required
              fullWidth
              margin="dense" // Add margin to increase spacing
              className="login-register-input"
            />
            <TextField
              variant="outlined"
              label="Password"
              type="password"
              autoComplete="off"
              name="password"
              value={this.state.password}
              onChange={this.onChange}
              required
              fullWidth
              margin="dense" // Add margin to increase spacing
              className="login-register-input"
            />
            <TextField
              variant="outlined"
              label="Confirm_Password"
              type="password"
              autoComplete="off"
              name="confirm_password"
              value={this.state.confirm_password}
              onChange={this.onChange}
              required
              fullWidth
              margin="dense" // Add margin to increase spacing
              className="login-register-input"
            />
            <TextField
              variant="outlined"
              label="phone"
              type="text"
              autoComplete="off"
              name="phone"
              value={this.state.phone}
              onChange={this.onChange}
              required
              fullWidth
              margin="dense" // Add margin to increase spacing
              className="login-register-input"
            />
            {activeTab === 'doctor' && (
              <TextField
                variant="outlined"
                label="Certificate Number"
                type="text"
                autoComplete="off"
                name="certificate_no"
                value={this.state.certificate_no}
                onChange={this.onChange}
                required
                fullWidth
                margin="dense" // Add margin to increase spacing
                className="login-register-input"
              />
            )}
            <Button
              variant="contained"
              size="large"
              disabled={this.state.username === '' || this.state.email === '' || this.state.password === '' || this.state.confirm_password === '' || (activeTab === 'doctor' && this.state.certificate_no === '')}
              onClick={this.register}
              fullWidth
              className="login-register-button"
            >
              Register as {activeTab === 'patient' ? 'Patient' : 'Doctor'}
            </Button>

            <div className="login-google-signin">
              <div id="google-signin-button"></div>
            </div>
            <Typography variant="body2" className="login-register-login-text">
              Already have an account?{" "}
              <Link href="/login" className="login-register-login-link">
                Sign In
              </Link>
            </Typography>
          </div>
        </Container>
      </div>
    );
  }
}

export default withRouter(Register);
