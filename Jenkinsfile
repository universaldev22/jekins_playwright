pipeline {
    agent any

    environment {
        NODE_VERSION = '16'
        TEST_TIMESTAMP = '2025-05-28 11:09:35'
        PLAYWRIGHT_BROWSERS_PATH = '0'
        CURRENT_USER = 'waseem'
    }

    options {
        skipDefaultCheckout(false)
        buildDiscarder(logRotator(daysToKeepStr: '10'))
        timeout(time: 1, unit: 'HOURS')
    }

    stages {
        stage('Setup') {
            steps {
                nodejs(nodeJSInstallationName: "Node ${NODE_VERSION}") {
                    sh 'npm install'
                }
            }
        }

        stage('Run Visual Tests') {
            steps {
                nodejs(nodeJSInstallationName: "Node ${NODE_VERSION}") {
                    script {
                        try {
                            sh 'npm test'
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
        always {
            publishHTML([
                allowMissing: true,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright Report',
                reportTitles: "Visual Tests Report - ${env.TEST_TIMESTAMP}"
            ])
        }
        
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
                Report: ${BUILD_URL}PlaywrightReport/
                
                Please check the test results and visual diffs in the build artifacts.
                """,
                recipientProviders: [[$class: 'DevelopersRecipientProvider']],
                attachLog: true
            )
        }
        
        cleanup {
            dir("${env.WORKSPACE}") {
                deleteDir()
            }
        }
    }
}