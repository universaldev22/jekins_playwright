pipeline {
    agent any

    environment {
        NODE_VERSION             = '22'
        TEST_TIMESTAMP           = '2025-05-28 12:04:15'
        PLAYWRIGHT_BROWSERS_PATH = '0'
        CURRENT_USER             = 'waseem'
    }

    options {
        // Allow the initial SCM checkout, but we will re-checkout after cleaning
        skipDefaultCheckout(false)
        timeout(time: 1, unit: 'HOURS')
    }

    stages {
        stage('Setup') {
            steps {
                script {
                    // 1) Wipe out the workspace completely
                    deleteDir()

                    // 2) Re-clone your Git repo so package.json is present
                    checkout scm

                    // 3) Install Node via NVM and dependencies
                    sh '''
                        # Install NVM
                        wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

                        # Load NVM into the shell
                        export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
                        [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

                        # Install & use desired Node version
                        nvm install ${NODE_VERSION}
                        nvm use ${NODE_VERSION}

                        # Install project dependencies
                        npm install
                    '''
                }
            }
        }

        stage('Run Visual Tests') {
            steps {
                script {
                    try {
                        sh '''
                            # Ensure NVM is loaded
                            export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
                            [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

                            # Use correct Node version and run tests
                            nvm use ${NODE_VERSION}
                            npm run test
                        '''
                    } catch (err) {
                        echo "❌ Visual regression tests failed. Archiving artifacts..."
                        archiveArtifacts artifacts: 'test-results/**/*, snapshots/**/*', allowEmptyArchive: true
                        error "Visual regression test failed! See archived snapshots for diffs."
                    }
                }
            }
        }

        stage('Generate and Publish Report') {
            steps {
                script {
                    def reportDir = 'playwright-report'
                    if (!fileExists(reportDir)) {
                        error "HTML report directory '${reportDir}' not found."
                    }
                    publishHTML([
                        reportDir:    reportDir,
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
            User:      ${env.CURRENT_USER}
            """
        }

        failure {
            echo """
            ❌ Pipeline failed!
            Timestamp: ${env.TEST_TIMESTAMP}
            User:      ${env.CURRENT_USER}
            Build URL: ${env.BUILD_URL}
            """
            // Artifacts have already been archived in the Run Visual Tests stage
        }

        cleanup {
            // Final workspace cleanup
            deleteDir()
        }
    }
}
