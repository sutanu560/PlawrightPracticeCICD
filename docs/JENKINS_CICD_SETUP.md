# Jenkins CI/CD Setup for Playwright on AWS EC2

This guide walks you through running the Playwright pipeline on Jenkins (on an EC2 instance), triggering on push to `main`, and emailing the test report.

---

## 1. EC2 instance

- Launch an **Amazon Linux 2** or **Ubuntu** EC2 instance (e.g. `t3.medium` for enough memory for browsers).
- Open in security group: **22** (SSH), **8080** (Jenkins UI).
- Connect via SSH.

---

## 2. Install Java (required for Jenkins)

**Amazon Linux 2 / RHEL:**
```bash
sudo yum update -y
sudo yum install -y java-11-openjdk-devel
java -version
```

**Ubuntu:**
```bash
sudo apt update
sudo apt install -y openjdk-11-jdk
java -version
```

---

## 3. Install Jenkins

**Amazon Linux 2:**
```bash
sudo wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo
sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key
sudo yum install -y jenkins
sudo systemctl enable jenkins
sudo systemctl start jenkins
sudo systemctl status jenkins
```

**Ubuntu:**
```bash
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee /usr/share/keyrings/jenkins-keyring.asc > /dev/null
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/ | sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null
sudo apt update
sudo apt install -y jenkins
sudo systemctl enable jenkins
sudo systemctl start jenkins
```

Get initial admin password:
```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

Open `http://<EC2-PUBLIC-IP>:8080`, paste the password, complete setup, and install suggested plugins.

---

## 4. Install Node.js on the EC2 (for Playwright)

Jenkins will run `npm` and `npx` on the same machine, so Node must be installed globally (or use a Node tool in Jenkins).

```bash
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs
# or on Ubuntu:
# curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
# sudo apt install -y nodejs

node -v
npm -v
```

Ensure the Jenkins process can use this Node (e.g. run Jenkins as a user that has `node` and `npm` in PATH, or use full path in the pipeline). Alternatively, in Jenkins **Manage Jenkins → Global Tool Configuration** add **NodeJS** and select it in the job.

---

## 5. Install required Jenkins plugins

**Manage Jenkins → Manage Plugins → Available:**

- **Git**
- **Pipeline**
- **GitHub Plugin** (for “Build when a change is pushed to GitHub”)
- **Pipeline: Stage View**
- **Email Extension** (for `emailext` in the pipeline)
- **HTML Publisher** (for “Publish HTML reports” / Playwright report)

Install and restart Jenkins if prompted.

---

## 6. Configure SMTP (for email)

**Manage Jenkins → System → E-mail Notification** (or **Extended E-mail Notification**):

- SMTP server: e.g. `smtp.gmail.com` (for Gmail use App Password), or your company SMTP.
- Use SMTP Authentication: yes.
- User name / Password: your SMTP credentials.
- Use TLS: yes (for Gmail).
- Default user e-mail suffix: your domain if needed.

**Extended E-mail Notification** (if you use it):

- Same SMTP settings.
- Default Content Type: HTML.
- Default Recipients: can leave empty if you set `EMAIL_RECIPIENTS` per job.

---

## 7. Create the Pipeline job

1. **New Item** → name (e.g. `Playwright-CICD`) → **Pipeline** → OK.
2. **General**
   - Optionally restrict to run on `main`: under **Branch sources** or **Pipeline** section, you’ll specify the branch in the pipeline from SCM.
3. **Build Triggers**
   - Check **Build when a change is pushed to GitHub** (GitHub webhook trigger).
   - Optionally **Poll SCM** with schedule `H/5 * * * *` as backup (every 5 minutes).
4. **Pipeline**
   - Definition: **Pipeline script from SCM**
   - SCM: **Git**
   - Repository URL: `https://github.com/sutanu560/PlawrightPracticeCICD.git`
   - Credentials: add **Username + Password** (GitHub username + Personal Access Token with `repo` scope) if the repo is private; leave empty if public.
   - Branch: `*/main`
   - Script Path: `Jenkinsfile`
5. **Environment (optional)**  
   Add a variable:
   - Name: `EMAIL_RECIPIENTS`  
   - Value: `your-email@example.com` (comma-separated for multiple).
6. Save.

---

## 8. GitHub webhook (trigger on push to main)

1. On GitHub: repo **Settings → Webhooks → Add webhook**.
2. **Payload URL:** `http://<EC2-PUBLIC-IP>:8080/github-webhook/`
   - If Jenkins is behind HTTPS or a domain, use that URL and `/github-webhook/` at the end.
3. **Content type:** `application/json`.
4. **Which events:** “Just the push event” (or “Let me select…” and choose **Push**).
5. Save. Optionally under **Recent Deliveries** check that delivery succeeds (200).

So: **any push to `main`** will send a webhook to Jenkins and trigger the pipeline (as long as “Build when a change is pushed to GitHub” is checked).

---

## 9. Run the pipeline and get the report in email

- **First run:** click **Build Now** to verify the pipeline (checkout → install deps → install Playwright browsers → run tests → publish HTML report).
- After that, every **push to `main`** will trigger the same pipeline.

The **Playwright HTML report** is published as “Playwright HTML Report” in the build. The email sent by the pipeline includes:

- Build status (SUCCESS/FAILURE).
- Link to the build.
- Link to the **Playwright HTML Report** (same report you see in Jenkins).

Recipients are taken from the job environment variable **EMAIL_RECIPIENTS** (or **JENKINS_EMAIL_RECIPIENTS**). Set one of these in the job (or globally) so the report email is sent to the right address.

---

## 10. Summary

| Step | What you did |
|------|------------------|
| EC2 | Launched instance, opened 8080, 22 |
| Java + Jenkins | Installed and started Jenkins, unlocked with initial password |
| Node.js | Installed so `npm` / `npx playwright` run on the agent |
| Plugins | Git, Pipeline, GitHub, Email Extension, HTML Publisher |
| SMTP | Configured in Jenkins so emails can be sent |
| Job | Pipeline from SCM, repo + branch `main`, script path `Jenkinsfile` |
| Trigger | “Build when a change is pushed to GitHub” + GitHub webhook on push |
| Email | Set `EMAIL_RECIPIENTS` so the pipeline can send the report link by email |

After this, **every push to `main`** triggers the pipeline, runs Playwright tests, publishes the report in Jenkins, and sends an email with the build result and a link to the Playwright report.
