pipeline {
    agent { docker { image 'node:8.15' } }
    stages {
        stage('install') {
            steps {
                sh 'npm install'
            }
        }
    }
}