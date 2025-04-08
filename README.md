# SafeSpace Risk Assessment App
*Authors:*
- Elizabeth Yates (Frontend Developer)
- Kyle Jones (Backend Developer)
- Wesley Hendley (Backend Developer)
- James Wilson (Data Analyst)
- Rafael Cervantes (Cybersecurity)

### 🚀 Tech Stack Overview

| **Area** | **Technologies & Tools** |
| --- | --- |
| **Frontend Framework** | React, Redux Toolkit, Firebase Authentication |
| **Backend Technology** | Flask, SQLAlchemy |
| **Database** | PostgreSQL |
| **APIs & Integrations** | REST API, Python (Pandas, Streamlit), Tableau, OpenAI, Plaid |
| **Cybersecurity** | OWASP ZAP, IAM (RBAC, MFA), Splunk (basic logging) |
| **Hosting & Deployment** | AWS EC2 |

---

### 🛠️ Development Environment Setup:

1. Initialize React frontend application using Redux Toolkit and Firebase Authentication.
2. Set up Flask backend, configure SQLAlchemy for PostgreSQL connection, and define REST API endpoints.
3. Establish data analytics environment utilizing Python Pandas and Streamlit/Tableau for interactive data visualizations.
4. Conduct basic cybersecurity practices including OWASP ZAP scans, role-based access control (RBAC), and multi-factor authentication (MFA).
5. Deploy backend to AWS EC2 ; host frontend using AWS Amplify

---

### Potential Technical Challenges:

- **Data Integration & Pipeline Setup:**
    - Initially work with mock financial datasets in CSV format.
    - Develop basic ETL pipelines using Python and Pandas for data processing.
- **Advanced Analytics Visualization:**
    - Prototype visualizations using Streamlit or Tableau.
    - Gradually implement predictive analytics as an optional advanced feature.

---

## Interaction with Financial Data & Testing Approach:

- **Interaction:** Data sourced from CSV files or API endpoints, processed and transformed using Pandas pipelines, served via Flask REST APIs.
- **Testing:** Begin testing with CSV data, evolving toward integrating real-time data sources or mocked API data streams as the project progresses.

### Core Features:

- Secure user authentication and role-based access management.
- Dynamic financial risk dashboards with real-time data visualization.
- Robust ETL pipelines for data integration and transformation.
- Predictive analytics capabilities for risk assessment (optional stretch goal), leveraging OpenAI API to enhance forecasting accuracy and insights.
- Comprehensive logging, monitoring, and cybersecurity measures.