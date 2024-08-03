import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import App from "./Pages/App";
import HomeDashboard from "./Components/HomeDashboard";
import PrivateRoute from "./Components/common/PrivateRoute"; // Import the PrivateRoute component
import DoctorDashboard from "./Components/DoctorDashboard";
import CreateABHA from "./Components/ABHA/CreateABHA";
import AboutABDM from "./Components/ABHA/AboutABDM";
import AboutPmjay from "./Components/ABHA/AboutPmjay";
import DoctorInfo from "./Components/DoctorInfo";
import TrashPage from "./Components/DashbordCompo/TrashPage";
import GetABHACard from './Components/ABHA/GetABHACard';
import NewABHACard from './Components/ABHA/NewABHACard';
import LoginABHA from './Components/ABHA/LoginABHA';
import ABHAProfile from './Components/ABHA/ABHAProfile';
import ABHAPhoneLogin from './Components/ABHA/ABHAPhoneLogin';
import CreateABHACard from './Components/ABHA/CreateABHACard';
import ABHAadharLogin from "./Components/ABHA/ABHAadharLogin";

ReactDOM.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/CreateABHA" element={<CreateABHA />} />
      <Route path="/createABHACard" element={<CreateABHACard />} />
      <Route path="/AboutABDM" element={<AboutABDM />} />
      <Route path="/AboutPmjay" element={<AboutPmjay />} />
      <Route path="/getABHACard" element={<GetABHACard />} />
      <Route path="/newabhacard" element={<NewABHACard />} />
      <Route path="/DoctorInfo" element={<DoctorInfo />} />
      <Route path="/LoginABHA" element={<LoginABHA />} />
      <Route path="/ABHAProfile" element={<ABHAProfile />} />
      <Route path="/ABHAPhoneLogin" element={<ABHAPhoneLogin />} />
      <Route path="/ABHAadharLogin" element={<ABHAadharLogin />} />
      <Route path="/TrashPage" element={<TrashPage />} />
      <Route path="/HomeDashboard" element={<PrivateRoute element={<HomeDashboard />} />} />
      <Route path="/DoctorDashboard" element={<PrivateRoute element={<DoctorDashboard />} />} />
    </Routes>
  </BrowserRouter>,
  document.getElementById("root")
);
