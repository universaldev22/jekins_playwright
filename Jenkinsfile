pipeline {
    agent any

    environment {
        NODE_VERSION           = '22'
        TEST_TIMESTAMP         = '2025-05-28 12:04:15'
        PLAYWRIGHT_BROWSERS_PATH = '0'
        CURRENT_USER           = 'waseem'
    }

    options {
        skipDefaultCheckout(false)
        timeout(time: 1, unit: 'HOURS')
    }

    stages {
        stage('Setup') {
            steps {
                script {
                    // Clean workspace and prepare environment
                    deleteDir()

                    // Install Node.js using NVM
                    sh '''
                        wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
                        export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
                        [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"  # source nvm

                        nvm install ${NODE_VERSION}
                        nvm use ${NODE_VERSION}

                        # Install dependencies
                        npm install
                    '''
                }
            }
        }

        stage('Run Visual Tests') {
            steps {
                script {
                    try {
                        // Run Playwright tests
                        sh '''
                            . "$NVM_DIR/nvm.sh"
                            nvm use ${NODE_VERSION}
                            npm run test
                        '''
                    } catch (err) {
                        // Handle failure gracefully and collect artifacts
                        echo "Tests failed. Archiving results and artifacts."
                        archiveArtifacts artifacts: 'test-results/**/*,snapshots/**/*', allowEmptyArchive: true
                        error "Visual regression test failed! Check the test results."
                    }
                }
            }
        }

        stage('Generate and Publish Report') {
            steps {
                script {
                    // Ensure Playwright report exists
                    def reportPath = 'playwright-report'
                    if (!fileExists(reportPath)) {
                        error "Specified HTML directory '${reportPath}' does not exist."
                    }

                    // Publish report using HTML Publisher Plugin
                    publishHTML([
                        reportDir:    reportPath,
                        reportFiles:  'index.html',
                        reportName:   'Playwright Test Report',
                        keepAll:      true,
                        allowMissing: false
                    ])
                }
            }
        }
    }

    post {
        success {
            echo """
            ✅ Pipeline completed successfully
            Timestamp: ${env.TEST_TIMESTAMP}
            User: ${env.CURRENT_USER}
            """
        }

        failure {
            mail(
                to:      'waz92dev@gmail.com',
                subject: "❌ Pipeline Failed: ${currentBuild.fullDisplayName}",
                body:    """
                The pipeline failed during execution.

                Timestamp: ${env.TEST_TIMESTAMP}
                User: ${env.CURRENT_USER}
                Build URL: ${env.BUILD_URL}

                Please check the logs and artifacts for further details.
                """
            )
        }

        cleanup {
            deleteDir()
        }
    }
}
