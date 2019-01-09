pipeline {
  agent {
    docker {
      image 'node:8.15'
    }

  }
  stages {
    stage('Test') {
      steps {
        sh 'npm install'
        sh 'npm run postinstall'
        sh 'npm run test'
      }
    }
  }
  environment {
    NODE_ENV = 'test'
  }
  post {
    success {
      mail(to: '1965198272@qq.com', subject: "successbul: ${currentBuild.fullDisplayName}", body: 'OK')

    }

    failure {
      mail(to: '1965198272@qq.com', subject: "failure: ${currentBuild.fullDisplayName}", body: 'failure')

    }

  }
}