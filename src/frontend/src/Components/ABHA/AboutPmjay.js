import React from 'react';
import { Container, Typography, Card, CardContent,  List, ListItem, ListItemIcon, ListItemText, Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';
import { CheckCircle, LocalHospital, Healing, VerifiedUser } from '@material-ui/icons';
import '../../Styles/AboutPmjay.css';
import Header from '../../Header1';

const AboutPmjay = () => {
  return (
    <>
      <Header />
      <Container className="pmjay-container">
        <Typography variant="h3" className="page-title">PM-JAY Schemes:Ayushman Bharat Scheme, Eligibility and Online Registration</Typography>
        

        <Card className="inf0-card">
        <CardContent>
            <Typography>Ayushman Bharat Yojana is a health initiative launched by the Government of India to support the well-being of the underprivileged. On the Pradhan Mantri Jan Arogya Yojana (PM-JAY) website, you can sign up for Ayushman Bharat Yojana. Before applying for Ayushman Bharat Yojana or PMJAY Card, be aware of the eligibility requirements and identify whether you belong to rural or urban category. Ayushman Bharat Yojana benefits include up to 5 lakhs in annual health insurance cover per family.PMJAY registration assures cashless care in accredited private and public hospitals. Additionally, it also covers expensive procedures like coronary artery bypass surgery and knee replacements. The primary benefit of PMJAY scheme is financial security in unexpected situations.</Typography>
        </CardContent>
        </Card>

        
        <Card className="info-card">
  <CardContent>
    <Typography variant="h4" className="section-title">Ayushman Bharat Scheme</Typography>
    <Typography variant="body1" className="section-content">
      Ayushman Bharat Yojana is a health initiative launched by the Government of India to support the well-being of the underprivileged.
      On the Pradhan Mantri Jan Arogya Yojana (PM-JAY) website, you can sign up for Ayushman Bharat Yojana.
      PMJAY registration assures cashless care in accredited private and public hospitals. Additionally, it covers expensive procedures
      like coronary artery bypass surgery and knee replacements. The primary benefit of PMJAY scheme is financial security in unexpected situations.
    </Typography>
    <Typography variant="body1" className="section-content">
      Ayushman Bharat Yojana benefits include up to 5 lakhs in annual health insurance cover per family.
    </Typography>
  </CardContent>
</Card>

<Card className="info-card">
  <CardContent>
    <Typography variant="h4" className="section-title">Features of PM-JAY</Typography>
    <Typography variant="body1" className="section-content">
      PM-JAY is the world's most comprehensive health insurance/guarantee program, fully funded by the government. It offers:
    </Typography>
    <List className="features-list">
      <ListItem>
        <ListItemIcon><CheckCircle className="icon" /></ListItemIcon>
        <ListItemText primary="Cashless access to healthcare services" />
      </ListItem>
      <ListItem>
        <ListItemIcon><CheckCircle className="icon" /></ListItemIcon>
        <ListItemText primary="Pre-hospitalization expenses up to three days covered" />
      </ListItem>
      <ListItem>
        <ListItemIcon><CheckCircle className="icon" /></ListItemIcon>
        <ListItemText primary="Post-hospitalization expenses up to fifteen days covered, including medication and diagnostics" />
      </ListItem>
    </List>
  </CardContent>
</Card>

        
        {/* Eligibility Criteria Section */}
        <Card className="info-card">
          <CardContent>
            <Typography variant="h4" className="section-title">Eligibility Criteria</Typography>
            <List>
              <ListItem>
                <ListItemIcon><VerifiedUser className="icon" /></ListItemIcon>
                <ListItemText primary="Households listed in SECC database and with active RSBY cards are eligible" />
              </ListItem>
              <ListItem>
                <ListItemIcon><VerifiedUser className="icon" /></ListItemIcon>
                <ListItemText primary="Various criteria for rural and urban households" />
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* Benefits of PM-JAY Section */}
        <Card className="info-card">
          <CardContent>
            <Typography variant="h4" className="section-title">Benefits of PM-JAY</Typography>
            <List>
              <ListItem>
                <ListItemIcon><Healing className="icon" /></ListItemIcon>
                <ListItemText primary="Examination, treatment, and counseling" />
              </ListItem>
              <ListItem>
                <ListItemIcon><Healing className="icon" /></ListItemIcon>
                <ListItemText primary="Accommodation and food distribution" />
              </ListItem>
              <ListItem>
                <ListItemIcon><Healing className="icon" /></ListItemIcon>
                <ListItemText primary="Follow-up care after hospitalization for 15 days" />
              </ListItem>
            </List>
          </CardContent>
        </Card>
        {/* List of Diseases Covered Section */}
<Card className="info-card">
  <CardContent>
    <Typography variant="h4" className="section-title">List of Diseases Covered</Typography>
    <List className="disease-list">
      <ListItem className="disease-item">
        <ListItemIcon><LocalHospital className="icon" /></ListItemIcon>
        <ListItemText primary="Prostate cancer" />
      </ListItem>
      <ListItem className="disease-item">
        <ListItemIcon><LocalHospital className="icon" /></ListItemIcon>
        <ListItemText primary="Carotid angioplasty with stent" />
      </ListItem>
      <ListItem className="disease-item">
        <ListItemIcon><LocalHospital className="icon" /></ListItemIcon>
        <ListItemText primary="Skull base surgery" />
      </ListItem>
      <ListItem className="disease-item">
        <ListItemIcon><LocalHospital className="icon" /></ListItemIcon>
        <ListItemText primary="Pulmonary valve surgery" />
      </ListItem>
      <ListItem className="disease-item">
        <ListItemIcon><LocalHospital className="icon" /></ListItemIcon>
        <ListItemText primary="Double valve replacement surgery" />
      </ListItem>
      <ListItem className="disease-item">
        <ListItemIcon><LocalHospital className="icon" /></ListItemIcon>
        <ListItemText primary="Coronary artery transplantation" />
      </ListItem>
      <ListItem className="disease-item">
        <ListItemIcon><LocalHospital className="icon" /></ListItemIcon>
        <ListItemText primary="Anterior spine stabilization" />
      </ListItem>
      <ListItem className="disease-item">
        <ListItemIcon><LocalHospital className="icon" /></ListItemIcon>
        <ListItemText primary="Tissue expander for disfigurement associated with burns" />
      </ListItem>
    </List>
  </CardContent>
</Card>

        
        <Card className="info-card">
  <CardContent>
    <Typography variant="h4" className="section-title">Steps to Find PMJAY Hospitals</Typography>
    <Typography variant="body1" className="section-content">
      A number of hospitals have been empaneled since the implementation of the Ayushman Bharat scheme. As of July 20, 2021, various state and union territory governments have empaneled around 23,300 hospitals under the programme. Official PMJAY website has a list of all PMJAY hospital lists. Here, you can quickly learn how to check the Ayushman card list.
    </Typography>
    <Typography variant="body1" className="section-content">
      However, here is how to find the list of Ayushman card hospitals under the PMJAY program:
    </Typography>
    <ol className="steps-list">
      <li>Step 1: Visit the Hospitals Search page.</li>
      <li>Step 2: Select your district and your state.</li>
      <li>Step 3: Choose whether you want a public, private, for-profit, or private and non-profit hospital.</li>
      <li>Step 4: Choose the medical specialty you need. General, pediatric, neurosurgery, oncology, gynecology, etc., are some examples.</li>
      <li>Step 5: Enter the captcha in the space provided.</li>
      <li>Step 6: Click "Search".</li>
    </ol>
    <Typography variant="body1" className="section-content">
      Ayushman card verification is required before seeking treatment in the hospitals listed in the PMJAY Hospital List PDF.
    </Typography>
  </CardContent>
</Card>

        
        {/* Comparison of Health Insurance Schemes Section */}
        <Card className="info-card">
          <CardContent>
            <Typography variant="h4" className="section-title">Comparison of Health Insurance Schemes</Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Feature</TableCell>
                  <TableCell>Ayushman Bharat Yojana</TableCell>
                  <TableCell>Government Health Insurance Scheme</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Scope</TableCell>
                  <TableCell>Wide range of services</TableCell>
                  <TableCell>Short range of services</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Sum Assured</TableCell>
                  <TableCell>Up to Rs. 5 lakhs</TableCell>
                  <TableCell>Maximum Sum Assured Rs. 1 crore</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Premium</TableCell>
                  <TableCell>Fully paid by the government</TableCell>
                  <TableCell>Rs 200 per month (depending on plan)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Eligibility</TableCell>
                  <TableCell>Low income groups</TableCell>
                  <TableCell>Accessible to all social groups</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Purchase of Policy</TableCell>
                  <TableCell>Policy purchase may take time</TableCell>
                  <TableCell>Policy can be purchased immediately</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Private Hospital Room</TableCell>
                  <TableCell>May or may not be accessible</TableCell>
                  <TableCell>Accessible (depending on plan)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Network Hospitals</TableCell>
                  <TableCell>Substantial network of public and private hospitals</TableCell>
                  <TableCell>Several accredited private hospitals</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Maternity Benefits</TableCell>
                  <TableCell>Accessible (only to a single child under certain cases)</TableCell>
                  <TableCell>Accessible as per plan</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Ambulance Charges</TableCell>
                  <TableCell>Available under some plans</TableCell>
                  <TableCell>Available under most plans</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Domiciliary Hospital Cover</TableCell>
                  <TableCell>Not available</TableCell>
                  <TableCell>Accessible as per plan</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Online Update</TableCell>
                  <TableCell>Either update online or not</TableCell>
                  <TableCell>Online renewal is possible</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Cumulative Bonus</TableCell>
                  <TableCell>Not available here</TableCell>
                  <TableCell>Accessible if no claim has been filed in the previous policy year</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Health Checkup</TableCell>
                  <TableCell>Not covered</TableCell>
                  <TableCell>Some plans include coverage</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Monthly Premium Installment Facility</TableCell>
                  <TableCell>Not available</TableCell>
                  <TableCell>Available under some plans</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      
      </Container>
    </>
  );
}

export default AboutPmjay;
