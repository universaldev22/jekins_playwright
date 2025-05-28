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
                    deleteDir()
                    sh '''
                        wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
                        export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
                        [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

                        nvm install ${NODE_VERSION}
                        nvm use ${NODE_VERSION}
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
                            . "$NVM_DIR/nvm.sh"
                            nvm use ${NODE_VERSION}
                            npm run test
                        '''
                    } catch (err) {
                        echo "❌ Tests failed. Archiving results and artifacts."
                        archiveArtifacts artifacts: 'test-results/**/*,snapshots/**/*', allowEmptyArchive: true
                        error "Visual regression test failed! Check the archived artifacts."
                    }
                }
            }
        }

        stage('Generate and Publish Report') {
            steps {
                script {
                    def reportPath = 'playwright-report'
                    if (!fileExists(reportPath)) {
                        error "HTML report directory '${reportPath}' not found."
                    }
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
            // Artifacts were already archived in the Run Visual Tests stage
        }

        cleanup {
            deleteDir()
        }
    }
}
