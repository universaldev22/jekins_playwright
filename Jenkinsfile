pipeline {
    agent any

    environment {
        NODE_VERSION = '22'
        TEST_TIMESTAMP = '2025-05-28 11:51:48'
        PLAYWRIGHT_BROWSERS_PATH = '0'
        CURRENT_USER = 'nufiansyah'
    }

    options {
        skipDefaultCheckout(false)
        buildDiscarder(logRotator(daysToKeepStr: '10'))
        timeout(time: 1, unit: 'HOURS')
    }

    stages {
        stage('Setup') {
            steps {
                sh '''
                    export NVM_DIR="$HOME/.nvm"
                    [ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"
                    nvm install ${NODE_VERSION}
                    nvm use ${NODE_VERSION}
                    npm install
                '''
            }
        }

        stage('Run Visual Tests') {
            steps {
                script {
                    try {
                        sh '''
                            export NVM_DIR="$HOME/.nvm"
                            [ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"
                            nvm use ${NODE_VERSION}
                            npm test
                        '''
                    } catch (err) {
                        archiveArtifacts artifacts: [
                            'test-results/**/*',
                            'snapshots/**/*'
                        ].join(','), allowEmptyArchive: true
                        
                        error "Visual regression test failed! Check the test results."
                    }
                }
            }
        }

        stage('Archive Report') {
            steps {
                archiveArtifacts artifacts: [
                    'playwright-report/**/*',
                    'test-report/**/*'
                ].join(','), allowEmptyArchive: true
            }
        }
    }

    post {
        success {
            echo """
            ✅ Visual regression test completed successfully
            Timestamp: ${env.TEST_TIMESTAMP}
            User: ${env.CURRENT_USER}
            """
        }
        
        failure {
            emailext (
                subject: "❌ Visual Regression Test Failed: ${currentBuild.fullDisplayName}",
                body: """
                Visual Regression Test Failure Report
                
                Timestamp: ${env.TEST_TIMESTAMP}
                User: ${env.CURRENT_USER}
                Build URL: ${BUILD_URL}
                
                Please check the test results and visual diffs in the build artifacts.
                """,
                recipientProviders: [[$class: 'DevelopersRecipientProvider']],
                attachLog: true
            )
        }
        
        cleanup {
            cleanWs()
        }
    }
}