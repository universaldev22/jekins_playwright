pipeline {
    agent any

    environment {
        NODE_VERSION             = '22'
        TEST_TIMESTAMP           = '2025-05-28 12:04:15'
        PLAYWRIGHT_BROWSERS_PATH = '0'
        CURRENT_USER             = 'waseem'
    }

    options {
        skipDefaultCheckout(false)
        timeout(time: 1, unit: 'HOURS')
    }

    stages {
        stage('Setup') {
            steps {
                script {
                    // Clean workspace and re‐checkout repo
                    deleteDir()
                    checkout scm

                    // Install NVM, Node.js, and npm deps
                    sh '''
                        wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
                        export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
                        [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

                        nvm install ${NODE_VERSION}
                        nvm use    ${NODE_VERSION}

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
                            # Load NVM & use correct Node
                            export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
                            [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
                            nvm use ${NODE_VERSION}

                            # Run Playwright with HTML reporter
                            npx playwright test --reporter=list,html
                        '''
                    } catch (err) {
                        echo "❌ Tests failed. Archiving screenshots and test results."
                        archiveArtifacts artifacts: 'tests/__screenshots__/**/*, test-results/**/*', allowEmptyArchive: true
                        error "Visual regression tests failed—see archived artifacts."
                    }
                }
            }
        }

        stage('Publish HTML Report') {
            steps {
                script {
                    // Playwright's HTML reporter always writes to "playwright-report"
                    def reportDir = 'playwright-report'
                    if (!fileExists(reportDir)) {
                        error "HTML report directory '${reportDir}' not found!"
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
            // Artifacts (screenshots + test-results) were already archived on failure
        }
        cleanup {
            deleteDir()
        }
    }
}
