pipeline {
  agent any

  options {
    buildDiscarder(logRotator(numToKeepStr: '10'))
    timeout(time: 30, unit: 'MINUTES')
    timestamps()
  }

  triggers {
    // Backup: poll main every 5 min if webhook is not set up
    pollSCM('H/5 * * * *')
  }

  environment {
    CI = 'true'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install Dependencies') {
      steps {
        sh 'npm ci'
      }
    }

    stage('Install Playwright Browsers') {
      steps {
        // Install only Chromium for faster CI; use 'npx playwright install' for all browsers
        sh 'npx playwright install chromium --with-deps'
      }
    }

    stage('Run Playwright Tests') {
      steps {
        sh 'npx playwright test --project=chromium'
      }
      post {
        always {
          publishHTML([
            reportDir: 'playwright-report',
            reportFiles: 'index.html',
            reportName: 'Playwright HTML Report',
            reportTitles: 'Playwright Report',
            allowMissing: true,
            keepAll: true
          ])
          archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true
          archiveArtifacts artifacts: 'test-results/**', allowEmptyArchive: true
        }
      }
    }
  }

  post {
    always {
      script {
        def reportUrl = "${env.BUILD_URL}Playwright_20HTML_20Report/"
        def status = currentBuild.currentResult
        def color = (status == 'SUCCESS') ? 'green' : 'red'
        def recipients = env.EMAIL_RECIPIENTS ?: env.JENKINS_EMAIL_RECIPIENTS ?: ''
        if (recipients) {
          emailext(
            subject: "[${status}] Playwright Tests - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
            body: """
              <p>Build result: <strong style="color: ${color}">${status}</strong></p>
              <p><a href="${env.BUILD_URL}">Build #${env.BUILD_NUMBER}</a></p>
              <p><a href="${reportUrl}">Open Playwright HTML Report</a></p>
              <p>Triggered by push to <b>main</b>.</p>
            """,
            mimeType: 'text/html',
            to: recipients,
            attachLog: true
          )
        }
      }
    }
  }
}
